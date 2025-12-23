
import {
    FastifyPluginCallbackTypebox,
} from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { AppConnectionWithoutSensitiveData, ListAppConnectionsRequestQuery, Permission, PrincipalType, SeekPage, SERVICE_KEY_SECURITY_OPENAPI } from 'workflow-shared'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../helper/pagination'
import { appConnectionService } from '../app-connection-service/app-connection-service'

export const appConnectionController: FastifyPluginCallbackTypebox = (app, _opts, done) => {
    app.get('/', ListAppConnectionsRequest, async (request): Promise<SeekPage<AppConnectionWithoutSensitiveData>> => {
        const { displayName, blockName, status, page, limit, scope, cursor } = request.query

        const appConnections = await appConnectionService(request.log).v2.list({
            blockName,
            displayName,
            status,
            scope,
            platformId: request.principal.platform.id,
            projectId: request.principal.projectId,
            limit: limit ?? DEFAULT_PAGE_SIZE,
            page: page ?? DEFAULT_PAGE,
            cursorRequest: cursor ?? null,
        })

        const appConnectionsWithoutSensitiveData: SeekPage<AppConnectionWithoutSensitiveData> = {
            ...appConnections,
            data: appConnections.data.map(appConnectionService(request.log).removeSensitiveData),
        }
        return appConnectionsWithoutSensitiveData
    },
    )
    done()
}

const ListAppConnectionsRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
        permission: Permission.READ_APP_CONNECTION,
    },
    schema: {
        tags: ['app-connections'],
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        querystring: ListAppConnectionsRequestQuery,
        description: 'List app connections',
        response: {
            [StatusCodes.OK]: SeekPage(AppConnectionWithoutSensitiveData),
        },
    },
}