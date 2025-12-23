import { FastifyBaseLogger } from 'fastify'
import { ActionType, FlowStatus, flowStructureUtil, isNil, PieceAction, PieceTrigger, TriggerType } from 'workflow-shared'
import { blockMetadataService } from '../../blocks/block-metadata-service'
import { repoFactory } from '../../core/db/repo-factory'
import { FlowVersionEntity } from '../../flows/flow-version/flow-version-entity'
import { FlowEntity } from '../../flows/flow/flow.entity'
import { systemJobsSchedule } from '../../helper/system-jobs'
import { SystemJobName } from '../../helper/system-jobs/common'
import { systemJobHandlers } from '../../helper/system-jobs/job-handlers'
import { projectService } from '../../project/project-service'

const flowRepo = repoFactory(FlowEntity)
const flowVersionRepo = repoFactory(FlowVersionEntity)

export const piecesAnalyticsService = (log: FastifyBaseLogger) => ({
    async init(): Promise<void> {
        systemJobHandlers.registerJobHandler(SystemJobName.BLOCKS_ANALYTICS, async () => {
            const flowIds: string[] = (await flowRepo().createQueryBuilder().select('id').where({
                status: FlowStatus.ENABLED,
            }).getRawMany()).map((flow) => flow.id)
            const activeProjects: Record<string, Set<string>> = {}
            log.info('Syncing pieces analytics')
            for (const flowId of flowIds) {
                const flow = await flowRepo().findOneBy({
                    id: flowId,
                })
                const publishedVersionId = flow?.publishedVersionId
                if (isNil(flow) || isNil(publishedVersionId)) {
                    continue
                }
                const flowVersion = await flowVersionRepo().findOneBy({
                    id: publishedVersionId,
                })
                if (isNil(flowVersion)) {
                    continue
                }
                const pieces = flowStructureUtil.getAllSteps(flowVersion.trigger).filter(
                    (step) =>
                        step.type === ActionType.PIECE || step.type === TriggerType.PIECE,
                ).map((step) => {
                    const clonedStep = step as (PieceTrigger | PieceAction)
                    return {
                        name: clonedStep.settings.blockName,
                        version: clonedStep.settings.pieceVersion,
                    }
                })
                const platformId = await projectService.getPlatformId(flow.projectId)

                for (const piece of pieces) {
                    try {   
                        const pieceMetadata = await blockMetadataService(log).getOrThrow({
                            name: piece.name,
                            version: piece.version,
                            projectId: flow.projectId,
                            platformId,
                        })
                        const pieceId = pieceMetadata.id!
                        activeProjects[pieceId] = activeProjects[pieceId] || new Set()
                        activeProjects[pieceId].add(flow.projectId)
                    }
                    catch (e) {
                        log.error({
                            name: piece.name,
                            version: piece.version,
                        }, 'Piece not found in pieces analytics service')
                    }
                }
            }
            for (const id in activeProjects) {
                await blockMetadataService(log).updateUsage({
                    id,
                    usage: activeProjects[id].size,
                })
            }
            log.info('Synced pieces analytics finished')
        })
        await systemJobsSchedule(log).upsertJob({
            job: {
                name: SystemJobName.BLOCKS_ANALYTICS,
                data: {},
            },
            schedule: {
                type: 'repeated',
                cron: '0 12 * * *',
            },
        })
    },
})