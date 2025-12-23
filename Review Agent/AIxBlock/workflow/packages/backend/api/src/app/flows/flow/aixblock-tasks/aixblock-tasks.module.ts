import {
    ApId,
    DATA_SOURCE_ID_PARAM_NAME,
    FLOW_RUN_ID_QUERY_PARAM_NAME,
    MULTIMODAL_KEY_PARAM_NAME,
    Permission,
    PrincipalType,
    STEP_NAME_QUERY_PARAM_NAME,
    USE_DRAFT_QUERY_PARAM_NAME,
} from 'workflow-shared';
import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { aixblockTasksService } from './aixblock-tasks.service';

export const aixblockTasksModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(aixblockTasksController, { prefix: '/v1/aixblock-tasks' });
};

const aixblockTasksController: FastifyPluginAsyncTypebox = async (app) => {
    app.get('/:flowId', GetFormDataByFlowIdRequest, async (request) => {
        return aixblockTasksService(request.log).getTasksByFlowIdOrThrow(
            request.params.flowId,
            request.query.stepName,
            request.query.flowRunId,
            request.query.useDraft ?? false
        );
    });
    app.post('/:flowId', SubmitFormDataByFlowIdRequest, async (request) => {
        return aixblockTasksService(request.log).submitDataSource(
            request.body,
            request.params.flowId,
            request.query.stepName,
            request.query.flowRunId,
            request.query.dataSourceId,
            request.query.useDraft ?? false
        );
    });
    app.post('/update-status/:flowId', UpdateTaskStatusRequest, async (request) => {
        return aixblockTasksService(request.log).updateTaskStatus(
            request.body,
            request.params.flowId,
            request.query.stepName,
            request.query.flowRunId,
            request.query.dataSourceId,
            request.query.useDraft ?? false
        );
    });
    app.post('/update-assignee/:flowId', UpdateTaskAssigneeRequest, async (request) => {
        return aixblockTasksService(request.log).updateTaskAssignee(
            request.body,
            request.params.flowId,
            request.query.stepName,
            request.query.flowRunId,
            request.query.dataSourceId,
            request.query.useDraft ?? false
        );
    });

    // Multimodal
    app.get('/custom-multimodal/:flowId', GetMultimodalConfigRequest, async (request) => {
        return aixblockTasksService(request.log).getMultimodalConfig(
            request.params.flowId,
            request.query.multimodalKey,
            request.query.flowRunId,
            request.query.useDraft ?? false
        );
    });
    app.post('/custom-multimodal/:flowId', UpdateMultimodalConfigRequest, async (request) => {
        return aixblockTasksService(request.log).updateMultimodalConfig(
            request.body,
            request.params.flowId,
            request.query.multimodalKey,
            request.query.flowRunId,
            request.query.useDraft ?? false
        );
    });
};

const GetFormDataByFlowIdRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.READ_RUN,
    },
    schema: {
        params: Type.Object({
            flowId: ApId,
        }),
        querystring: Type.Object({
            [USE_DRAFT_QUERY_PARAM_NAME]: Type.Optional(Type.Boolean()),
            [STEP_NAME_QUERY_PARAM_NAME]: Type.String(),
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: Type.String(),
        }),
    },
};

const SubmitFormDataByFlowIdRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.READ_RUN,
    },
    schema: {
        params: Type.Object({
            flowId: ApId,
        }),
        querystring: Type.Object({
            [USE_DRAFT_QUERY_PARAM_NAME]: Type.Optional(Type.Boolean()),
            [STEP_NAME_QUERY_PARAM_NAME]: Type.String(),
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: Type.String(),
            [DATA_SOURCE_ID_PARAM_NAME]: Type.String(),
        }),
    },
};

const UpdateTaskStatusRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.READ_FLOW,
    },
    schema: {
        params: Type.Object({
            flowId: ApId,
        }),
        querystring: Type.Object({
            [USE_DRAFT_QUERY_PARAM_NAME]: Type.Optional(Type.Boolean()),
            [STEP_NAME_QUERY_PARAM_NAME]: Type.String(),
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: Type.String(),
            [DATA_SOURCE_ID_PARAM_NAME]: Type.String(),
        }),
    },
};

const UpdateTaskAssigneeRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.READ_RUN,
    },
    schema: {
        params: Type.Object({
            flowId: ApId,
        }),
        querystring: Type.Object({
            [USE_DRAFT_QUERY_PARAM_NAME]: Type.Optional(Type.Boolean()),
            [STEP_NAME_QUERY_PARAM_NAME]: Type.String(),
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: Type.String(),
            [DATA_SOURCE_ID_PARAM_NAME]: Type.String(),
        }),
    },
};

const GetMultimodalConfigRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.READ_FLOW,
    },
    schema: {
        params: Type.Object({
            flowId: ApId,
        }),
        querystring: Type.Object({
            [USE_DRAFT_QUERY_PARAM_NAME]: Type.Optional(Type.Boolean()),
            [MULTIMODAL_KEY_PARAM_NAME]: Type.String(),
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: Type.String(),
        }),
    },
};



const UpdateMultimodalConfigRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.READ_RUN,
    },
    schema: {
        params: Type.Object({
            flowId: ApId,
        }),
        querystring: Type.Object({
            [USE_DRAFT_QUERY_PARAM_NAME]: Type.Optional(Type.Boolean()),
            [MULTIMODAL_KEY_PARAM_NAME]: Type.String(),
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: Type.String(),
        }),
    },
};
