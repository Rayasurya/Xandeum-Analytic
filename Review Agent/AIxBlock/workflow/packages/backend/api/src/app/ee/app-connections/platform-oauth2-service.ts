import { FastifyBaseLogger } from 'fastify'
import { PropertyType } from 'workflow-blocks-framework'
import {
    AppConnectionType,
    isNil,
    PlatformOAuth2ConnectionValue,
} from 'workflow-shared'
import {
    ClaimOAuth2Request,
    RefreshOAuth2Request,
} from '../../app-connection/app-connection-service/oauth2/oauth2-service'
import { credentialsOauth2Service } from '../../app-connection/app-connection-service/oauth2/services/credentials-oauth2-service'
import { blockMetadataService } from '../../blocks/block-metadata-service'
import { oauthAppService } from '../oauth-apps/oauth-app.service'

export const platformOAuth2Service = (log: FastifyBaseLogger) => ({
    claim: async ({
        request,
        blockName,
        platformId,
        projectId,
    }: ClaimOAuth2Request): Promise<PlatformOAuth2ConnectionValue> => {
        const { auth } = await blockMetadataService(log).getOrThrow({
            name: blockName,
            version: undefined,
            projectId,
            platformId,
        })
        if (isNil(auth) || auth.type !== PropertyType.OAUTH2) {
            throw new Error(
                'Cannot claim auth for non oauth2 property ' +
                auth?.type +
                ' ' +
                blockName,
            )
        }
        const oauth2App = await oauthAppService.getWithSecret({
            blockName,
            clientId: request.clientId,
            platformId,
        })

        const claimedValue = await credentialsOauth2Service(log).claim({
            request: {
                ...request,
                clientId: oauth2App.clientId,
                clientSecret: oauth2App.clientSecret,
            },
            projectId,
            platformId,
            blockName,
        })
        return {
            ...claimedValue,
            type: AppConnectionType.PLATFORM_OAUTH2,
        }
    },
    refresh: async ({
        blockName,
        projectId,
        platformId,
        connectionValue,
    }: RefreshOAuth2Request<PlatformOAuth2ConnectionValue>): Promise<PlatformOAuth2ConnectionValue> => {
        const oauth2App = await oauthAppService.getWithSecret({
            blockName,
            clientId: connectionValue.client_id,
            platformId,
        })
        const newValue = await credentialsOauth2Service(log).refresh({
            blockName,
            projectId,
            platformId,
            connectionValue: {
                ...connectionValue,
                type: AppConnectionType.OAUTH2,
                client_secret: oauth2App.clientSecret,
            },
        })
        return {
            expires_in: newValue.expires_in,
            client_id: newValue.client_id,
            token_type: newValue.token_type,
            access_token: newValue.access_token,
            claimed_at: newValue.claimed_at,
            refresh_token: newValue.refresh_token,
            redirect_url: newValue.redirect_url,
            scope: newValue.scope,
            token_url: newValue.token_url,
            data: newValue.data,
            props: newValue.props,
            authorization_method: newValue.authorization_method,
            type: AppConnectionType.PLATFORM_OAUTH2,
        }
    },
})
