import { isAxiosError } from 'axios'
import { FastifyBaseLogger } from 'fastify'
import { PropertyType } from 'workflow-blocks-framework'
import {
    AIxBlockError,
    AppConnection,
    AppConnectionType,
    assertNotNullOrUndefined,
    BaseOAuth2ConnectionValue,
    deleteProps,
    ErrorCode,
    OAuth2GrantType,
    PlatformId,
} from 'workflow-shared'
import { blockMetadataService } from '../../../blocks/block-metadata-service'

export const oauth2Util = (log: FastifyBaseLogger) => ({
    formatOAuth2Response: (response: Omit<BaseOAuth2ConnectionValue, 'claimed_at'>): BaseOAuth2ConnectionValue => {
        const secondsSinceEpoch = Math.round(Date.now() / 1000)
        const formattedResponse: BaseOAuth2ConnectionValue = {
            ...response,
            data: response,
            claimed_at: secondsSinceEpoch,
        }

        deleteProps(formattedResponse.data, [
            'access_token',
            'expires_in',
            'refresh_token',
            'scope',
            'token_type',
        ])
        return formattedResponse
    },
    isExpired: (connection: BaseOAuth2ConnectionValue): boolean => {
        const secondsSinceEpoch = Math.round(Date.now() / 1000)
        const grantType = connection.grant_type ?? OAuth2GrantType.AUTHORIZATION_CODE
        if (
            grantType === OAuth2GrantType.AUTHORIZATION_CODE &&
            !connection.refresh_token
        ) {
            return false
        }
        const expiresIn = connection.expires_in ?? 60 * 60
        const refreshThreshold = 15 * 60
        return (
            secondsSinceEpoch + refreshThreshold >= connection.claimed_at + expiresIn
        )
    },
    isUserError: (e: unknown): boolean => {
        if (isAxiosError(e)) {
            const error = e.response?.data.error
            switch (error) {
                case 'invalid_grant':
                    return true
                case 'invalid_request':
                case 'invalid_client':
                case 'invalid_scope':
                case 'unauthorized_client':
                case 'unsupported_grant_type':
                default:
                    return false
            }
        }
        return false
    },
    getOAuth2TokenUrl: async ({
        projectId,
        platformId,
        blockName,
        props,
    }: OAuth2TokenUrlParams): Promise<string> => {
        const blockMetadata = await blockMetadataService(log).getOrThrow({
            name: blockName,
            projectId,
            platformId,
            version: undefined,
        })
        const auth = blockMetadata.auth
        assertNotNullOrUndefined(auth, 'auth')
        switch (auth.type) {
            case PropertyType.OAUTH2:
                return resolveUrl(auth.tokenUrl, props)
            default:
                throw new AIxBlockError({
                    code: ErrorCode.INVALID_APP_CONNECTION,
                    params: {
                        error: 'invalid auth type',
                    },
                })
        }
    },
    removeRefreshTokenAndClientSecret: (connection: AppConnection): AppConnection => {
        if (connection.value.type === AppConnectionType.OAUTH2 && connection.value.grant_type === OAuth2GrantType.CLIENT_CREDENTIALS) {
            connection.value.client_secret = '(REDACTED)'
        }
        if (connection.value.type === AppConnectionType.OAUTH2
            || connection.value.type === AppConnectionType.CLOUD_OAUTH2
            || connection.value.type === AppConnectionType.PLATFORM_OAUTH2) {
            connection.value = {
                ...connection.value,
                refresh_token: '(REDACTED)',
            }
        }
        return connection
    },
})

type OAuth2TokenUrlParams = {
    projectId: string | undefined
    platformId: PlatformId
    blockName: string
    props?: Record<string, string>
}

function resolveUrl(
    url: string,
    props: Record<string, unknown> | undefined,
): string {
    if (!props) {
        return url
    }
    for (const [key, value] of Object.entries(props)) {
        url = url.replace(`{${key}}`, String(value))
    }
    return url
}