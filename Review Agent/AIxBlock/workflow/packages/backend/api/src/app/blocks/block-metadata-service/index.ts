import { FastifyBaseLogger } from 'fastify'
import { BlockMetadataModel, BlockMetadataModelSummary } from 'workflow-blocks-framework'
import { AppSystemProp, BlocksSource } from 'workflow-server-shared'
import {
    assertNotNullOrUndefined,
    BlockPackage,
    PackageType,
    PlatformId,
    PrivateBlockPackage,
    PublicBlockPackage,
    SuggestionType
} from 'workflow-shared'
import { system } from '../../helper/system/system'
import { BlockMetadataSchema } from '../block-metadata-entity'
import { BlockMetadataService } from './block-metadata-service'
import { FastDbBlockMetadataService } from './db-block-metadata-service'
import { FileBlockMetadataService } from './file-block-metadata-service'


export const blockMetadataService = (log: FastifyBaseLogger): BlockMetadataService => {
    const source = system.getOrThrow<BlocksSource>(AppSystemProp.BLOCKS_SOURCE)
    switch (source) {
        case BlocksSource.DB:
        case BlocksSource.CLOUD_AND_DB:
            return FastDbBlockMetadataService(log)
        case BlocksSource.FILE:
            return FileBlockMetadataService(log)
    }
}

export const getBlockPackageWithoutArchive = async (
    log: FastifyBaseLogger,
    projectId: string | undefined,
    platformId: PlatformId | undefined,
    pkg: Omit<PublicBlockPackage, 'directoryPath'> | Omit<PrivateBlockPackage, 'archiveId' | 'archive'>,
): Promise<BlockPackage> => {
    const blockMetadata = await blockMetadataService(log).getOrThrow({
        name: pkg.blockName,
        version: pkg.pieceVersion,
        projectId,
        platformId,
    })
    switch (pkg.packageType) {
        case PackageType.ARCHIVE: {
            return {
                packageType: PackageType.ARCHIVE,
                blockName: pkg.blockName,
                pieceVersion: blockMetadata.version,
                blockType: pkg.blockType,
                archiveId: blockMetadata.archiveId!,
                archive: undefined,
            }
        }
        case PackageType.REGISTRY: {
            return {
                packageType: PackageType.REGISTRY,
                blockName: pkg.blockName,
                pieceVersion: blockMetadata.version,
                blockType: pkg.blockType,
            }
        }
    }
}

export function toBlockMetadataModelSummary<T extends BlockMetadataSchema | BlockMetadataModel>(
    blockMetadataEntityList: T[],
    originalMetadataList: T[],
    suggestionType?: SuggestionType,
): BlockMetadataModelSummary[] {
    return blockMetadataEntityList.map((blockMetadataEntity) => {
        const originalMetadata = originalMetadataList.find((p) => p.name === blockMetadataEntity.name)
        assertNotNullOrUndefined(originalMetadata, `Original metadata not found for ${blockMetadataEntity.name}`)
        return {
            ...blockMetadataEntity,
            actions: Object.keys(originalMetadata.actions).length,
            triggers: Object.keys(originalMetadata.triggers).length,
            rawActions: originalMetadata.actions,
            rawTriggers: originalMetadata.triggers,
            suggestedActions: suggestionType === SuggestionType.ACTION || suggestionType === SuggestionType.ACTION_AND_TRIGGER ?
                Object.values(blockMetadataEntity.actions) : undefined,
            suggestedTriggers: suggestionType === SuggestionType.TRIGGER || suggestionType === SuggestionType.ACTION_AND_TRIGGER ?
                Object.values(blockMetadataEntity.triggers) : undefined,
        }
    })
}
