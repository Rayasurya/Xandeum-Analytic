import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createAction, PieceAuth, Property } from 'workflow-blocks-framework';
import { llmModelOptions } from '../../common/constants';
import { crawlWebsite, getProxies } from '../../common/crawling';

export const crawlingWithLlmModel = createAction({
    name: 'crawling-with-llm-modal',
    displayName: 'Crawling with LLM model',
    auth: PieceAuth.None(),
    description: 'Reliable web scrapers by using crawlee and LLM model',
    requireAuth: false,
    props: {
        website: Property.ShortText({
            displayName: 'Website',
            required: true,
        }),
        timeout: Property.Number({
            displayName: 'Timeout (ms)',
            required: true,
            defaultValue: 60000,
        }),
        proxy: Property.LongText({
            displayName: 'Proxy',
            required: false,
            description: 'Can add a comma separated list of proxies.',
        }),
        modelUrl: Property.LongText({
            displayName: 'Model url',
            required: true,
        }),
        modelId: Property.StaticDropdown({
            displayName: 'Model ID',
            required: true,
            options: {
                options: llmModelOptions,
            },
        }),
        prompt: Property.ShortText({
            displayName: 'Prompt',
            required: true,
        }),
        task: Property.ShortText({
            displayName: 'Task',
            required: true,
            defaultValue: 'text-generation',
        }),
        tokenLength: Property.Number({
            displayName: 'Token length',
            required: true,
            defaultValue: 50,
        }),
        maxGenLen: Property.Number({
            displayName: 'Max gen len',
            required: true,
            defaultValue: 1024,
        }),
        temperature: Property.Number({
            displayName: 'Temperature',
            required: true,
            defaultValue: 0.9,
        }),
        topK: Property.Number({
            displayName: 'Top k',
            required: true,
            defaultValue: 0,
        }),
        topP: Property.Number({
            displayName: 'Top p',
            required: true,
            defaultValue: 0.5,
        }),
        seed: Property.Number({
            displayName: 'Seed',
            required: true,
            defaultValue: 0,
        }),
    },
    async run(context) {
        const { website, modelUrl, timeout, modelId, prompt, task, tokenLength, maxGenLen, temperature, topK, topP, seed, proxy } =
            context.propsValue;

        const data = await crawlWebsite(website, timeout, getProxies(proxy || ''));

        const response = await httpClient.sendRequest({
            method: HttpMethod.POST,
            url: `${modelUrl}/action?command=predict`,
            body: {
                prompt: `${prompt} from this HTML:\`\`\`\n${data}\`\`\` \n and only return raw json`,
                model_id: modelId,
                token_lenght: tokenLength,
                task: task,
                text: '',
                max_gen_len: maxGenLen,
                temperature: temperature,
                top_k: topK,
                top_p: topP,
                seed: seed,
            },
        });

        return response.body;
    },
});
