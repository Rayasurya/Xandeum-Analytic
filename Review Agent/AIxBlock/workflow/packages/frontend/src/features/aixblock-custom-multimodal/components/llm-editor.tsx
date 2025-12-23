import { Button } from '@/components/ui/button';
import { LLmTypes } from 'workflow-shared';
import { t } from 'i18next';
import { useEffect, useState } from 'react';

declare const window: any;

type LlmEditorTypes = {
    config: object;
    handleUpdateConfig: (config: LLmTypes) => void;
};

const LlmEditor = (props: LlmEditorTypes) => {
    const { config, handleUpdateConfig } = props;
    const [llmConfig, setLlmConfig] = useState<LLmTypes>();
    const loadLLm = () => {
        try {
            const e = document.getElementById('aixblock-multimodal-editor');
            const ls = new window.LLM(
                {
                    type: 'editor',
                    runScript: (e: any) => {
                        console.log({ data: e });
                    },
                    logResponse: '',
                    preloadData: config
                        ? config
                        : {
                              environments: [],
                              code: '',
                          },
                    onLayoutUpdate: (e: any) => {
                        setLlmConfig(e);
                    },
                },
                e
            );
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadLLm();
    }, []);

    return (
        <div className="w-[calc(100vw - 3rem)] overflow-x-hidden h-full">
            <div id="aixblock-multimodal-editor" className="w-full h-[calc(100vh-80px)]" />
            <div className="w-full flex items-center justify-end mt-4 gap-4">
                <Button onClick={() => handleUpdateConfig(llmConfig as LLmTypes)}>{t('Save')}</Button>
            </div>
        </div>
    );
};

export default LlmEditor;
