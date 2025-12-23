import { FastifyBaseLogger } from 'fastify'
import { TriggerBase } from 'workflow-blocks-framework'
import {
    AIxBlockError,
    ErrorCode,
    isNil,
    PieceTrigger,
    ProjectId,
} from 'workflow-shared'
import { blockMetadataService } from '../../../blocks/block-metadata-service'
import { projectService } from '../../../project/project-service'

export const triggerUtils = (log: FastifyBaseLogger) => ({
    async getPieceTriggerOrThrow({ trigger, projectId }: GetPieceTriggerOrThrowParams): Promise<TriggerBase> {

        const pieceTrigger = await this.getPieceTrigger({
            trigger,
            projectId,

        })
        if (isNil(pieceTrigger)) {
            throw new AIxBlockError({
                code: ErrorCode.BLOCK_TRIGGER_NOT_FOUND,
                params: {
                    blockName: trigger.settings.blockName,
                    pieceVersion: trigger.settings.pieceVersion,
                    triggerName: trigger.settings.triggerName,
                },
            })
        }
        return pieceTrigger
    },
    async getPieceTrigger({ trigger, projectId }: GetPieceTriggerOrThrowParams): Promise<TriggerBase | null> {
        const platformId = await projectService.getPlatformId(projectId)
        const piece = await blockMetadataService(log).get({
            projectId,
            platformId,
            name: trigger.settings.blockName,
            version: trigger.settings.pieceVersion,
        })
        if (isNil(piece) || isNil(trigger.settings.triggerName)) {
            return null
        }
        const pieceTrigger = piece.triggers[trigger.settings.triggerName]
        return pieceTrigger
    },
})

type GetPieceTriggerOrThrowParams = {
    trigger: PieceTrigger
    projectId: ProjectId
}