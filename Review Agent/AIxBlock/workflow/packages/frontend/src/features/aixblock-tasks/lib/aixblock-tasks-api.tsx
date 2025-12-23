import { api } from '@/lib/api';
import {
    AIxBlockTasksResponse,
    DATA_SOURCE_ID_PARAM_NAME,
    FLOW_RUN_ID_QUERY_PARAM_NAME,
    STEP_NAME_QUERY_PARAM_NAME,
    USE_DRAFT_QUERY_PARAM_NAME,
} from 'workflow-shared';

export const aixblockTasksApi = {
    getForm: ({ flowId, stepName, flowRunId, useDraft }: { flowId: string; stepName: string; flowRunId: string; useDraft?: boolean }) => {
        return api.get<AIxBlockTasksResponse>(`/v1/aixblock-tasks/${flowId}`, {
            [USE_DRAFT_QUERY_PARAM_NAME]: useDraft ?? false,
            [STEP_NAME_QUERY_PARAM_NAME]: stepName,
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: flowRunId,
        });
    },
    submitForm: ({
        flowId,
        stepName,
        flowRunId,
        dataSourceId,
        data,
        useDraft,
    }: {
        flowId: string;
        stepName: string;
        flowRunId: string;
        dataSourceId: string;
        data: any;
        useDraft?: boolean;
    }) => {
        return api.post<AIxBlockTasksResponse>(`/v1/aixblock-tasks/${flowId}`, data, {
            [USE_DRAFT_QUERY_PARAM_NAME]: useDraft ?? false,
            [STEP_NAME_QUERY_PARAM_NAME]: stepName,
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: flowRunId,
            [DATA_SOURCE_ID_PARAM_NAME]: dataSourceId,
        });
    },
    updateTaskStatus: ({
        flowId,
        stepName,
        flowRunId,
        dataSourceId,
        data,
        useDraft,
    }: {
        flowId: string;
        stepName: string;
        flowRunId: string;
        dataSourceId: string;
        data: any;
        useDraft?: boolean;
    }) => {
        return api.post<AIxBlockTasksResponse>(`/v1/aixblock-tasks/update-status/${flowId}`, data, {
            [USE_DRAFT_QUERY_PARAM_NAME]: useDraft ?? false,
            [STEP_NAME_QUERY_PARAM_NAME]: stepName,
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: flowRunId,
            [DATA_SOURCE_ID_PARAM_NAME]: dataSourceId,
        });
    },
    updateTaskAssignee: ({
        flowId,
        stepName,
        flowRunId,
        dataSourceId,
        data,
        useDraft,
    }: {
        flowId: string;
        stepName: string;
        flowRunId: string;
        dataSourceId: string;
        data: any;
        useDraft?: boolean;
    }) => {
        return api.post<AIxBlockTasksResponse>(`/v1/aixblock-tasks/update-assignee/${flowId}`, data, {
            [USE_DRAFT_QUERY_PARAM_NAME]: useDraft ?? false,
            [STEP_NAME_QUERY_PARAM_NAME]: stepName,
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: flowRunId,
            [DATA_SOURCE_ID_PARAM_NAME]: dataSourceId,
        });
    },
    callLink: (link: string) => {
        return api.get(link);
    },
};
