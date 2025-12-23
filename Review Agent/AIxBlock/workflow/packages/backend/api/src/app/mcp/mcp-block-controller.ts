import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { AddMcpPieceRequestBody as AddMcpBlockRequestBody, ALL_PRINCIPAL_TYPES, ApId, McpBlockStatus, McpBlockWithConnection, McpWithBlocks, SERVICE_KEY_SECURITY_OPENAPI, UpdateMcpPieceRequestBody as UpdateMcpBlockRequestBody } from 'workflow-shared'
import { entitiesMustBeOwnedByCurrentProject } from '../authentication/authorization'
import { mcpBlockService } from './mcp-block-service'
import { mcpService } from './mcp-service'

export const mcpPieceController: FastifyPluginAsyncTypebox = async (app) => {

    app.addHook('preSerialization', entitiesMustBeOwnedByCurrentProject)

    app.get('/', GetMcpBlocksRequest, async (req) => {
        const projectId = req.principal.projectId
        const mcp = await mcpService(req.log).getOrCreate({ projectId })
        return { pieces: mcp.pieces || [] }
    })
    
    app.post('/', AddMcpBlockRequest, async (req) => {
        const { mcpId, blockName, connectionId, status } = req.body
        
        await mcpBlockService(req.log).add({
            mcpId,
            blockName,
            status: status ?? McpBlockStatus.ENABLED,
            connectionId: connectionId ?? undefined,
        })
                
        return mcpService(req.log).getOrThrow({ 
            mcpId,  
        })
    })
    
    app.post('/:id', UpdateMcpBlockRequest, async (req) => {
        const { id } = req.params
        const { connectionId, status } = req.body
        
        await mcpBlockService(req.log).update({
            blockId: id,
            connectionId: connectionId ?? undefined,
            status: status ?? undefined,
        })

        const mcpId = await mcpBlockService(req.log).getMcpId(id)

        return mcpService(req.log).getOrThrow({ 
            mcpId,
        })
    })
    
    app.delete('/:id', DeleteBlockRequest, async (req) => {
        const { id } = req.params
        await mcpBlockService(req.log).delete(id)
        return mcpService(req.log).getByProjectId({ projectId: req.principal.projectId })    
    })

}

const GetMcpBlocksRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        tags: ['mcp-block'],
        description: 'Get current project MCP blocks',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        response: {
            [StatusCodes.OK]: Type.Object({
                pieces: Type.Array(McpBlockWithConnection),
            }),
        },
    },
}

const AddMcpBlockRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        tags: ['mcp-block'],
        description: 'Add a new project MCP tool',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        body: AddMcpBlockRequestBody,
        response: {
            [StatusCodes.OK]: McpWithBlocks,
        },
    },
}

const UpdateMcpBlockRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        tags: ['mcp-block'],
        description: 'Update MCP tool status',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        params: Type.Object({
            id: ApId,
        }),
        body: UpdateMcpBlockRequestBody,
        response: {
            [StatusCodes.OK]: McpWithBlocks,
        },
    },
}


const DeleteBlockRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        tags: ['mcp-block'],
        description: 'Delete a block from MCP configuration',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        params: Type.Object({
            id: ApId,
        }),
        response: {
            [StatusCodes.OK]: McpWithBlocks,
        },
    },
} 