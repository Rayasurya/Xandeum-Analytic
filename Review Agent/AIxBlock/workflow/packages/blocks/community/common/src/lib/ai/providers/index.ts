import { Property } from 'workflow-blocks-framework';
import { Static, Type } from '@sinclair/typebox';
import { AiProviderWithoutSensitiveData, isNil, SeekPage } from 'workflow-shared';
import { httpClient, HttpMethod } from '../../http';
import { aixblock, aixblockModels } from './aixblock';
import { anthropic } from './anthropic';
import { openai, openaiModels } from './openai';
import { replicate, replicateModels } from './replicate';
import { authHeader, hasMapper, model } from './utils';

export const AI_PROVIDERS_MAKRDOWN = {
    openai: `Follow these instructions to get your OpenAI API Key:

1. Visit the following website: https://platform.openai.com/account/api-keys.
2. Once on the website, locate and click on the option to obtain your OpenAI API Key.

It is strongly recommended that you add your credit card information to your OpenAI account and upgrade to the paid plan **before** generating the API Key. This will help you prevent 429 errors.
`,
    anthropic: `Follow these instructions to get your Claude API Key:

1. Visit the following website: https://console.anthropic.com/settings/keys.
2. Once on the website, locate and click on the option to obtain your Claude API Key.
`,
    replicate: `Follow these instructions to get your Replicate API Key:

1. Visit the following website: https://replicate.com/account/api-tokens.
2. Once on the website, locate and click on the option to obtain your Replicate API Key.
`,
    aixblock: `Follow these instructions to get your AIxBlock API Key:

1. Visit the following website: https://app.aixblock.io.
2. Once on the website, locate and click on Account Setting > Profile Settings to obtain your API Token.
`,
};

export const AI_PROVIDERS = [
    {
        logoUrl: 'https://cdn.activepieces.com/pieces/openai.png',
        defaultBaseUrl: 'https://api.openai.com',
        label: 'OpenAI' as const,
        value: 'openai' as const,
        models: openaiModels,
        auth: authHeader({ bearer: true }),
        factory: openai,
        instructionsMarkdown: AI_PROVIDERS_MAKRDOWN.openai,
    },
    {
        logoUrl: 'https://cdn.activepieces.com/pieces/claude.png',
        defaultBaseUrl: 'https://api.anthropic.com',
        label: 'Anthropic' as const,
        value: 'anthropic' as const,
        models: [
            model({
                label: 'claude-3-5-sonnet',
                value: 'claude-3-5-sonnet-latest',
                supported: ['text', 'function'],
            }),
            model({
                label: 'claude-3-opus',
                value: 'claude-3-opus-20240229',
                supported: ['text', 'function'],
            }),
            model({
                label: 'claude-3-sonnet',
                value: 'claude-3-sonnet-20240229',
                supported: ['text', 'function'],
            }),
            model({
                label: 'claude-3-5-haiku',
                value: 'claude-3-5-haiku-latest',
                supported: ['text', 'function'],
            }),
            model({
                label: 'claude-3-haiku',
                value: 'claude-3-haiku-20240307',
                supported: ['text', 'function'],
            }),
            model({
                label: 'claude-3-7-sonnet',
                value: 'claude-3-7-sonnet-latest',
                supported: ['text', 'function'],
            }),
        ],
        auth: authHeader({ name: 'x-api-key', bearer: false }),
        factory: anthropic,
        instructionsMarkdown: AI_PROVIDERS_MAKRDOWN.anthropic,
    },
    {
        logoUrl: 'https://cdn.activepieces.com/pieces/replicate.png',
        defaultBaseUrl: 'https://api.replicate.com',
        label: 'Replicate' as const,
        value: 'replicate' as const,
        models: replicateModels,
        auth: authHeader({ bearer: true }),
        factory: replicate,
        instructionsMarkdown: AI_PROVIDERS_MAKRDOWN.replicate,
    },
    {
        logoUrl: 'https://aixblock.io/assets/images/logo-img.svg',
        defaultBaseUrl: 'https://app.aixblock.io',
        label: 'AIxBlock' as const,
        value: 'aixblock' as const,
        models: aixblockModels,
        auth: authHeader({ bearer: false, name: 'Authorization', mapper: (value) => `Token ${value}` }),
        factory: aixblock,
        instructionsMarkdown: AI_PROVIDERS_MAKRDOWN.aixblock,
    },
];

export const aiProps = (supported: 'text' | 'image' | 'function' | 'moderation' | 'audio') => ({
    provider: Property.Dropdown<AiProvider, true>({
        displayName: 'Provider',
        required: true,
        defaultValue: 'openai',
        refreshers: [],
        options: async (_, ctx) => {
            const providers = await httpClient.sendRequest<SeekPage<AiProviderWithoutSensitiveData>>({
                method: HttpMethod.GET,
                url: `${ctx.server.apiUrl}v1/ai-providers`,
                headers: {
                    Authorization: `Bearer ${ctx.server.token}`,
                },
            });
            if (providers.body.data.length === 0) {
                return {
                    disabled: true,
                    options: [],
                    placeholder: 'No AI providers configured by the admin.',
                };
            }

            const aiProviders: typeof AI_PROVIDERS = [];
            for (const aiProvider of AI_PROVIDERS) {
                if (aiProvider.value === 'aixblock') {
                    const aixblockModels = await getAIxBlockModels(ctx.server.apiUrl, ctx.server.token, supported);
                    aiProvider.models = aixblockModels;
                }
                aiProviders.push(aiProvider);
            }

            const providersWithMetadata = providers.body.data.flatMap((p) => {
                const providerMetadata = aiProviders.find(
                    (meta) => meta.value === p.provider && meta.models.some((m) => m.supported.includes(supported))
                );
                if (isNil(providerMetadata)) {
                    return [];
                }
                return [
                    {
                        value: providerMetadata.value,

                        label: providerMetadata.label,
                        models: providerMetadata.models,
                    },
                ];
            });

            return {
                placeholder: 'Select AI Provider',
                disabled: false,
                options: providersWithMetadata,
            };
        },
    }),
    model: Property.Dropdown<string, true>({
        displayName: 'Model',
        required: true,
        defaultValue: 'gpt-4o',
        refreshers: ['provider'],
        options: async ({ provider }, context) => {
            if (isNil(provider)) {
                return {
                    disabled: true,

                    options: [],
                    placeholder: 'Select AI Provider',
                };
            }
            const providerModel = AI_PROVIDERS.find((p) => p.value === provider);
            if (!providerModel) {
                return {
                    disabled: true,
                    options: [],
                };
            }

            let models;
            if (provider === 'aixblock') {
                const aixblockModels = await getAIxBlockModels(context.server.apiUrl, context.server.token, supported);
                providerModel.models = aixblockModels;
            }
            models = providerModel.models.filter((m) => m.supported.includes(supported));
            return {
                disabled: isNil(models),
                options: models ?? [],
            };
        },
    }),
    advancedOptions: Property.DynamicProperties<false>({
        displayName: 'Advanced Options',
        required: false,
        refreshers: ['provider', 'model'],
        props: async ({ model, provider }) => {
            const modelMetadata = AI_PROVIDERS.find((p) => p.value === (provider as unknown as string))?.models.find(
                (m) => m.value === (model as unknown as string)
            );
            if (isNil(modelMetadata) || !hasMapper(modelMetadata)) {
                return {};
            }
            return modelMetadata.mapper.advancedOptions ?? {};
        },
    }),
});

async function getAIxBlockModels(apiUrl: string, apiToken: string, modelType: string) {
    try {
        const modelMarketplaceResp = await httpClient.sendRequest({
            method: HttpMethod.GET,
            url: `${apiUrl}v1/aixblock/provider/models`,
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
            queryParams: {
                modelType,
            }
        });
        const modelsMarketplace = modelMarketplaceResp.body;
        return modelsMarketplace.map((modelMarket: IModelMarket) => {
            return model({ label: modelMarket.name, value: modelMarket.id, supported: ['text', 'image', 'audio'] });
        });
    } catch (error) {
        console.error(error);
    }
    return [];
}

export type AiProviderMetadata = (typeof AI_PROVIDERS)[number];

export const AiProvider = Type.Union(AI_PROVIDERS.map((p) => Type.Literal(p.value)));

export type AiProvider = Static<typeof AiProvider>;

export * from './utils';

export * from './aixblock';

interface IModelMarket {
    id: string;
    name: string;
}
