import { FastifyBaseLogger } from 'fastify';
import { AppSystemProp } from 'workflow-server-shared';
import { system } from '../../../helper/system/system';
import { federatedAuthnService } from './federated-authn-service';

export const aixblockAuthnProvider = (log: FastifyBaseLogger) => ({
    async getLoginUrl(params: GetLoginUrlParams): Promise<string> {
        const { clientId, platformId } = params;
        const platformUrl = system.getOrThrow(AppSystemProp.AIXBLOCK_PLATFORM_URI);
        const loginUrl = new URL(`${platformUrl}/o/authorize`);
        loginUrl.searchParams.set('client_id', clientId);
        loginUrl.searchParams.set('redirect_uri', await federatedAuthnService(log).getThirdPartyRedirectUrl(platformId));
        loginUrl.searchParams.set('response_type', 'code');
        return loginUrl.href;
    },

    async authenticate(params: AuthenticateParams): Promise<FebderatedAuthnIdToken> {
        const { clientId, clientSecret, authorizationCode, platformId } = params;
        const idToken = await exchangeCodeForIdToken(clientId, clientSecret, authorizationCode);
        return verifyIdToken(idToken);
    },
});

const exchangeCodeForIdToken = async (clientId: string, clientSecret: string, code: string): Promise<string> => {
    const formdata = new FormData();
    formdata.append('client_id', clientId);
    formdata.append('client_secret', clientSecret);
    formdata.append('code', code);
    formdata.append('grant_type', 'authorization_code');

    const platformUrl = system.getOrThrow(AppSystemProp.AIXBLOCK_PLATFORM_URI);
    const response = await fetch(`${platformUrl}/o/token`, {
        method: 'POST',
        body: formdata,
    });
    const data = await response.json();
    const access_token = data.access_token;

    return access_token;
};

const verifyIdToken = async (idToken: string): Promise<FebderatedAuthnIdToken> => {
    const platformUrl = system.getOrThrow(AppSystemProp.AIXBLOCK_PLATFORM_URI);
    const profileResponse = await fetch(`${platformUrl}/api/user/info/oauth2`, {
        method: 'POST',
        headers: {
            Authorization: `Token ${idToken}`,
            Accept: 'application/json',
        },
    });

    const profile = await profileResponse.json();
    return {
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
    };
};

type GetLoginUrlParams = {
    clientId: string;
    platformId: string | undefined;
};

type AuthenticateParams = {
    platformId: string | undefined;
    clientId: string;
    clientSecret: string;
    authorizationCode: string;
};

export type FebderatedAuthnIdToken = {
    email: string;
    firstName: string;
    lastName: string;
};
