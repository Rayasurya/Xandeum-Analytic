import semVer from 'semver';

import { api } from '@/lib/api';
import {
    AIxBlockWebFormResponse,
    FLOW_RUN_ID_QUERY_PARAM_NAME,
    FLOW_VERSION_ID_QUERY_PARAM_NAME,
    HumanInputFormResult,
    STEP_NAME_QUERY_PARAM_NAME,
    USE_DRAFT_QUERY_PARAM_NAME,
} from 'workflow-shared';

export const aixblockWebFormsApi = {
    getForm: (flowId: string, stepName: string, flowVersionId: string, flowRunId: string, useDraft?: boolean) => {
        if (stepName) {
            return api.get<AIxBlockWebFormResponse>(`/v1/aixblock-web-forms/form-action/${flowId}`, {
                [USE_DRAFT_QUERY_PARAM_NAME]: useDraft ?? false,
                [STEP_NAME_QUERY_PARAM_NAME]: stepName,
                [FLOW_VERSION_ID_QUERY_PARAM_NAME]: flowVersionId,
                [FLOW_RUN_ID_QUERY_PARAM_NAME]: flowRunId,
            });
        }
        return api.get<AIxBlockWebFormResponse>(`/v1/aixblock-web-forms/form/${flowId}`, {
            [USE_DRAFT_QUERY_PARAM_NAME]: useDraft ?? false,
        });
    },
    submitForm: async (
        formResult: AIxBlockWebFormResponse,
        useDraft: boolean,
        stepName: string,
        flowVersionId: string,
        flowRunId: string,
        data: unknown
    ) => {
        const processedData = await processData(data as Record<string, unknown>, formResult);
        const suffix = getSuffix(useDraft, formResult.props.waitForResponse);
        if (stepName) {
            return api.post<HumanInputFormResult | null>(
                `/v1/aixblock-web-forms/form-action/submit-form-to-store/${formResult.id}?useDraft=${useDraft}&stepName=${stepName}&flowVersionId=${flowVersionId}&flowRunId=${flowRunId}`,
                processedData,
                undefined,
                {
                    'Content-Type': processedData instanceof FormData ? 'multipart/form-data' : 'application/json',
                }
            );
        }
        return api.post<HumanInputFormResult | null>(`/v1/webhooks/${formResult.id}${suffix}`, processedData, undefined, {
            'Content-Type': processedData instanceof FormData ? 'multipart/form-data' : 'application/json',
        });
    },
    callLink: (link: string) => {
        return api.get(link);
    },
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            if (reader.result) {
                resolve(reader.result as string);
            } else {
                reject(new Error('Failed to read file'));
            }
        };
        reader.onerror = () => {
            reject(reader.error);
        };
    });
};

async function processData(data: Record<string, unknown>, formResult: AIxBlockWebFormResponse) {
    const useFormData = semVer.gte(formResult.version, '0.4.1');
    const formData = new FormData();
    const processedData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
        if (useFormData) {
            formData.append(key, value instanceof File ? value : String(value));
        } else {
            processedData[key] = value instanceof File ? await fileToBase64(value) : value;
        }
    }
    return useFormData ? formData : processedData;
}

function getSuffix(useDraft: boolean, waitForResponse: boolean): string {
    if (useDraft) {
        return waitForResponse ? '/draft/sync' : '/draft';
    }
    return waitForResponse ? '/sync' : '';
}
