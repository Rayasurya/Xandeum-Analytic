import { ShowPoweredBy } from '@/components/show-powered-by';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { aixblockCustomMultimodalApi } from '@/features/aixblock-custom-multimodal/lib/aixblock-custom-multimodal-api';
import JSONTable from '@/features/aixblock-tasks/components/json-table';
import LlmEditor from '@/features/aixblock-tasks/components/llm-editor';
import MultimodalEditor from '@/features/aixblock-tasks/components/multimodal-editor';
import { aixblockTasksApi } from '@/features/aixblock-tasks/lib/aixblock-tasks-api';
import { flagsHooks } from '@/hooks/flags-hooks';
import { api } from '@/lib/api';
import { AIxBlockMultimodalResponse, ApFlagId, flowStructureUtil, isNil } from 'workflow-shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { aixblockAssignTasksApi } from '../../aixblock-assign-tasks/lib/aixblock-assign-tasks-api';
import ImageAnnotation from './image-annotation';

type ApFormProps = {
    rawDataSource: any;
    approveLink: string;
    rejectLink: string;
    flowId: string;
    flowRunId: string;
    stepName: string;
    assignee: string;
    flowVersionId: string;
    mappingKey: string;
    useDraft: boolean;
    formType: 'list-task' | 'assign-task';
    multimodalKey: string;
};

const ListTasks = ({
    rawDataSource,
    approveLink,
    rejectLink,
    flowId,
    stepName,
    flowRunId,
    assignee,
    flowVersionId,
    mappingKey,
    useDraft,
    formType,
    multimodalKey,
}: ApFormProps) => {
    const { data: showPoweredBy } = flagsHooks.useFlag<boolean>(ApFlagId.SHOW_POWERED_BY_IN_FORM);
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const [viewDetailDataSource, setViewDetailDataSource] = useState<any>();
    const [viewDetailDataSourceId, setViewDetailDataSourceId] = useState<string>();

    const [dataSource, setDataSource] = useState(rawDataSource);
    const [multimodalConfig, setMultimodalConfig] = useState<any>();

    const detailForm = useForm();

    useEffect(() => {
        setDataSource(rawDataSource);
    }, [rawDataSource]);

    useEffect(() => {
        initMultimodalConfig();
    }, []);

    const jsonData = useMemo(() => {
        const d = flowStructureUtil.extractRequiredValues(dataSource);
        return d.datasource;
    }, [dataSource]);

    const initMultimodalConfig = async () => {
        const resp = await aixblockCustomMultimodalApi.getForm({ flowId, flowRunId, useDraft, multimodalKey });
        setMultimodalConfig(resp.multimodalConfig)
    };

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ data, dataSourceId }: { data: any; dataSourceId: string }) =>
            formType === 'assign-task'
                ? aixblockAssignTasksApi.submitForm({
                      flowId,
                      flowRunId,
                      mappingKey,
                      dataSourceId: dataSourceId,
                      data,
                      assignee,
                  })
                : aixblockTasksApi.submitForm({ flowId, stepName, flowRunId, dataSourceId, data, useDraft }),
        onSuccess: async (formResult) => {
            toast({
                title: t('Success'),
                description: t('Your submission was successfully received.'),
                duration: 3000,
                variant: 'success',
            });
        },
        onError: (error) => {
            if (api.isError(error)) {
                const status = error.response?.status;
                if (status === 404) {
                    toast({
                        title: t('Flow not found'),
                        description: t('The flow you are trying to submit to does not exist.'),
                        duration: 3000,
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: t('Error'),
                        description: t('The flow failed to execute.'),
                        duration: 3000,
                    });
                }
            }
            console.error(error);
        },
    });

    const { mutate: mutateSubmitForm, isPending: isPendingSubmitForm } = useMutation({
        mutationFn: async ({ link }: { link: string }) => aixblockTasksApi.callLink(link),
        onSuccess: async () => {
            toast({
                title: t('Success'),
                description: t('Your submission was successfully received.'),
                duration: 3000,
                variant: 'success',
            });
        },
        onError: (error) => {
            if (api.isError(error)) {
                toast({
                    variant: 'destructive',
                    title: t('Error'),
                    description: t('Failed to execute.'),
                    duration: 3000,
                });
            }
            console.error(error);
        },
    });

    const onClickViewDetail = (dataSourceId: string) => {
        const ds = dataSource.find((d: any) => d.id === dataSourceId);
        if (ds?.properties) {
            Object.entries(ds.properties).map((properties) => {
                const nameField = properties[0];
                const fieldData: any = properties[1];
                detailForm.setValue(nameField, fieldData?.value || '');
            });
        }
        setViewDetailDataSourceId(dataSourceId);
        setViewDetailDataSource(ds);
        setIsOpenDialog(true);
    };

    const submitDetailForm = async (data: any) => {
        mutate({
            data: data,
            dataSourceId: viewDetailDataSourceId ?? '',
        });
    };

    const isContainAnnotation = (dataSource: any) => {
        return (
            viewDetailDataSource?.properties &&
            Object.entries(viewDetailDataSource.properties).some((properties: any) => {
                const nameField = properties[0];
                if (nameField === 'annotation') {
                    return true;
                }
                return false;
            })
        );
    };

    const handleApproveForm = async () => {
        mutateSubmitForm({
            link: approveLink,
        });
    };

    const handleRejectForm = async () => {
        mutateSubmitForm({
            link: rejectLink,
        });
    };

    const handleUpdateStatus = async (dataSourceId: string, data: any) => {
        toast({
            title: t('Loading'),
            description: t('Updating task status'),
            duration: 3000,
        });
        try {
            if (formType === 'assign-task') {
                await aixblockAssignTasksApi.updateTaskStatus({
                    flowId,
                    flowRunId,
                    mappingKey,
                    dataSourceId,
                    data,
                    assignee,
                });
            } else {
                await aixblockTasksApi.updateTaskStatus({ flowId, stepName, flowRunId, dataSourceId, data, useDraft });
            }
            setDataSource((prevDatasource: any) => {
                const newDataSource = prevDatasource.map((item: any) => {
                    if (item.id === dataSourceId) {
                        item.status = data.status;
                    }
                    return item;
                });
                return newDataSource;
            });
            toast({
                title: t('Success'),
                description: t('Status is updated.'),
                duration: 3000,
                variant: 'success',
            });
        } catch (e) {
            toast({
                title: t('Error'),
                description: t('Failed to update status.'),
                duration: 3000,
                variant: 'destructive',
            });
            console.error('Update tasks status', e);
        }
    };

    const handleUpdateAssignee = async (dataSourceId: string, data: any) => {
        toast({
            title: t('Loading'),
            description: t('Updating task assignee'),
            duration: 3000,
        });
        try {
            await aixblockTasksApi.updateTaskAssignee({ flowId, stepName, flowRunId, dataSourceId, data, useDraft });
            setDataSource((prevDatasource: any) => {
                const newDataSource = prevDatasource.map((item: any) => {
                    if (item.id === dataSourceId) {
                        item.assignee = data.assignee;
                    }
                    return item;
                });
                return newDataSource;
            });
            toast({
                title: t('Success'),
                description: t('Assignee is updated.'),
                duration: 3000,
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: t('Error'),
                description: t('Failed to update assignee.'),
                duration: 3000,
                variant: 'destructive',
            });
            console.error('Update assignee', error);
        }
    };

    const allowChangeAssignee = formType === 'list-task';

    const { data: multiModal } = useQuery<AIxBlockMultimodalResponse | null, Error>({
        queryKey: ['form', flowId],
        queryFn: () => aixblockCustomMultimodalApi.getForm({ flowId: flowId as string, flowRunId, multimodalKey, useDraft }),
        enabled: !isNil(flowId),
        retry: false,
        staleTime: Infinity,
    });

    return (
        <div className="w-full h-full flex">
            <div className="container py-20">
                <Card className="mx-auto">
                    <CardHeader>
                        <CardTitle className="text-center">AIxBlock Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {formType === 'assign-task' && (
                            <p className="text-left">
                                {t('User: ')}
                                {assignee}
                            </p>
                        )}
                        <JSONTable
                            dataSource={jsonData}
                            className="my-4"
                            onClickViewDetail={onClickViewDetail}
                            handleUpdateStatus={handleUpdateStatus}
                            handleUpdateAssignee={handleUpdateAssignee}
                            allowChangeAssignee={allowChangeAssignee}
                        />
                        {formType === 'list-task' && (
                            <div className="w-full flex items-center justify-end mt-4 gap-4">
                                <Button type="submit" className="w-fit" loading={isPending || isPendingSubmitForm} onClick={handleApproveForm}>
                                    {t('Approve')}
                                </Button>
                                <Button
                                    variant={'outline-destructive'}
                                    className="w-fit"
                                    loading={isPending || isPendingSubmitForm}
                                    onClick={handleRejectForm}
                                >
                                    {t('Reject')}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <div className="mt-2">
                    <ShowPoweredBy position="static" show={showPoweredBy ?? false} />
                </div>
            </div>
            <Dialog open={isOpenDialog} onOpenChange={(open) => setIsOpenDialog(open)}>
                <DialogContent withCloseButton className="w-screen h-screen max-w-screen overflow-auto">
                    <FormProvider {...detailForm}>
                        <div className="w-full">
                            <div className="w-full flex items-center gap-10 h-full pt-4">
                                <div className="w-1/3 h-full">
                                    <JSONTable
                                        dataSource={jsonData}
                                        className="my-4"
                                        onClickViewDetail={onClickViewDetail}
                                        handleUpdateStatus={handleUpdateStatus}
                                        handleUpdateAssignee={handleUpdateAssignee}
                                        allowChangeAssignee={allowChangeAssignee}
                                    />
                                </div>
                                <div className="w-full h-full">
                                    {viewDetailDataSource?.editorType === 'llm' && (
                                        <LlmEditor
                                            properties={viewDetailDataSource?.properties?.annotation}
                                            onUpdateAnnotation={async (store: any, annotate: any) => {
                                                const annotation = annotate.serializeAnnotation();
                                                detailForm.setValue('annotation', annotation);
                                                submitDetailForm(detailForm.getValues());
                                            }}
                                            config=""
                                        />
                                    )}
                                    {viewDetailDataSource?.editorType === 'image-editor' && viewDetailDataSource?.properties?.annotation && (
                                        <ImageAnnotation
                                            properties={viewDetailDataSource?.properties?.annotation}
                                            onSubmit={(annotation: any) => {
                                                const images = annotation.images;
                                                detailForm.setValue('annotation', images);
                                                submitDetailForm(detailForm.getValues());
                                            }}
                                        />
                                    )}
                                    {viewDetailDataSource?.editorType === 'multimodal' && viewDetailDataSource?.properties?.annotation && multiModal && (
                                        <MultimodalEditor
                                            config={multimodalConfig}
                                            annotation={viewDetailDataSource?.properties?.annotation?.value ?? {}}
                                            onSubmit={(annotation: any) => {
                                                detailForm.setValue('annotation', annotation);
                                                submitDetailForm(detailForm.getValues());
                                            }}
                                            multimodalKey={multimodalKey}
                                        />
                                    )}
                                </div>
                                {!isContainAnnotation && (
                                    <div className="w-full flex items-center justify-end mt-4">
                                        <Button type="submit" className="w-fit" loading={isPending}>
                                            {t('Submit')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FormProvider>
                </DialogContent>
            </Dialog>
        </div>
    );
};

ListTasks.displayName = 'ListTasks';
export { ListTasks };
