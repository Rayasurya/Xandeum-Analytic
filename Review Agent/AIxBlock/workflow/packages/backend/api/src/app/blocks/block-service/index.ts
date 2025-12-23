import { FastifyBaseLogger } from 'fastify'
import { EngineHelperExtractPieceInformation, EngineHelperResponse } from 'server-worker'
import { BlockMetadata, BlockMetadataModel } from 'workflow-blocks-framework'
import { AppSystemProp, UserInteractionJobType } from 'workflow-server-shared'
import {
    AddBlockRequestBody,
    AIxBlockError,
    ApEdition,
    BlockPackage,
    BlockScope,
    BlockType,
    EngineResponseStatus,
    ErrorCode,
    ExecuteExtractBlockMetadata,
    ExecutionMode,
    FileCompression,
    FileId,
    FileType,
    isNil,
    PackageType,
    PlatformId,
    ProjectId
} from 'workflow-shared'
import { fileService } from '../../file/file.service'
import { system } from '../../helper/system/system'
import { userInteractionWatcher } from '../../workers/user-interaction-watcher'
import { blockMetadataService } from '../block-metadata-service'

export const blockService = (log: FastifyBaseLogger) => ({
    async installBlock(
        platformId: string,
        projectId: string | undefined,
        params: AddBlockRequestBody,
    ): Promise<BlockMetadataModel> {
        assertInstallProjectEnabled(params.scope)
        try {
            const blockPackage = await saveBlockPackage(platformId, projectId, params, log)
            const blockInformation = await extractBlockInformation(blockPackage, projectId, platformId, log)
            const archiveId = blockPackage.packageType === PackageType.ARCHIVE ? blockPackage.archiveId : undefined
            const savedBlock = await blockMetadataService(log).create({
                blockMetadata: {
                    ...blockInformation,
                    minimumSupportedRelease:
                        blockInformation.minimumSupportedRelease ?? '0.0.0',
                    maximumSupportedRelease:
                        blockInformation.maximumSupportedRelease ?? '999.999.999',
                    name: blockInformation.name,
                    version: blockInformation.version,
                },
                // TODO (@abuaboud) delete after migrating everyone to their own platform
                projectId: undefined,
                packageType: params.packageType,
                platformId,
                blockType: BlockType.CUSTOM,
                archiveId,
            })

            return savedBlock
        }
        catch (error) {
            log.error(error, '[BlockService#add]')

            if ((error as AIxBlockError).error.code === ErrorCode.VALIDATION) {
                throw error
            }
            throw new AIxBlockError({
                code: ErrorCode.ENGINE_OPERATION_FAILURE,
                params: {
                    message: JSON.stringify(error),
                },
            })
        }
    },
})

const assertInstallProjectEnabled = (scope: BlockScope): void => {
    if (scope === BlockScope.PROJECT) {
        const sandboxMode = system.getOrThrow(AppSystemProp.EXECUTION_MODE)
        const edition = system.getEdition()
        if (
            sandboxMode === ExecutionMode.UNSANDBOXED &&
            [ApEdition.ENTERPRISE, ApEdition.CLOUD].includes(edition)
        ) {
            throw new AIxBlockError({
                code: ErrorCode.AUTHORIZATION,
                params: {
                    message:
                        'Project blocks are not supported in this edition with unsandboxed execution mode',
                },
            })
        }
    }
}

async function saveBlockPackage(platformId: string | undefined, projectId: string | undefined, params: AddBlockRequestBody, log: FastifyBaseLogger): Promise<BlockPackage> {
    switch (params.packageType) {
        case PackageType.ARCHIVE: {
            const archiveId = await saveArchive({
                projectId: undefined,
                platformId,
                archive: params.pieceArchive.data as Buffer,
            }, log)
            return {
                ...params,
                blockType: BlockType.CUSTOM,
                archiveId,
                archive: undefined,
                packageType: params.packageType,
            }
        }

        case PackageType.REGISTRY: {
            return {
                ...params,
                blockType: BlockType.CUSTOM,
            }
        }
    }
}

const extractBlockInformation = async (request: ExecuteExtractBlockMetadata, projectId: string | undefined, platformId: string, log: FastifyBaseLogger): Promise<BlockMetadata> => {
    const engineResponse = await userInteractionWatcher(log).submitAndWaitForResponse<EngineHelperResponse<EngineHelperExtractPieceInformation>>({
        jobType: UserInteractionJobType.EXECUTE_EXTRACT_BLOCK_INFORMATION,
        piece: request,
        projectId,
        platformId,
    })

    if (engineResponse.status !== EngineResponseStatus.OK) {
        throw new Error(engineResponse.standardError)
    }
    return engineResponse.result
}

const saveArchive = async (
    params: GetBlockArchivePackageParams,
    log: FastifyBaseLogger,
): Promise<FileId> => {
    const { projectId, platformId, archive } = params

    const archiveFile = await fileService(log).save({
        projectId: isNil(platformId) ? projectId : undefined,
        platformId,
        data: archive,
        size: archive.length,
        type: FileType.PACKAGE_ARCHIVE,
        compression: FileCompression.NONE,
    })

    return archiveFile.id
}

type GetBlockArchivePackageParams = {
    archive: Buffer
    projectId?: ProjectId
    platformId?: PlatformId
}
