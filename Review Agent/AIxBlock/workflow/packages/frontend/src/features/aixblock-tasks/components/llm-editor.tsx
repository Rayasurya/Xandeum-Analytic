import { useCallback, useEffect, useRef } from 'react';

declare const window: any;

interface LlmEditorProps {
  onUpdateAnnotation: (store: any, annotation: any) => Promise<void>;
  properties: any;
  config: string;
}

const LlmEditor = ({
  onUpdateAnnotation,
  properties,
  config,
}: LlmEditorProps) => {
  const propertiesRef = useRef<any>(properties);
  const onUpdateAnnotationRef = useRef<LlmEditorProps['onUpdateAnnotation']>(
    () => new Promise<void>(() => void 0),
  );
  const lsRef = useRef<any>(null);

  useEffect(() => {
    onUpdateAnnotationRef.current = onUpdateAnnotation;
  }, [onUpdateAnnotation]);

  const loadLLm = useCallback(() => {
    const ls = new window.AIxBlock('aixblock-tasks-llm-editor', {
      config,
      interfaces: [
        'basic',
        'predictions',
        'topbar',
        'predictions:menu',
        'annotations:menu',
        'annotations:current',
        'side-column',
        'annotations:tabs',
        'predictions:tabs',
        'controls',
        'submit',
        'update',
        'edit-history',
      ],
      user: {
        id: 1,
        first_name: 'Annotator',
        last_name: '',
        username: '',
        email: 'user@annotator',
        avatar: null,
        initials: 'A',
      },
      // users: [
      //   {
      //     id: 1,
      //     first_name: 'Nick',
      //     last_name: 'Skriabin',
      //     username: 'nick',
      //     email: 'nick@heartex.ai',
      //     avatar: null,
      //     initials: 'ni',
      //   },
      // ],
      task: {
        annotations: [],
        predictions: [],
        id: 1,
        data: propertiesRef.current,
      },
      // history: annotationHistory,
      canCreateLabel: true,
      onSubmitAnnotation: (store: any, annotation: any) => {
        store.setFlags({ isSubmitting: true });
        onUpdateAnnotationRef.current(store, annotation).finally(() => {
          store.setFlags({ isSubmitting: false });
        });
      },
      onUpdateAnnotation: (store: any, annotation: any) => {
        store.setFlags({ isSubmitting: true });
        onUpdateAnnotationRef.current(store, annotation).finally(() => {
          store.setFlags({ isSubmitting: false });
        });
      },
    });

    ls.on('AIxBlockLoad', async (store: any) => {
      ls.on('selectAnnotation', (next: any) => {
        if (next.type === 'annotation') {
          // store.setHistory(annotationHistory)
        }
      });

      ls.on('regionFinishedDrawing', (region: any, list: any) => {
        console.log('finish drawing', { region, list });
      });

      ls.on('labelCreated', async (type: any, label: any) => {
        console.log('Label created', type, label);
      });

      ls.on('labelDeleted', async (type: any, label: any) => {
        console.log('Label deleted', type, label);
      });

      ls.on('aiPrompt', async (base64Audio: any, prompt: any) => {
        console.log('Prompt', base64Audio, prompt);
        return { status: 'Ok' };
      });

      const { annotationStore: as } = store;
      const a = as.createAnnotation();
      as.selectAnnotation(a.id);

      if (
        propertiesRef.current?.value &&
        Array.isArray(propertiesRef.current?.value)
      ) {
        a.appendResults(propertiesRef.current?.value);
      }
    });

    lsRef.current = ls;
  }, [config]);

  useEffect(() => {
    loadLLm();
  }, [loadLLm]);

  return <div id="aixblock-tasks-llm-editor" className="!w-full h-full" />;
};

export default LlmEditor;
