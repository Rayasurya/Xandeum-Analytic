import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { BlockMetadataModel } from 'workflow-blocks-framework'
import { AddBlockRequestBody, PrincipalType } from 'workflow-shared'
import { blockService } from './block-service'

export const communityBlocksModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(communityBlocksController, { prefix: '/v1/blocks' })
}

const communityBlocksController: FastifyPluginAsyncTypebox = async (app) => {
    app.post(
        '/',
        {
            config: {
                allowedPrincipals: [PrincipalType.USER],
            },
            schema: {
                body: AddBlockRequestBody,
            },
        },
        async (req, res): Promise<BlockMetadataModel> => {
            const platformId = req.principal.platform.id
            const projectId = req.principal.projectId
            const blockMetadata = await blockService(req.log).installBlock(
                platformId,
                projectId,
                req.body,
            )
            return res.code(StatusCodes.CREATED).send(blockMetadata)
        },
    )
}
