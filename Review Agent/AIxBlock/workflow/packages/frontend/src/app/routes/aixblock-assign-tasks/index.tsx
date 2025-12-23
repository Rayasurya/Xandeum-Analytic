import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { LoadingSpinner } from '@/components/ui/spinner';
import { AIxBlockTasksResponse, isNil, MAPPING_KEY_QUERY_PARAM_NAME, MULTIMODAL_KEY_PARAM_NAME } from 'workflow-shared';

import { aixblockAssignTasksApi } from '@/features/aixblock-assign-tasks/lib/aixblock-assign-tasks-api';
import { ListTasks } from '@/features/aixblock-tasks/components/list-tasks';
import { useMemo } from 'react';
import { useSearchParam } from 'react-use';
import NotFoundPage from '../404-page';

export const AIxBlockAssignTasks = () => {
    const { taskEncodedKey } = useParams();
    const mappingKey = useSearchParam(MAPPING_KEY_QUERY_PARAM_NAME) ?? '';
    const multimodalKey = useSearchParam(MULTIMODAL_KEY_PARAM_NAME) ?? '';

    const { assignee, flowId, flowRunId, flowVersionId, stepName } = useMemo(() => {
        const decoded = atob(taskEncodedKey ?? '');
        const split = decoded.split('/');
        const res: any = {
            assignee: '',
            flowId: '',
            flowRunId: '',
            flowVersionId: '',
            stepName: '',
        };
        for (const item of split) {
            const [key, value] = item.split(':');
            res[key] = value;
        }
        return res;
    }, [taskEncodedKey]);

    const {
        data: form,
        isLoading,
        isError,
    } = useQuery<AIxBlockTasksResponse | null, Error>({
        queryKey: ['dataSource', flowId],
        queryFn: () => aixblockAssignTasksApi.getDataSource(assignee, flowId, flowRunId, flowVersionId, stepName, mappingKey),
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
                    approveLink={''}
                    rejectLink={''}
                    flowId={flowId as string}
                    flowRunId={flowRunId}
                    stepName={stepName}
                    assignee={assignee}
                    flowVersionId={flowVersionId}
                    mappingKey={mappingKey}
                    useDraft={false}
                    formType="assign-task"
                    multimodalKey={multimodalKey}
                />
            )}
        </>
    );
};
