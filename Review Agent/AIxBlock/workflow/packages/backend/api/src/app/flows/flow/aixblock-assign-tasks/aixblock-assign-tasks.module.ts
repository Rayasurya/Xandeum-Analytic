import {
    ApId,
    ASSIGNEE_QUERY_PARAM_NAME,
    DATA_SOURCE_ID_PARAM_NAME,
    FLOW_RUN_ID_QUERY_PARAM_NAME,
    FLOW_VERSION_ID_QUERY_PARAM_NAME,
    MAPPING_KEY_QUERY_PARAM_NAME,
    Permission,
    PrincipalType,
    STEP_NAME_QUERY_PARAM_NAME,
} from 'workflow-shared';
import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { aixblockAssignTasksService } from './aixblock-assign-tasks.service';

export const aixblockAssignTasksModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(aixblockAssignTasksController, { prefix: '/v1/aixblock-assign-tasks' });
};

const aixblockAssignTasksController: FastifyPluginAsyncTypebox = async (app) => {
    app.get('/:flowId', GetFormDataByFlowIdRequest, async (request) => {
        return aixblockAssignTasksService(request.log).getDataSource(
            request.query.assignee,
            request.params.flowId,
            request.query.flowRunId,
            request.query.flowVersionId,
            request.query.stepName,
            request.query.mappingKey,
            request.principal.id
        );
    });
    app.post('/submit/:flowId', SubmitFormRequest, async (request) => {
        return aixblockAssignTasksService(request.log).submitForm(
            request.body,
            request.query.assignee,
            request.params.flowId,
            request.query.flowRunId,
            request.query.mappingKey,
            request.query.dataSourceId,
            request.principal.id
        );
    });
    app.post('/update-status/:flowId', UpdateStatusByFlowIdRequest, async (request) => {
        return aixblockAssignTasksService(request.log).updateStatusDataSource(
            request.body,
            request.query.assignee,
            request.params.flowId,
            request.query.mappingKey,
            request.query.flowRunId,
            request.query.dataSourceId,
            request.principal.id
        );
    });
};

const GetFormDataByFlowIdRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.READ_FLOW,
    },
    schema: {
        params: Type.Object({
            flowId: ApId,
        }),
        querystring: Type.Object({
            [ASSIGNEE_QUERY_PARAM_NAME]: Type.String(),
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: Type.String(),
            [FLOW_VERSION_ID_QUERY_PARAM_NAME]: Type.String(),
            [STEP_NAME_QUERY_PARAM_NAME]: Type.String(),
            [MAPPING_KEY_QUERY_PARAM_NAME]: Type.String(),
        }),
    },
};

const SubmitFormRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.READ_FLOW,
    },
    schema: {
        params: Type.Object({
            flowId: ApId,
        }),
        querystring: Type.Object({
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: Type.String(),
            [MAPPING_KEY_QUERY_PARAM_NAME]: Type.String(),
            [DATA_SOURCE_ID_PARAM_NAME]: Type.String(),
            [ASSIGNEE_QUERY_PARAM_NAME]: Type.String(),
        }),
    },
};

const UpdateStatusByFlowIdRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.READ_FLOW,
    },
    schema: {
        params: Type.Object({
            flowId: ApId,
        }),
        querystring: Type.Object({
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: Type.String(),
            [MAPPING_KEY_QUERY_PARAM_NAME]: Type.String(),
            [DATA_SOURCE_ID_PARAM_NAME]: Type.String(),
            [ASSIGNEE_QUERY_PARAM_NAME]: Type.String(),
        }),
    },
};
