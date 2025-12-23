import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useSearchParam } from 'react-use';

import { LoadingSpinner } from '@/components/ui/spinner';
import { ApForm } from '@/features/aixblock-web-forms/components/web-form';
import {
    AIxBlockWebFormResponse,
    FLOW_RUN_ID_QUERY_PARAM_NAME,
    FLOW_VERSION_ID_QUERY_PARAM_NAME,
    isNil,
    STEP_NAME_QUERY_PARAM_NAME,
    USE_DRAFT_QUERY_PARAM_NAME,
} from 'workflow-shared';

import { aixblockWebFormsApi } from '@/features/aixblock-web-forms/lib/aixblock-web-forms-api';
import NotFoundPage from '../404-page';

export const AIxBlockWebFormPage = () => {
    const { flowId } = useParams();
    const useDraft = useSearchParam(USE_DRAFT_QUERY_PARAM_NAME) === 'true';
    const stepName = useSearchParam(STEP_NAME_QUERY_PARAM_NAME) ?? '';
    const flowVersionId = useSearchParam(FLOW_VERSION_ID_QUERY_PARAM_NAME) ?? '';
    const flowRunId = useSearchParam(FLOW_RUN_ID_QUERY_PARAM_NAME) ?? '';

    const {
        data: form,
        isLoading,
        isError,
    } = useQuery<AIxBlockWebFormResponse | null, Error>({
        queryKey: ['form', flowId],
        queryFn: () => aixblockWebFormsApi.getForm(flowId!, stepName, flowVersionId, flowRunId, useDraft),
        enabled: !isNil(flowId),
        retry: false,
        staleTime: Infinity,
    });

    return (
        <>
            {isLoading && (
                <div className="bg-background flex h-screen w-screen items-center justify-center ">
                    <LoadingSpinner size={50}></LoadingSpinner>
                </div>
            )}
            {isError && (
                <NotFoundPage
                    title="Hmm... this form isn't here"
                    description="The form you're looking for isn't here or maybe hasn't been published by the owner yet"
                />
            )}

            {form && !isLoading && <ApForm form={form} useDraft={useDraft} stepName={stepName} flowVersionId={flowVersionId} flowRunId={flowRunId} />}
        </>
    );
};
