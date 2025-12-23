
import { Type, Static } from '@sinclair/typebox'
import { ApId, OffsetPaginationQuery } from 'workflow-shared'
import { IssueStatus } from './issue-dto'

export const ListIssuesParams = Type.Object({
    projectId: ApId,
    cursor: Type.Optional(Type.String()),
    ...OffsetPaginationQuery.properties,
})
export type ListIssuesParams = Static<typeof ListIssuesParams>

export const UpdateIssueRequestBody = Type.Object({
    status: Type.Enum(IssueStatus),
})

export type UpdateIssueRequestBody = Static<typeof UpdateIssueRequestBody>