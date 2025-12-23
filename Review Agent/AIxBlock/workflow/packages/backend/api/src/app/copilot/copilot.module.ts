import {
    AskCopilotRequest,
    AskCopilotResponse,
    CopilotConfig,
    PrincipalType,
    WebsocketClientEvent,
    WebsocketServerEvent,
} from 'workflow-shared';
import { FastifyPluginAsyncTypebox, FastifyPluginCallbackTypebox, Type } from '@fastify/type-provider-typebox';
import { aiMustBeOwnedByCurrentUser } from '../ai/ai-provider.module';
import { accessTokenManager } from '../authentication/lib/access-token-manager';
import { websocketService } from '../websockets/websockets.service';
import { copilotService } from './copilot.service';

export const copilotModule: FastifyPluginAsyncTypebox = async (fastify) => {
    websocketService.addListener(WebsocketServerEvent.ASK_COPILOT, (socket) => {
        return async (request: AskCopilotRequest) => {
            const principal = await accessTokenManager.verifyPrincipal(socket.handshake.auth.token);
            const response: AskCopilotResponse | null = await copilotService(fastify.log).ask(principal.projectId, principal.platform.id, request);
            socket.emit(WebsocketClientEvent.ASK_COPILOT_FINISHED, response);
        };
    });
    await fastify.register(copilotController, { prefix: '/v1/copilot' });
};

const copilotController: FastifyPluginCallbackTypebox = (fastify, _opts, done) => {
    fastify.addHook('preHandler', aiMustBeOwnedByCurrentUser);
    fastify.post('/', UpsertSettingRequest, async (request) => {
        return copilotService(fastify.log).upsert(request.principal.platform.id, request.principal.projectId, request.principal.id, {
            setting: request.body.setting,
        });
    });
    fastify.get('/', GetSettingRequest, async (request) => {
        const copilot = await copilotService(fastify.log)
            .getOrThrow({
                platformId: request.principal.platform.id,
                projectId: request.principal.projectId,
            })
            .catch(() => {});
        return { ...copilot, setting: {} };
    });

    fastify.delete('/', DeleteSettingRequest, async (request) => {
        await copilotService(fastify.log).delete(request.principal.platform.id, request.principal.projectId);
        return {};
    });

    done();
};

const UpsertSettingRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
    },
    schema: {
        body: Type.Omit(CopilotConfig, ['id', 'created', 'updated', 'platformId', 'projectId']),
    },
};

const GetSettingRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
    },
    schema: {},
};

const DeleteSettingRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
    },
    schema: {},
};
