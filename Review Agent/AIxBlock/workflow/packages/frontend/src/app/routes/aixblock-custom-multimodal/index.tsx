import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useSearchParam } from 'react-use';

import { LoadingSpinner } from '@/components/ui/spinner';
import CustomMultimodal from '@/features/aixblock-custom-multimodal/components';
import { aixblockCustomMultimodalApi } from '@/features/aixblock-custom-multimodal/lib/aixblock-custom-multimodal-api';
import {
    AIxBlockMultimodalResponse,
    FLOW_RUN_ID_QUERY_PARAM_NAME,
    isNil,
    MULTIMODAL_KEY_PARAM_NAME,
    USE_DRAFT_QUERY_PARAM_NAME,
} from 'workflow-shared';
import NotFoundPage from '../404-page';

export const AIxBlockCustomMultimodal = () => {
    const { flowId } = useParams();
    const useDraft = useSearchParam(USE_DRAFT_QUERY_PARAM_NAME) === 'true';
    const flowRunId = useSearchParam(FLOW_RUN_ID_QUERY_PARAM_NAME) ?? '';
    const multimodalKey = useSearchParam(MULTIMODAL_KEY_PARAM_NAME) ?? '';

    const {
        data: form,
        isLoading,
        isError,
    } = useQuery<AIxBlockMultimodalResponse | null, Error>({
        queryKey: ['form', flowId],
        queryFn: () => aixblockCustomMultimodalApi.getForm({ flowId: flowId as string, flowRunId, multimodalKey, useDraft }),
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

            {form && !isLoading && (
                <CustomMultimodal form={form} flowId={flowId as string} flowRunId={flowRunId} multimodalKey={multimodalKey} useDraft={useDraft} />
            )}
        </>
    );
};
