import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useSearchParam } from 'react-use';

import { LoadingSpinner } from '@/components/ui/spinner';
import { ListTasks } from '@/features/aixblock-tasks/components/list-tasks';
import { aixblockTasksApi } from '@/features/aixblock-tasks/lib/aixblock-tasks-api';
import {
    AIxBlockTasksResponse,
    FLOW_RUN_ID_QUERY_PARAM_NAME,
    isNil,
    MULTIMODAL_KEY_PARAM_NAME,
    STEP_NAME_QUERY_PARAM_NAME,
    USE_DRAFT_QUERY_PARAM_NAME,
} from 'workflow-shared';
import NotFoundPage from '../404-page';

export const AIxBlockTasks = () => {
    const { flowId } = useParams();
    const useDraft = useSearchParam(USE_DRAFT_QUERY_PARAM_NAME) === 'true';
    const stepName = useSearchParam(STEP_NAME_QUERY_PARAM_NAME) ?? '';
    const flowRunId = useSearchParam(FLOW_RUN_ID_QUERY_PARAM_NAME) ?? '';
    const multimodalKey = useSearchParam(MULTIMODAL_KEY_PARAM_NAME) ?? '';

    const {
        data: form,
        isLoading,
        isError,
    } = useQuery<AIxBlockTasksResponse | null, Error>({
        queryKey: ['form', flowId],
        queryFn: () => aixblockTasksApi.getForm({ flowId: flowId as string, stepName, flowRunId, useDraft }),
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
                <ListTasks
                    rawDataSource={form.dataSource}
                    approveLink={form.approveLink}
                    rejectLink={form.rejectLink}
                    flowId={flowId as string}
                    flowRunId={flowRunId}
                    stepName={stepName}
                    useDraft={useDraft}
                    formType="list-task"
                    assignee={''}
                    flowVersionId={''}
                    mappingKey={''}
                    multimodalKey={multimodalKey}
                />
            )}
        </>
    );
};
