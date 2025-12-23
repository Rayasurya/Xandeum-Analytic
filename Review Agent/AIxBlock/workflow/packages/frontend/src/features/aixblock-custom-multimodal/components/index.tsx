import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { AIxBlockMultimodalResponse, LLmTypes } from 'workflow-shared';
import { useMutation } from '@tanstack/react-query';
import { t } from 'i18next';
import { aixblockCustomMultimodalApi } from '../lib/aixblock-custom-multimodal-api';
import LlmEditor from './llm-editor';

const CustomMultimodal = ({
    flowId,
    multimodalKey,
    flowRunId,
    useDraft,
    form,
}: {
    flowId: string;
    multimodalKey: string;
    flowRunId: string;
    useDraft: boolean;
    form: AIxBlockMultimodalResponse;
}) => {


    const { mutate: mutateSubmitForm, isPending: isPendingSubmitForm } = useMutation({
        mutationFn: async ({ llmConfig }: { llmConfig: LLmTypes }) => {
            await aixblockCustomMultimodalApi.updateLlmConfig({ flowId, multimodalKey, flowRunId, useDraft, data: llmConfig })
            await aixblockCustomMultimodalApi.callLink(form.approveLink);
        },
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

    const handleSave = async (llmConfig: LLmTypes) => {
        mutateSubmitForm({
            llmConfig
        })
    };

    return (
        <div className="h-screen w-screen px-6">
            <LlmEditor config={form.multimodalConfig} handleUpdateConfig={handleSave} />
        </div>
    );
};

export default CustomMultimodal;
