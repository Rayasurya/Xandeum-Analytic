import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { createAction, PieceAuth, Property } from 'workflow-blocks-framework';
import { aiModelOptions, AiType, deepSeekApiUrl } from '../../common/constants';
import { crawlWebsite, getProxies } from '../../common/crawling';

export const crawlingWithAiAssistant = createAction({
    name: 'crawling-with-ai-assistant',
    displayName: 'Crawling with AI assistant',
    auth: PieceAuth.None(),
    description: 'Reliable web scrapers by using crawlee and AI assistant',
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
        aiModel: Property.StaticDropdown({
            displayName: 'Ai Model',
            required: true,
            options: {
                options: aiModelOptions,
            },
        }),
        proxy: Property.LongText({
            displayName: 'Proxy',
            required: false,
            description: "Can add a comma separated list of proxies."
        }),
        modelApiKey: Property.LongText({
            displayName: 'Model API key',
            required: true,
        }),
        prompt: Property.LongText({
            displayName: 'Extraction Prompt',
            required: true,
        }),
    },
    async run(context) {
        const { website, modelApiKey, prompt, timeout, aiModel, proxy } = context.propsValue;

        const data = await crawlWebsite(website, timeout, getProxies(proxy || ''));

        const modelSelected = aiModelOptions.find((option) => option.value === aiModel);

        const aiType: AiType = modelSelected?.type ?? AiType.OPENAI;

        const promptText = `${prompt} from this HTML:\`\`\`\n${data}\`\`\` \n and Respond ONLY in strict JSON format. No explanation, no extra text.`;

        // Use openai sdk
        if ([AiType.DEEPSEEK, AiType.OPENAI].includes(aiType as AiType)) {
            return await extractWithOpenAI(modelApiKey, aiType, aiModel, promptText);
        }

        // Use gemini sdk
        if (aiType === AiType.GEMINI) {
            return await extractWithGeminiAI(modelApiKey, aiType, aiModel, promptText);
        }

        return {};
    },
});

export const extractWithOpenAI = async (modelApiKey: string, aiType: AiType, aiModel: string, prompt: string) => {
    const openai = new OpenAI({ apiKey: modelApiKey });

    if (aiType === AiType.DEEPSEEK) {
        openai.baseURL = deepSeekApiUrl;
    }

    const response = await openai.chat.completions.create({
        model: aiModel,
        messages: [
            { role: 'system', content: 'You are a web scraping assistant.' },
            { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
    });

    return response;
};

export const extractWithGeminiAI = async (modelApiKey: string, aiType: AiType, aiModel: string, prompt: string) => {
    const genAI = new GoogleGenerativeAI(modelApiKey);

    const model = genAI.getGenerativeModel({ model: aiModel });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    try {
        const json = JSON.parse(text);
        return json;
    } catch (e) {
        return text;
    }
};
