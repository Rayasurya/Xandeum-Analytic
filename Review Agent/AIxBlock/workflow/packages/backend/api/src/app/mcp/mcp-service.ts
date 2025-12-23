import dayjs from 'dayjs'
import { FastifyBaseLogger } from 'fastify'
import { AIxBlockError, apId, ApId, Cursor, ErrorCode, isNil, McpWithBlocks, SeekPage, spreadIfDefined } from 'workflow-shared'
import { repoFactory } from '../core/db/repo-factory'
import { paginationHelper } from '../helper/pagination/pagination-utils'
import { mcpBlockService } from './mcp-block-service'
import { McpEntity } from './mcp-entity'

const repo = repoFactory(McpEntity)

export const mcpService = (_log: FastifyBaseLogger) => ({
    async getOrCreate({ projectId }: { projectId: ApId }): Promise<McpWithBlocks> {
        const existingMcp = await repo().findOneBy({ projectId })
        if (!isNil(existingMcp)) {
            return this.getOrThrow({ mcpId: existingMcp.id })
        }
        const mcp = await repo().save({
            id: apId(),
            projectId,
            token: apId(),
            created: dayjs().toISOString(),
            updated: dayjs().toISOString(),
        })
        return this.getOrThrow({ mcpId: mcp.id })
    },

    async list({ projectId }: ListParams): Promise<SeekPage<McpWithBlocks>> {
        const existingMcp = await repo().findOneBy({ projectId })
        
        if (isNil(existingMcp)) {
            const newMCP = await this.getOrCreate({ projectId })
            return paginationHelper.createPage<McpWithBlocks>([newMCP], null)
        }
        
        const mcpWithBlocks = await this.getOrThrow({ mcpId: existingMcp.id })
        
        return paginationHelper.createPage<McpWithBlocks>([mcpWithBlocks], null)
    },

    async getOrThrow({ mcpId }: { mcpId: string }): Promise<McpWithBlocks> {
        const mcp = await repo().findOneBy({ id: mcpId })

        if (isNil(mcp)) {
            throw new AIxBlockError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: { entityId: mcpId, entityType: 'MCP' },
            })
        }
        return {
            ...mcp,
            pieces: await mcpBlockService(_log).list(mcp.id),
        }
    },

    async getByToken({ token }: { token: string }): Promise<McpWithBlocks> {
        const mcp = await repo().findOne({ where: { token } })
        if (isNil(mcp)) {
            throw new AIxBlockError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: { entityId: token, entityType: 'MCP' },
            })
        }
        return this.getOrThrow({ mcpId: mcp.id })
    },

    async update({ mcpId, token }: UpdateParams): Promise<McpWithBlocks> {

        await repo().update(mcpId, {
            ...spreadIfDefined('token', token),
            updated: dayjs().toISOString(),
        })

        return this.getOrThrow({ mcpId })
    },

    async getByProjectId({ projectId }: { projectId: ApId }): Promise<McpWithBlocks> {
        const mcp = await repo().findOneBy({ projectId })
        if (isNil(mcp)) {
            return this.getOrCreate({ projectId })
        }
        return this.getOrThrow({ mcpId: mcp.id })
    },

})

type ListParams = {
    projectId: ApId
    cursorRequest?: Cursor | null
    limit?: number
}

type UpdateParams = {
    mcpId: ApId
    token?: string
}

