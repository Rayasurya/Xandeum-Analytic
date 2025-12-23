
import {
    FastifyPluginCallbackTypebox,
} from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import {  ListFlowsRequest, Permission, PopulatedFlow, PrincipalType, SeekPage, SERVICE_KEY_SECURITY_OPENAPI } from 'workflow-shared'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../helper/pagination'
import { flowService } from '../flow.service'

const Controller: FastifyPluginCallbackTypebox = (app, _opts, done) => {
    app.get('/', ListFlowsRequestOptions, async (request) => {
        return flowService(request.log).v2.list({
            projectId: request.principal.projectId,
            folderId: request.query.folderId,
            cursorRequest: request.query.cursor ?? null,
            limit: request.query.limit ?? DEFAULT_PAGE_SIZE,
            page: request.query.page ?? DEFAULT_PAGE,
            status: request.query.status,
            name: request.query.name,
            versionState: request.query.versionState,
        })
    })
    done()
}

const ListFlowsRequestOptions = {
    config: {
        allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
        permission: Permission.READ_FLOW,
    },
    schema: {
        tags: ['flows'],
        description: 'List flows',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        querystring: ListFlowsRequest,
        response: {
            [StatusCodes.OK]: SeekPage(PopulatedFlow),
        },
    },
}
export default Controller