import dayjs from 'dayjs'
import { FastifyBaseLogger } from 'fastify'
import { Issue, IssueStatus, ListIssuesParams, PopulatedIssue } from 'workflow-axb-shared'
import { AIxBlockError, ApId, apId, ErrorCode, isNil, SeekPage, spreadIfDefined } from 'workflow-shared'
import { repoFactory } from '../../core/db/repo-factory'
import { buildOffsetPaginator } from '../../helper/pagination/build-offset-paginator'
import { buildPaginator } from '../../helper/pagination/build-paginator'
import { paginationHelper } from '../../helper/pagination/pagination-utils'
import { flowVersionService } from '../flow-version/flow-version.service'
import { IssueEntity } from './issues-entity'
const repo = repoFactory(IssueEntity)

export const issuesService = (log: FastifyBaseLogger) => ({
    async add({ projectId, flowId, flowRunCreatedAt }: { flowId: string, projectId: string, flowRunCreatedAt: string }): Promise<Issue> {
        const issueId = apId()
        const date = dayjs(flowRunCreatedAt).toISOString()
        await repo().createQueryBuilder()
            .insert()
            .into(IssueEntity)
            .values({
                projectId,
                flowId,
                id: issueId,
                lastOccurrence: date,
                count: 0,
                status: IssueStatus.ONGOING,
                created: date,
                updated: date,
            })
            .orIgnore()
            .execute()

        const updatedIssue = await this.update({
            projectId,
            flowId,
            status: IssueStatus.ONGOING,
        })
        
        return updatedIssue
    },
    async get({ projectId, flowId }: { projectId: string, flowId: string }): Promise<Issue | null> {
        return repo().findOneBy({
            projectId,
            flowId,
        })
    },
    async list({ projectId, cursor, limit }: ListIssuesParams): Promise<SeekPage<PopulatedIssue>> {
        const decodedCursor = paginationHelper.decodeCursor(cursor ?? null)
        const paginator = buildPaginator({
            entity: IssueEntity,
            query: {
                limit,
                order: 'ASC',
                afterCursor: decodedCursor.nextCursor,
                beforeCursor: decodedCursor.previousCursor,
            },
        })

        const query = repo().createQueryBuilder(IssueEntity.options.name).where({
            projectId,
            status: IssueStatus.ONGOING,
        })

        const { data, cursor: newCursor } = await paginator.paginate(query)

        const populatedIssues = await Promise.all(data.map(async issue => {
            const flowVersion = await flowVersionService(log).getLatestLockedVersionOrThrow(issue.flowId)
            return {
                ...issue,
                flowDisplayName: flowVersion.displayName,
            }
        }))
        return paginationHelper.createPage<PopulatedIssue>(populatedIssues, newCursor)
    },

    async updateById({ projectId, id, status }: UpdateParams): Promise<void> {
        const flowIssue = await repo().findOneBy({
            id,
            projectId,
        })
        if (isNil(flowIssue)) {
            throw new AIxBlockError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    message: 'issue not found',
                },
            })
        }
        await repo().update({
            id,
        }, {
            status,
            updated: new Date().toISOString(),
            count: 0,
        })
    },
    async update({ projectId, flowId, status }: {
        projectId: ApId
        flowId: ApId
        status: IssueStatus
    }): Promise<Issue> {
        if (status != IssueStatus.RESOLEVED) {
            await repo().increment({ projectId, flowId }, 'count', 1)
        }
        await repo().update({
            projectId,
            flowId,
        }, {
            ...spreadIfDefined('lastOccurrence', status !== IssueStatus.RESOLEVED ? dayjs().toISOString() : undefined),
            ...spreadIfDefined('count', status === IssueStatus.RESOLEVED ? 0 : undefined),
            status,
            updated: new Date().toISOString(),
        })
        return repo().findOneByOrFail({
            projectId,
            flowId,
        })
    },
    async count({ projectId }: { projectId: ApId }): Promise<number> {
        return repo().count({
            where: {
                projectId,
                status: IssueStatus.ONGOING,
            },
        })
    },
    v2: {
        async list({ projectId, page, limit }: ListIssuesParams): Promise<SeekPage<PopulatedIssue>> {
            const paginator = buildOffsetPaginator({
                entity: IssueEntity,
                query: {
                    limit,
                    page,
                    order: 'ASC',
                },
            })

            const query = repo().createQueryBuilder(IssueEntity.options.name).where({
                projectId,
                status: IssueStatus.ONGOING,
            })

            const { data, pageCount } = await paginator.paginate(query)

            const populatedIssues = await Promise.all(data.map(async issue => {
                const flowVersion = await flowVersionService(log).getLatestLockedVersionOrThrow(issue.flowId)
                return {
                    ...issue,
                    flowDisplayName: flowVersion.displayName,
                }
            }))
            return paginationHelper.createPageOffet<PopulatedIssue>(populatedIssues, pageCount)
        },
    },
})

type UpdateParams = {
    projectId: string
    id: string
    status: IssueStatus
}