
import {
    FastifyPluginCallbackTypebox,
} from '@fastify/type-provider-typebox'
import { ListIssuesParams } from 'workflow-axb-shared'
import { Permission, PrincipalType } from 'workflow-shared'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../helper/pagination'
import { issuesService } from '../issues-service'

const Controller: FastifyPluginCallbackTypebox = (app, _opts, done) => {
    app.get('/', ListIssuesRequest, async (req) => {
        return issuesService(app.log).v2.list({
            projectId: req.query.projectId,
            cursor: req.query.cursor,
            limit: req.query.limit ?? DEFAULT_PAGE_SIZE,
            page: req.query.page ?? DEFAULT_PAGE,
        })
    })
    done()
}

const ListIssuesRequest = {
    config: {
        allowedPrincipals: [
            PrincipalType.USER,
        ],
        permission: Permission.READ_ISSUES,
    },
    schema: {
        querystring: ListIssuesParams,
    },
}
export default Controller