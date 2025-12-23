
import {
    FastifyPluginCallbackTypebox,
    Type,
} from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { FlowRun, ListFlowRunsRequestQuery, Permission, PrincipalType, SeekPage, SERVICE_KEY_SECURITY_OPENAPI } from 'workflow-shared'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../helper/pagination'
import { flowRunService } from '../flow-run-service'

const Controller: FastifyPluginCallbackTypebox = (app, _opts, done) => {
    app.get('/', ListRequest, async (request) => {
        return flowRunService(request.log).v2.list({
            projectId: request.query.projectId,
            flowId: request.query.flowId,
            tags: request.query.tags,
            status: request.query.status,
            cursor: request.query.cursor ?? null,
            limit: Number(request.query.limit ?? DEFAULT_PAGE_SIZE),
            page: Number(request.query.page ?? DEFAULT_PAGE),
            createdAfter: request.query.createdAfter,
            createdBefore: request.query.createdBefore,
        })
    })
    done()
}

const FlowRunFilteredWithNoSteps = Type.Omit(FlowRun, ['terminationReason', 'pauseMetadata', 'steps'])
const ListRequest = {
    config: {
        permission: Permission.READ_RUN,
        allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    },
    schema: {
        tags: ['flow-runs'],
        description: 'List Flow Runs',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        querystring: ListFlowRunsRequestQuery,
        response: {
            [StatusCodes.OK]: SeekPage(FlowRunFilteredWithNoSteps),
        },
    },
}
export default Controller