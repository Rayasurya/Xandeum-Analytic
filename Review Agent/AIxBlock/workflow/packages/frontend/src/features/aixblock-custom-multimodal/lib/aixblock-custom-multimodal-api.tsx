import { api } from '@/lib/api';
import {
    AIxBlockMultimodalResponse,
    AIxBlockTasksResponse,
    FLOW_RUN_ID_QUERY_PARAM_NAME,
    LLmTypes,
    MULTIMODAL_KEY_PARAM_NAME,
    USE_DRAFT_QUERY_PARAM_NAME
} from 'workflow-shared';

export const aixblockCustomMultimodalApi = {
    getForm: ({ flowId, multimodalKey, flowRunId, useDraft }: { flowId: string, multimodalKey: string, flowRunId: string, useDraft?: boolean }) => {
        return api.get<AIxBlockMultimodalResponse>(`/v1/aixblock-tasks/custom-multimodal/${flowId}`, {
            [USE_DRAFT_QUERY_PARAM_NAME]: useDraft ?? false,
            [MULTIMODAL_KEY_PARAM_NAME]: multimodalKey,
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: flowRunId,
        });
    },
    updateLlmConfig: ({
        flowId,
        multimodalKey,
        flowRunId,
        useDraft,
        data,
    }: {
        flowId: string;
        multimodalKey: string;
        flowRunId: string;
        useDraft?: boolean;
        data: LLmTypes;
    }) => {
        return api.post<AIxBlockTasksResponse>(`/v1/aixblock-tasks/custom-multimodal/${flowId}`, data, {
            [USE_DRAFT_QUERY_PARAM_NAME]: useDraft ?? false,
            [MULTIMODAL_KEY_PARAM_NAME]: multimodalKey,
            [FLOW_RUN_ID_QUERY_PARAM_NAME]: flowRunId,
        });
    },
    callLink: (link: string) => {
        return api.get(link);
    },
};
