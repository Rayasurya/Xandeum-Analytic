import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { ApplicationEventName } from 'workflow-axb-shared';
import { AppSystemProp, networkUtils } from 'workflow-server-shared';
import { ALL_PRINCIPAL_TYPES, ClaimTokenRequest, ThirdPartyAuthnProviderEnum } from 'workflow-shared';
import { eventsHooks } from '../../../helper/application-events';
import { system } from '../../../helper/system/system';
import { platformUtils } from '../../../platform/platform.utils';
import { federatedAuthnService } from './federated-authn-service';

export const federatedAuthModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(federatedAuthnController, {
        prefix: '/v1/authn/federated',
    });
};

const federatedAuthnController: FastifyPluginAsyncTypebox = async (app) => {
    app.get('/login', LoginRequestSchema, async (req) => {
        const platformId = await platformUtils.getPlatformIdForRequest(req);
        const providerName = req.query.providerName;
        return federatedAuthnService(req.log).login({
            platformId: platformId ?? undefined,
            providerName: providerName,
        });
    });

    app.post('/claim', ClaimTokenRequestSchema, async (req) => {
        const platformId = await platformUtils.getPlatformIdForRequest(req);
        const providerName = req.body.providerName;
        const response = await federatedAuthnService(req.log).claim({
            platformId: platformId ?? undefined,
            providerName,
            code: req.body.code,
        });
        eventsHooks.get(req.log).sendUserEvent(
            {
                platformId: response.platformId!,
                userId: response.id,
                projectId: response.projectId,
                ip: networkUtils.extractClientRealIp(req, system.get(AppSystemProp.CLIENT_REAL_IP_HEADER)),
            },
            {
                action: ApplicationEventName.USER_SIGNED_UP,
                data: {
                    source: 'sso',
                },
            }
        );
        return response;
    });
};

const LoginRequestSchema = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        querystring: Type.Object({
            providerName: Type.Enum(ThirdPartyAuthnProviderEnum),
        }),
    },
};

const ClaimTokenRequestSchema = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        body: ClaimTokenRequest,
    },
};
