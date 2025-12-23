import { createAction, Property } from 'workflow-blocks-framework';
import { AI, aiProps } from 'workflow-blocks-common';

export const generateAudio = createAction({
    name: 'generateAudio',
    displayName: 'Generate Audio',
    description: '',
    requireAuth: false,
    props: {
        provider: aiProps('audio').provider,
        model: aiProps('audio').model,
        prompt: Property.LongText({
            displayName: 'Prompt',
            required: true,
        }),
    },
    async run(context) {
        const ai = AI({
            provider: context.propsValue.provider,
            server: context.server,
        });

        const audio = ai.audio;

        if (!audio) {
            throw new Error(`Model ${context.propsValue.model} does not support audio generation.`);
        }

        const response = await audio.generate({
            model: context.propsValue.model,
            prompt: context.propsValue.prompt,
        });

        if (response) {
            return context.files.write({
                data: Buffer.from(response.audio, 'base64'),
                fileName: 'audio.mp3',
            });
        } else {
            throw new Error('Unknown error occurred. Please check audio configuration.');
        }
    },
});
