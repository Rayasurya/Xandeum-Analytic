import { Static, Type } from '@sinclair/typebox'
import { AppConnectionWithoutSensitiveData } from '../app-connection/app-connection'
import { BaseModelSchema } from '../common'
import { ApId } from '../common/id-generator'

export enum McpPropertyType {
    TEXT = 'Text',
    BOOLEAN = 'Boolean',
    DATE = 'Date',
    NUMBER = 'Number',
    ARRAY = 'Array',
    OBJECT = 'Object',
}

export enum McpBlockStatus {
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED',
}

export const McpProperty = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
    type: Type.String(),
    required: Type.Boolean(),
})

export type McpProperty = Static<typeof McpProperty>


export const McpBlock = Type.Object({
    ...BaseModelSchema,
    blockName: Type.String(),
    connectionId: Type.Optional(ApId),
    mcpId: ApId,
    status: Type.Optional(Type.Enum(McpBlockStatus)),
})

export type McpBlock = Static<typeof McpBlock>

export const McpBlockWithConnection = Type.Composite([
    McpBlock,
    Type.Object({
        connection: Type.Optional(AppConnectionWithoutSensitiveData),
    }),
])

export type McpBlockWithConnection = Static<typeof McpBlockWithConnection>



export const Mcp = Type.Object({
    ...BaseModelSchema,
    projectId: ApId,
    token: ApId,
})

export type Mcp = Static<typeof Mcp> 

export const McpWithBlocks = Type.Composite([
    Mcp,
    Type.Object({
        pieces: Type.Array(McpBlockWithConnection),
    }),
])

export type McpWithBlocks = Static<typeof McpWithBlocks>


export const McpTrigger = Type.Object({
    blockName: Type.String(),
    triggerName: Type.String(),
    input: Type.Object({
        toolName: Type.String(),
        toolDescription: Type.String(),
        inputSchema: Type.Array(McpProperty),
        returnsResponse: Type.Boolean(),
    }),
})

export type McpTrigger = Static<typeof McpTrigger>
