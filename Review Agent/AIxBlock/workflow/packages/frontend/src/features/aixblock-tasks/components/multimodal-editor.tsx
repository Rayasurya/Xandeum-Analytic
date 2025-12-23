import { Button } from '@/components/ui/button';
import { t } from 'i18next';
import { useEffect, useRef } from 'react';

declare const window: any;

export type TMultimodalEditorProps = {
    annotation: any;
    config: object;
    onSubmit: (d: Record<string, any>) => void;
    multimodalKey: string;
};

export default function MultimodalEditor({ config, annotation, onSubmit, multimodalKey }: TMultimodalEditorProps) {
    const dataRef = useRef(annotation ?? {});

    const loadLLm = () => {
        try {
            const e = document.getElementById('aixblock-llm-editor');
            const ls = new window.LLM(
                {
                    type: 'form',
                    runScript: (e: any) => {
                        console.log({ data: e });
                    },
                    logResponse: '',
                    preloadData: config,
                    onLayoutUpdate: (e: any) => {
                        console.log(e);
                    },
                    onFormSubmit: (...args: any[]) => {
                        console.log(args);
                    },
                    initData: dataRef.current,
                    onDataUpdate: (d: Record<string, any>) => (dataRef.current = d),
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
        <div className="w-[calc(100vw - 3rem)] h-full overflow-x-hidden">
            {config && multimodalKey ? (
                <>
                    <div id="aixblock-llm-editor" className="w-full h-[calc(100vh-10rem)]" />
                    <div className="w-full flex items-center justify-end mt-4 gap-4">
                        <Button
                            onClick={() => {
                                onSubmit?.(dataRef.current);
                            }}
                        >
                            {t('Save')}
                        </Button>
                    </div>
                </>
            ) : (
                <div>Error when load multimodal config from this key <span className='font-bold'>{multimodalKey}</span>. Please check your config for multimodal key again</div>
            )}
        </div>
    );
}
