import { EntitySchema } from 'typeorm'
import { AppConnectionWithoutSensitiveData, McpBlock, McpBlockStatus } from 'workflow-shared'
import { ApIdSchema, BaseColumnSchemaPart } from '../database/database-common'

type McpBlockSchema = McpBlock & {
    connection: AppConnectionWithoutSensitiveData | null
}

export const McpBlockEntity = new EntitySchema<McpBlockSchema>({
    name: 'mcp_block',
    columns: {
        ...BaseColumnSchemaPart,
        blockName: {
            type: String,
            nullable: false,
        },
        mcpId: {
            ...ApIdSchema,
            nullable: false,
        },
        connectionId: {
            ...ApIdSchema,
            nullable: true,
        },
        status: {
            type: String,
            enum: Object.values(McpBlockStatus),
            default: McpBlockStatus.ENABLED,
            nullable: false,
        },
    },
    indices: [
        {
            name: 'mcp_piece_mcp_id',
            columns: ['mcpId'],
        },
        {
            name: 'mcp_piece_connection_id',
            columns: ['connectionId'],
        },
        {
            name: 'mcp_piece_unique_piece_per_mcp',
            columns: ['mcpId', 'blockName'],
            unique: true,
        },
    ],
    relations: {
        connection: {
            type: 'one-to-one',
            target: 'app_connection',
            joinColumn: {
                name: 'connectionId',
                referencedColumnName: 'id',
            },
            onDelete: 'SET NULL',
            nullable: true,
        },
    },
})