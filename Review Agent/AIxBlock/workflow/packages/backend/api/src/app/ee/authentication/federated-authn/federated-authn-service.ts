import { FastifyBaseLogger } from 'fastify';
import { AppSystemProp } from 'workflow-server-shared';
import { AuthenticationResponse, FederatedAuthnLoginResponse, ThirdPartyAuthnProviderEnum, UserIdentityProvider } from 'workflow-shared';
import { authenticationService } from '../../../authentication/authentication.service';
import { system } from '../../../helper/system/system';
import { domainHelper } from '../../custom-domains/domain-helper';
import { aixblockAuthnProvider } from './aixblock-authn-provider';
import { googleAuthnProvider } from './google-authn-provider';

export const federatedAuthnService = (log: FastifyBaseLogger) => ({
    async login({ platformId, providerName }: LoginParams): Promise<FederatedAuthnLoginResponse> {
        if (providerName === ThirdPartyAuthnProviderEnum.GOOGLE) {
            const { clientId } = await getGoogleClientIdAndSecret(platformId);
            const loginUrl = await googleAuthnProvider(log).getLoginUrl({
                clientId,
                platformId,
            });

            return {
                loginUrl,
            };
        } else if (providerName === ThirdPartyAuthnProviderEnum.AIXBLOCK) {
            const { clientId } = await getAIxBlockClientIdAndSecret(platformId);
            const loginUrl = await aixblockAuthnProvider(log).getLoginUrl({
                clientId,
                platformId,
            });
            return {
                loginUrl: loginUrl,
            };
        }
        return {
            loginUrl: '',
        };
    },

    async claim({ platformId, code, providerName }: ClaimParams): Promise<AuthenticationResponse> {
        if (providerName === ThirdPartyAuthnProviderEnum.AIXBLOCK) {
            const { clientId, clientSecret } = await getAIxBlockClientIdAndSecret(platformId);
            const idToken = await aixblockAuthnProvider(log).authenticate({
                clientId,
                clientSecret,
                authorizationCode: code,
                platformId,
            });

            return authenticationService(log).federatedAuthn({
                email: idToken.email,
                firstName: idToken.firstName ?? 'john',
                lastName: idToken.lastName ?? 'doe',
                trackEvents: true,
                newsLetter: true,
                provider: UserIdentityProvider.GOOGLE,
                predefinedPlatformId: platformId ?? null,
            });
        }
        const { clientId, clientSecret } = await getGoogleClientIdAndSecret(platformId);
        const idToken = await googleAuthnProvider(log).authenticate({
            clientId,
            clientSecret,
            authorizationCode: code,
            platformId,
        });

        return authenticationService(log).federatedAuthn({
            email: idToken.email,
            firstName: idToken.firstName ?? 'john',
            lastName: idToken.lastName ?? 'doe',
            trackEvents: true,
            newsLetter: true,
            provider: UserIdentityProvider.GOOGLE,
            predefinedPlatformId: platformId ?? null,
        });
    },
    async getThirdPartyRedirectUrl(platformId: string | undefined): Promise<string> {
        return domainHelper.getInternalUrl({
            path: '/redirect',
            platformId,
        });
    },
});

async function getGoogleClientIdAndSecret(platformId: string | undefined) {
    const clientId = system.getOrThrow(AppSystemProp.GOOGLE_CLIENT_ID);
    const clientSecret = system.getOrThrow(AppSystemProp.GOOGLE_CLIENT_SECRET);
    return {
        clientId: clientId,
        clientSecret: clientSecret,
    };
}

async function getAIxBlockClientIdAndSecret(platformId: string | undefined) {
    const clientId = system.getOrThrow(AppSystemProp.AIXBLOCK_CLIENT_ID);
    const clientSecret = system.getOrThrow(AppSystemProp.AIXBLOCK_CLIENT_SECRET);
    return {
        clientId: clientId,
        clientSecret: clientSecret,
    };
}

type LoginParams = {
    platformId: string | undefined;
    providerName: ThirdPartyAuthnProviderEnum;
};

type ClaimParams = {
    platformId: string | undefined;
    code: string;
    providerName: ThirdPartyAuthnProviderEnum;
};
