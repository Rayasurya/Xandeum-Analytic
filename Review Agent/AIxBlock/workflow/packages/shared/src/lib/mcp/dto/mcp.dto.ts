import { Static, Type } from '@sinclair/typebox'
import { Nullable } from '../../common'
import { ApId } from '../../common/id-generator'
import { McpBlockStatus } from '../mcp'

export const ListMcpsRequest = Type.Object({
    limit: Type.Optional(Type.Number({})),
    cursor: Type.Optional(Type.String({})),
    projectId: Type.Optional(Type.String({})),
})

export type ListMcpsRequest = Static<typeof ListMcpsRequest>
export const AddMcpPieceRequestBody = Type.Object({
    mcpId: ApId,
    blockName: Type.String(),
    status: Type.Optional(Type.Enum(McpBlockStatus)),
    connectionId: Nullable(Type.String()),
})

export type AddMcpBlockRequestBody = Static<typeof AddMcpPieceRequestBody>

export const UpdateMcpPieceRequestBody = Type.Object({
    status: Type.Optional(Type.Enum(McpBlockStatus)),
    connectionId: Nullable(Type.String()),
})

export type UpdateMcpBlockRequestBody = Static<typeof UpdateMcpPieceRequestBody>


