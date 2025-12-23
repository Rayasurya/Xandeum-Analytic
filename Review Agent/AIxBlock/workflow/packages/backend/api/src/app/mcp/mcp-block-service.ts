import dayjs from 'dayjs'
import { FastifyBaseLogger } from 'fastify'
import {
    AIxBlockError,
    apId,
    ApId,
    ErrorCode,
    isNil,
    Mcp,
    McpBlock,
    McpBlockStatus,
    McpBlockWithConnection
} from 'workflow-shared'
import { appConnectionService, appConnectionsRepo } from '../app-connection/app-connection-service/app-connection-service'
import { blockMetadataService } from '../blocks/block-metadata-service'
import { repoFactory } from '../core/db/repo-factory'
import { projectService } from '../project/project-service'
import { McpBlockEntity } from './mcp-block-entity'
import { McpEntity } from './mcp-entity'

const mcpRepo = repoFactory(McpEntity)
const mcpBlockRepo = repoFactory(McpBlockEntity)

export const mcpBlockService = (_log: FastifyBaseLogger) => ({
    async list(mcpId: ApId): Promise<McpBlockWithConnection[]> {
        await this.validateMcp(mcpId)
        
        const blocks = await mcpBlockRepo().find({ 
            where: { mcpId },
        })
        
        const blocksWithConnection = await Promise.all(
            blocks.map(async (block) => {
                return enrichBlockWithConnection(block, _log)
            }),
        )
        
        return blocksWithConnection
    },

    async add({ mcpId, blockName, status, connectionId }: AddParams): Promise<McpBlockWithConnection> {
        const mcp = await this.validateMcp(mcpId)
        const project = await projectService.getOneOrThrow(mcp.projectId)
        await validateMcpBlockConnection({ blockName, connectionId, projectId: mcp.projectId, log: _log, platformId: project.platformId })
        const existingBlock = await mcpBlockRepo().findOne({
            where: { mcpId, blockName },
        })

        if (!isNil(existingBlock)) {
            return enrichBlockWithConnection(existingBlock, _log)
        }
        
        const block = await mcpBlockRepo().save({
            id: apId(),
            mcpId,
            blockName,
            status,
            connectionId,
            created: dayjs().toISOString(),
            updated: dayjs().toISOString(),
        })
        
        return enrichBlockWithConnection(block, _log)
    },

    async getOne(blockId: string): Promise<McpBlockWithConnection | null    > {      
        const block = await mcpBlockRepo().findOne({
            where: { id: blockId },
        })

        if (isNil(block)) {
            return null
        }

        return enrichBlockWithConnection(block, _log)
    },

    async getOneOrThrow(blockId: string): Promise<McpBlockWithConnection> {
        const block = await this.getOne(blockId)
        
        if (isNil(block)) {
            throw new AIxBlockError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    entityId: blockId,
                    entityType: 'McpBlock',
                },
            })
        }
        
        return block
    },

    async getMcpId(blockId: string): Promise<string> {
        const block = await this.getOne(blockId)
        if (isNil(block)) {
            throw new AIxBlockError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: { entityId: blockId, entityType: 'McpBlock' },
            })
        }
        return block.mcpId
    },

    async delete(blockId: string): Promise<void> {
        await mcpBlockRepo().delete({ id: blockId })
    },
    
    async update({ blockId, status, connectionId }: UpdateParams): Promise<McpBlockWithConnection> {
        const block = await this.getOneOrThrow(blockId)
        const mcp = await this.validateMcp(block.mcpId)
        const project = await projectService.getOneOrThrow(mcp.projectId)
       
        if (!isNil(status)) {
            await mcpBlockRepo().update(
                { id: block.id },
                { 
                    status,
                    updated: dayjs().toISOString(),
                },
            )
        }

        if (!isNil(connectionId)) {
            await validateMcpBlockConnection({ blockName: block.blockName, connectionId, projectId: mcp.projectId, log: _log, platformId: project.platformId })
            await mcpBlockRepo().update(
                { id: block.id },
                { connectionId },
            )
        }   
        
        return this.getOneOrThrow(blockId)
    },

    async validateMcp(mcpId: ApId): Promise<Mcp> {
        const mcp = await mcpRepo().findOneBy({ id: mcpId })

        if (isNil(mcp)) {
            throw new AIxBlockError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: { entityId: mcpId, entityType: 'MCP' },
            })
        }

        return mcp
    },
})

async function enrichBlockWithConnection(block: McpBlock, log: FastifyBaseLogger): Promise<McpBlockWithConnection> {
    if (!block.connectionId) {
        return {
            ...block,
            connection: undefined,
        }
    }
    
    try {
        const connection = await appConnectionsRepo().findOneBy({ 
            id: block.connectionId,
        })
        
        if (isNil(connection)) {
            return {
                ...block,
                connection: undefined,
            }
        }

        const connectionWithoutSensitiveData = await appConnectionService(log).getOneOrThrowWithoutValue({
            id: connection.id,
            platformId: connection.platformId,
            projectId: connection.projectIds?.[0],
        })

        return {
            ...block,
            connection: connectionWithoutSensitiveData,
        }
    }
    catch (error) {
        return {
            ...block,
            connection: undefined,
        }
    }
}



const validateMcpBlockConnection = async ({ blockName, connectionId, projectId, log, platformId }: { blockName: string, connectionId?: string, log: FastifyBaseLogger, projectId: string, platformId: string })  => {
    const block = await blockMetadataService(log).getOrThrow({
        name: blockName,
        platformId,
        version: undefined,
        projectId,
    })
    if (block.auth && !connectionId) {
        throw new AIxBlockError({
            code: ErrorCode.MCP_BLOCK_REQUIRES_CONNECTION,
            params: { blockName },
        })
    }
    if (connectionId) {
        const connection = await appConnectionService(log).getOneOrThrowWithoutValue({
            id: connectionId,
            platformId,
            projectId,
        })
        if (connection.blockName !== blockName) {
            throw new AIxBlockError({
                code: ErrorCode.MCP_BLOCK_CONNECTION_MISMATCH,
                params: { blockName, connectionBlockName: connection.blockName, connectionId },
            })
        }
    }
  
   
}
type AddParams = {
    mcpId: string
    blockName: string
    status: McpBlockStatus
    connectionId?: string
}

type UpdateParams = {
    blockId: string
    status?: McpBlockStatus
    connectionId?: string
}
