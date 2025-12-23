import { EntitySchema } from 'typeorm'
import { Mcp, McpBlockWithConnection } from 'workflow-shared'
import { ApIdSchema, BaseColumnSchemaPart } from '../database/database-common'


type McpSchema = Mcp & {
    pieces: McpBlockWithConnection[]
}

export const McpEntity = new EntitySchema<McpSchema>({
    name: 'mcp',
    columns: {
        ...BaseColumnSchemaPart,
        projectId: ApIdSchema,
        token: ApIdSchema,
    },
    indices: [
        {
            name: 'mcp_project_id',
            columns: ['projectId'],
            unique: true,
        },
    ],
    relations: {
        pieces: {
            type: 'one-to-many',
            target: 'mcp_block',
            cascade: true,
            onDelete: 'CASCADE',
        },
    },
    
})

