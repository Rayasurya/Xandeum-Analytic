import { FastifyBaseLogger } from 'fastify'
import {
    Action,
    ActionType,
    assertEqual,
    BlockPackage,
    BlockType,
    CodeAction,
    EXACT_VERSION_REGEX,
    flowStructureUtil,
    FlowVersion,
    isNil,
    PackageType,
    PieceActionSettings,
    PieceTriggerSettings,
    Step,
    Trigger,
    TriggerType
} from 'workflow-shared'
import { engineApiService } from '../api/server-api.service'
import { CodeArtifact } from './engine-runner'

type ExtractFlowPiecesParams = {
    flowVersion: FlowVersion
    engineToken: string
}

export const pieceEngineUtil = (log: FastifyBaseLogger) => ({
    getCodeSteps(flowVersion: FlowVersion): CodeArtifact[] {
        const steps = flowStructureUtil.getAllSteps(flowVersion.trigger)
        return steps.filter((step) => step.type === ActionType.CODE).map((step) => {
            const codeAction = step as CodeAction
            return {
                name: codeAction.name,
                flowVersionId: flowVersion.id,
                flowVersionState: flowVersion.state,
                sourceCode: codeAction.settings.sourceCode,
            }
        })
    },
    async extractFlowPieces({
        flowVersion,
        engineToken,
    }: ExtractFlowPiecesParams): Promise<BlockPackage[]> {
        const steps = flowStructureUtil.getAllSteps(flowVersion.trigger)
        const pieces = steps.filter((step) => step.type === TriggerType.PIECE || step.type === ActionType.PIECE).map((step) => {
            const { packageType, blockType, blockName, pieceVersion } = step.settings as PieceTriggerSettings | PieceActionSettings
            return pieceEngineUtil(log).getExactPieceVersion(engineToken, {
                packageType,
                blockType,
                blockName,
                pieceVersion,
            })
        })
        return Promise.all(pieces)
    },
    async getTriggerPiece(engineToken: string, flowVersion: FlowVersion): Promise<BlockPackage> {
        assertEqual(flowVersion.trigger.type, TriggerType.PIECE, 'trigger.type', 'PIECE')
        const { trigger } = flowVersion
        return this.getExactPieceForStep(engineToken, trigger)
    },
    async getExactPieceVersion(engineToken: string, piece: BasicBlockInformation): Promise<BlockPackage> {
        const { blockName, pieceVersion, blockType, packageType } = piece

        switch (packageType) {
            case PackageType.ARCHIVE: {
                const { pieceVersion, archiveId } = await getPieceVersionAndArchiveId(engineToken, piece, log)

                const archive = await engineApiService(engineToken, log).getFile(archiveId!)

                return {
                    packageType,
                    blockType,
                    blockName,
                    pieceVersion,
                    archiveId: archiveId!,
                    archive,
                }
            }
            case PackageType.REGISTRY: {
                const exactVersion = EXACT_VERSION_REGEX.test(pieceVersion)
                const version = exactVersion ? pieceVersion : (await engineApiService(engineToken, log).getPiece(blockName, {
                    version: pieceVersion,
                })).version
                return {
                    packageType,
                    blockType,
                    blockName,
                    pieceVersion: version,
                }

            }
        }
    },
    async getExactPieceForStep(engineToken: string, step: Action | Trigger): Promise<BlockPackage> {
        const pieceSettings = step.settings as PieceTriggerSettings | PieceActionSettings
        const { blockName, pieceVersion, blockType, packageType } = pieceSettings
        return this.getExactPieceVersion(engineToken, {
            blockName,
            pieceVersion,
            blockType,
            packageType,
        })
    },
    async lockSingleStepPieceVersion(params: LockFlowVersionParams): Promise<FlowVersion> {
        const { engineToken, flowVersion } = params
        const allSteps = flowStructureUtil.getAllSteps(flowVersion.trigger)
        const pieceSteps = allSteps.filter(step => step.name === params.stepName && isPieceStep(step))
        const pieces = await Promise.all(pieceSteps.map(step => this.getExactPieceForStep(engineToken, step)))
        const pieceVersions = pieces.reduce((acc, piece, index) => ({
            ...acc,
            [pieceSteps[index].name]: piece.pieceVersion,
        }), {} as Record<string, string>)
        return flowStructureUtil.transferFlow(flowVersion, (step) => {
            if (pieceVersions[step.name]) {
                step.settings.pieceVersion = pieceVersions[step.name]
            }
            return step
        })
    },
})

async function getPieceVersionAndArchiveId(engineToken: string, piece: BasicBlockInformation, log: FastifyBaseLogger): Promise<{ pieceVersion: string, archiveId?: string }> {
    const isExactVersion = EXACT_VERSION_REGEX.test(piece.pieceVersion)
    if (isNil(piece.archiveId) || !isExactVersion) {
        const pieceMetadata = await engineApiService(engineToken, log).getPiece(piece.blockName, {
            version: piece.pieceVersion,
        })
        return {
            pieceVersion: pieceMetadata.version,
            archiveId: pieceMetadata.archiveId,
        }
    }
    return {
        pieceVersion: piece.pieceVersion,
        archiveId: piece.archiveId,
    }
}

const isPieceStep = (step: Step): step is Action | Trigger => {
    return step.type === TriggerType.PIECE || step.type === ActionType.PIECE
}

type LockFlowVersionParams = {
    engineToken: string
    flowVersion: FlowVersion
    stepName: string
}

export type BasicBlockInformation = {
    blockName: string
    pieceVersion: string
    blockType: BlockType
    packageType: PackageType
    archiveId?: string
}