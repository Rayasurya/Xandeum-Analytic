import { Static, Type } from '@sinclair/typebox'
import { ApId } from '../../common/id-generator'
import { OffsetPaginationQuery } from '../../common/pagination'
import { FlowRunStatus } from '../execution/flow-execution'

export const ListFlowRunsRequestQuery = Type.Object({
    flowId: Type.Optional(Type.Array(ApId)),
    tags: Type.Optional(Type.Array(Type.String({}))),
    status: Type.Optional(Type.Array(Type.Enum(FlowRunStatus))),
    cursor: Type.Optional(Type.String({})),
    createdAfter: Type.Optional(Type.String({})),
    createdBefore: Type.Optional(Type.String({})),
    projectId: ApId,
    ...OffsetPaginationQuery.properties,
})

export type ListFlowRunsRequestQuery = Static<typeof ListFlowRunsRequestQuery>
