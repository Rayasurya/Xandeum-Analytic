
import axios from 'axios'
import { FastifyBaseLogger } from 'fastify'
import { OAuth2AuthorizationMethod } from 'workflow-blocks-framework'
import {
    AIxBlockError,
    AppConnectionType,
    CloudOAuth2ConnectionValue,
    ErrorCode,
} from 'workflow-shared'
import { system } from '../../../../helper/system/system'
import {
    ClaimOAuth2Request,
    OAuth2Service,
    RefreshOAuth2Request,
} from '../oauth2-service'

export const cloudOAuth2Service = (log: FastifyBaseLogger): OAuth2Service<CloudOAuth2ConnectionValue> => ({
    refresh: async ({
        blockName,
        connectionValue,
    }: RefreshOAuth2Request<CloudOAuth2ConnectionValue>): Promise<CloudOAuth2ConnectionValue> => {
        const requestBody = {
            refreshToken: connectionValue.refresh_token,
            pieceName: blockName,
            clientId: connectionValue.client_id,
            edition: system.getEdition(),
            authorizationMethod: connectionValue.authorization_method,
            tokenUrl: connectionValue.token_url,
        }
        const response = (
            await axios.post('https://secrets.activepieces.com/refresh', requestBody, {
                timeout: 10000,
            })
        ).data
        return {
            ...connectionValue,
            ...response,
            props: connectionValue.props,
            type: AppConnectionType.CLOUD_OAUTH2,
        }
    },
    claim: async ({
        request,
        blockName,
    }: ClaimOAuth2Request): Promise<CloudOAuth2ConnectionValue> => {
        try {
            const cloudRequest: ClaimWithCloudRequest = {
                code: request.code,
                codeVerifier: request.codeVerifier,
                authorizationMethod: request.authorizationMethod,
                clientId: request.clientId,
                tokenUrl: request.tokenUrl,
                pieceName: blockName,
                edition: system.getEdition(),
            }
            const value = (
                await axios.post<CloudOAuth2ConnectionValue>(
                    'https://secrets.activepieces.com/claim',
                    cloudRequest,
                    {
                        timeout: 10000,
                    },
                )
            ).data
            return {
                ...value,
                token_url: request.tokenUrl,
                props: request.props,
            }
        }
        catch (e: unknown) {
            log.error(e)
            throw new AIxBlockError({
                code: ErrorCode.INVALID_CLOUD_CLAIM,
                params: {
                    blockName,
                },
            })
        }
    },
})

type ClaimWithCloudRequest = {
    pieceName: string
    code: string
    codeVerifier: string | undefined
    authorizationMethod: OAuth2AuthorizationMethod | undefined
    edition: string
    clientId: string
    tokenUrl: string
}
