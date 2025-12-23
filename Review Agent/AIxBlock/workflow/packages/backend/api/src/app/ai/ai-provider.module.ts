import {
    FastifyPluginAsyncTypebox,
    FastifyPluginCallbackTypebox,
    Type,
} from '@fastify/type-provider-typebox'
import { onRequestAsyncHookHandler } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import {
    AiProviderConfig,
    AIxBlockError,
    EnginePrincipal,
    ErrorCode,
    isNil,
    PrincipalType,
    SeekPage
} from 'workflow-shared'
import { userService } from '../user/user-service'
import { proxyController } from './ai-provider-proxy'
import { aiProviderService } from './ai-provider.service'

export const aiProviderModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(proxyController, { prefix: '/v1/ai-providers/proxy' })
    await app.register(aiProviderController, { prefix: '/v1/ai-providers' })
    await app.register(engineAiProviderController, {
        prefix: '/v1/ai-providers',
    })
}

export const aiMustBeOwnedByCurrentUser: onRequestAsyncHookHandler =
    async (request, _res) => {
        const errorPermission = new AIxBlockError({
            code: ErrorCode.AUTHORIZATION,
            params: {},
        })
        const platformId = request.principal.platform.id
        
        if (isNil(platformId)) {
            throw errorPermission
        }

        const isApiKey = request.principal.type === PrincipalType.SERVICE
        if (isApiKey) {
            return
        }

        const user = await userService.getOneOrFail({
            id: request.principal.id,
        })

        if (isNil(user)) {
            throw errorPermission
        }

        const canEditPlatform = user.platformId === platformId
        if (!canEditPlatform) {
            throw errorPermission
        }
    }

    
const engineAiProviderController: FastifyPluginCallbackTypebox = (
    fastify,
    _opts,
    done,
) => {
    fastify.get('/', ListProxyConfigRequest, async (request) => {
        const platformId = (request.principal as unknown as EnginePrincipal).platform.id
        return aiProviderService.list(platformId, request.principal.projectId)
    })

    done()
}

const aiProviderController: FastifyPluginCallbackTypebox = (
    fastify,
    _opts,
    done,
) => {
    fastify.addHook('preHandler', aiMustBeOwnedByCurrentUser)
    fastify.post('/', CreateProxyConfigRequest, async (request) => {
        return aiProviderService.upsert(request.principal.platform.id, request.principal.projectId, {
            config: request.body.config,
            baseUrl: request.body.baseUrl,
            provider: request.body.provider,
        })
    })

    fastify.delete(
        '/:provider',
        DeleteProxyConfigRequest,
        async (request, reply) => {
            await aiProviderService.delete({
                platformId: request.principal.platform.id,
                provider: request.params.provider,
                projectId: request.principal.projectId,
            })
            await reply.status(StatusCodes.NO_CONTENT).send()
        },
    )

    done()
}

const ListProxyConfigRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER, PrincipalType.ENGINE],
    },
    schema: {
        response: {
            [StatusCodes.OK]: SeekPage(AiProviderConfig),
        },
    },
}

const CreateProxyConfigRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
    },
    schema: {
        body: Type.Omit(AiProviderConfig, [
            'id',
            'created',
            'updated',
            'platformId',
        ]),
    },
}

const DeleteProxyConfigRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
    },
    schema: {
        params: Type.Object({
            provider: Type.String(),
        }),
    },
}
