import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { assertNotNullOrUndefined, EndpointScope, ListTagsRequest, PrincipalType, SeekPage, SetBlockTagsRequest, Tag, UpsertTagRequest } from 'workflow-shared'
import { platformMustBeOwnedByCurrentUser } from '../ee/authentication/ee-authorization'
import { blockTagService } from './blocks/block-tag.service'
import { tagService } from './tag-service'


export const tagsModule: FastifyPluginAsyncTypebox = async (app) => {
    app.addHook('preHandler', platformMustBeOwnedByCurrentUser)
    await app.register(tagsController, { prefix: '/v1/tags' })
}


const tagsController: FastifyPluginAsyncTypebox = async (fastify) => {

    fastify.get('/', ListTagsParams,
        async (request) => {
            const platformId = request.principal.platform.id
            assertNotNullOrUndefined(platformId, 'platformId')
            return tagService.list({
                platformId,
                request: request.query,
            })
        },
    )

    fastify.post('/', UpsertTagParams, async (req, reply) => {
        const platformId = req.principal.platform.id
        const tag = await tagService.upsert(platformId, req.body.name)
        await reply.status(StatusCodes.CREATED).send(tag)
    })

    fastify.post('/blocks', setBlocksTagsParams, async (req, reply) => {
        const platformId = req.principal.platform.id
        const blocks = req.body.blocksName.map(blockName => blockTagService.set(platformId, blockName, req.body.tags))
        await Promise.all(blocks)
        await reply.status(StatusCodes.CREATED).send({})
    })
    
}

const UpsertTagParams = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        scope: EndpointScope.PLATFORM,
    },
    schema: {
        body: UpsertTagRequest,
        response: {
            [StatusCodes.CREATED]: Tag,
        },
    },
}

const setBlocksTagsParams = {
    config: {
        allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
        scope: EndpointScope.PLATFORM,
    },
    schema: {
        body: SetBlockTagsRequest,
        response: {
            [StatusCodes.CREATED]: Type.Object({}),
        },
    },
}

const ListTagsParams = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        scope: EndpointScope.PLATFORM,
    },
    schema: {
        querystring: ListTagsRequest,
        response: {
            [StatusCodes.OK]: SeekPage(Tag),
        },
    },
}