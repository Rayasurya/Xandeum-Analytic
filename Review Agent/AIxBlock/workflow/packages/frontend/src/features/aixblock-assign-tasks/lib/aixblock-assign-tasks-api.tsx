import { api } from '@/lib/api';
import {
    AIxBlockTasksResponse,
    ASSIGNEE_QUERY_PARAM_NAME,
    DATA_SOURCE_ID_PARAM_NAME,
    FLOW_RUN_ID_QUERY_PARAM_NAME,
    FLOW_VERSION_ID_QUERY_PARAM_NAME,
    MAPPING_KEY_QUERY_PARAM_NAME,
    STEP_NAME_QUERY_PARAM_NAME,
} from 'workflow-shared';

export const aixblockAssignTasksApi = {
    getDataSource: (assignee: string, flowId: string, flowRunId: string, flowVersionId: string, stepName: string, mappingKey: string) => {
        return api.get<AIxBlockTasksResponse>(`/v1/aixblock-assign-tasks/${flowId}`, {
            [STEP_NAME_QUERY_PARAM_NAME]: stepName,
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: flowRunId,
            [FLOW_VERSION_ID_QUERY_PARAM_NAME]: flowVersionId,
            [ASSIGNEE_QUERY_PARAM_NAME]: assignee,
            [MAPPING_KEY_QUERY_PARAM_NAME]: mappingKey,
        });
    },
    submitForm: ({
        flowId,
        flowRunId,
        data,
        dataSourceId,
        mappingKey,
        assignee,
    }: {
        flowId: string;
        flowRunId: string;
        data: any;
        dataSourceId: string;
        mappingKey: string;
        assignee: string;
    }) => {
        return api.post<AIxBlockTasksResponse>(`/v1/aixblock-assign-tasks/submit/${flowId}`, data, {
            [DATA_SOURCE_ID_PARAM_NAME]: dataSourceId,
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: flowRunId,
            [MAPPING_KEY_QUERY_PARAM_NAME]: mappingKey,
            [ASSIGNEE_QUERY_PARAM_NAME]: assignee,
        });
    },
    updateTaskStatus: ({
        flowId,
        flowRunId,
        data,
        dataSourceId,
        mappingKey,
        assignee,
    }: {
        flowId: string;
        flowRunId: string;
        data: any;
        dataSourceId: string;
        mappingKey: string;
        assignee: string;
    }) => {
        return api.post(`/v1/aixblock-assign-tasks/update-status/${flowId}`, data, {
            [DATA_SOURCE_ID_PARAM_NAME]: dataSourceId,
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: flowRunId,
            [MAPPING_KEY_QUERY_PARAM_NAME]: mappingKey,
            [ASSIGNEE_QUERY_PARAM_NAME]: assignee,
        });
    },
};
