import { createAzure } from '@ai-sdk/azure';
import { createOpenAI } from '@ai-sdk/openai';
import AIxBlock from '@tonyshark/aixblock-sdk';
import { generateObject } from 'ai';
import { FastifyBaseLogger } from 'fastify';
import { askAiModelStoreKey, httpClient, HttpMethod } from 'workflow-blocks-common';
import { AIxBlockError, CopilotProviderType, CopilotSettings, ErrorCode, isNil, StoreEntry } from 'workflow-shared';
import { repoFactory } from '../../../core/db/repo-factory';
import { StoreEntryEntity } from '../../../store-entry/store-entry-entity';
import { copilotService } from '../../copilot.service';
import { selectIcon } from './icon-agent';
import { getCodeGenerationPrompt } from './prompts/code-generation.prompt';
import { CodeAgentResponse, codeGenerationSchema, defaultResponse, Message } from './types';

const storeEntryRepo = repoFactory<StoreEntry>(StoreEntryEntity);

export async function generateCode(
    requirement: string,
    platformId: string,
    projectId: string,
    conversationHistory: Message[] = [],
    log: FastifyBaseLogger
): Promise<CodeAgentResponse> {
    try {
        let model;
        const platform = await copilotService(log).getOrThrow({ platformId, projectId });
        const copilotSettings: CopilotSettings = platform.setting;
        if (isNil(copilotSettings)) {
            throw new AIxBlockError({
                code: ErrorCode.COPILOT_FAILED,
                params: { message: 'No copilot settings found' },
            });
        }
        const provider = getDefaultProvider(copilotSettings);

        const lastCodeResponse = conversationHistory.reverse().find((msg) => msg.role === 'assistant' && msg.content.includes('export const code ='));
        const systemPrompt = getCodeGenerationPrompt(conversationHistory, lastCodeResponse);
        if (provider !== CopilotProviderType.AIXBLOCK) {
            try {
                switch (provider) {
                    case CopilotProviderType.OPENAI: {
                        const provider = copilotSettings.providers[CopilotProviderType.OPENAI];
                        model = createOpenAI({
                            apiKey: provider?.apiKey,
                        }).chat('gpt-4o');
                        break;
                    }
                    case CopilotProviderType.AZURE_OPENAI: {
                        const provider = copilotSettings.providers[CopilotProviderType.AZURE_OPENAI];
                        model = createAzure({
                            apiKey: provider?.apiKey,
                            resourceName: provider?.resourceName,
                        }).chat(provider?.deploymentName || 'gpt-4o');
                        break;
                    }
                }
            } catch (error) {
                log.error(error);
                throw new AIxBlockError({
                    code: ErrorCode.COPILOT_FAILED,
                    params: { message: 'Your Copilot is not configured. Please configure your Copilot settings.' },
                });
            }
            const llmResponse = await generateObject({
                model,
                system: systemPrompt,
                schema: codeGenerationSchema,
                prompt: `Generate TypeScript code for this automation flow requirement: ${requirement}`,
                temperature: 0,
            });

            if (isNil(llmResponse?.object)) {
                log.warn({ platformId, requirement }, '[generateCode] No response from AI model');
                throw new Error('Failed to generate code: No response from AI model');
            }

            const resultInputs =
                llmResponse.object.inputs?.reduce((acc, input) => {
                    acc[input.name] = input.suggestedValue ?? '';
                    return acc;
                }, {} as Record<string, string>) ?? {};

            const icon = await selectIcon(model, requirement, conversationHistory);

            return {
                code: llmResponse.object.code,
                inputs: resultInputs,
                icon: icon ?? 'https://aixblock.io/assets/images/logo-img.svg',
                title: llmResponse.object.title ?? defaultResponse.title,
            };
        } else {
            const provider = copilotSettings.providers[CopilotProviderType.AIXBLOCK];
            if (isNil(provider)) {
                throw new Error('Missing API key or API url of provider');
            }
            const modelId = copilotSettings.providers[CopilotProviderType.AIXBLOCK]?.model;
            const key = `flow_${platformId}/${askAiModelStoreKey}/modelId_${modelId}`;

            const storeEntry = await storeEntryRepo().findOne({
                where: {
                    key: key,
                    projectId,
                },
            });
            const aixblock = new AIxBlock({
                baseApi: provider.baseUrl,
                apiKey: provider.apiKey,
            });

            let mlBackend: any = storeEntry?.value;

            if (!mlBackend?.id) {
                throw new Error('Model was not installed');
            } else {
                try {
                    const mlResponse = await aixblock.getMlBackendById(String(mlBackend.id));
                    mlBackend = mlResponse.data;
                } catch {
                    throw new Error('Error while get model from platform');
                }
                if (mlBackend.error_message || mlBackend.install_status === 'failed' || !mlBackend.raw_url) {
                    throw new Error('Error while install model');
                }
            }
            console.log('mlBackend', mlBackend);

            const rawUrl = mlBackend.raw_url;

            if (!rawUrl || mlBackend.install_status !== 'compleated') {
                throw new Error('Can not get url of model.');
            }

            const prompt = `
            
            ${systemPrompt}

    Finally based on the above. Generate TypeScript code for this automation flow requirement: ${requirement}`

            console.log(prompt)

            const predictResponse = await httpClient.sendRequest({
                method: HttpMethod.POST,
                url: `${rawUrl}/action`,
                queryParams: {
                    command: 'predict',
                },
                body: {
                    prompt: prompt,
                    command: 'predict',
                    params: {
                        prompt: prompt,
                    }
                },
            });
            const predict = predictResponse.body;
            const content = predict?.result?.[0]?.result?.[0]?.value?.text?.[0] || '...';
            return {
                code: content,
                inputs: {},
                icon: 'https://aixblock.io/assets/images/logo-img.svg',
                title: 'Custom Code',
            };
        }
    } catch (error) {
        log.error({ error, requirement, platformId }, '[generateCode] Failed to generate code');
        if (error instanceof AIxBlockError && error.message === ErrorCode.COPILOT_FAILED) {
            throw error;
        }
        throw new Error(error instanceof Error ? error.message : 'Failed to generate code');
    }
}

function getDefaultProvider(copilotSettings: CopilotSettings): CopilotProviderType {
    if (copilotSettings.providers[CopilotProviderType.OPENAI]?.apiKey) {
        return CopilotProviderType.OPENAI;
    }
    if (copilotSettings.providers[CopilotProviderType.AZURE_OPENAI]?.apiKey) {
        return CopilotProviderType.AZURE_OPENAI;
    }
    if (copilotSettings.providers[CopilotProviderType.AIXBLOCK]?.apiKey) {
        return CopilotProviderType.AIXBLOCK;
    }
    throw new AIxBlockError({
        code: ErrorCode.COPILOT_FAILED,
        params: { message: 'No default provider found' },
    });
}
