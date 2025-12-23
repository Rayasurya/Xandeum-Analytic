import { Static, Type } from '@sinclair/typebox'
import { BaseModelSchema } from '../common'

export enum AskCopilotTool {
    GENERATE_CODE = 'generate_code',
    GENERATE_HTTP_REQUEST = 'generate_http_request',
}

export const AskCopilotRequest = Type.Object({
    context: Type.Array(Type.Object({
        role: Type.Union([Type.Literal('user'), Type.Literal('assistant')]),
        content: Type.String(),
    })),
    selectedStepName: Type.Optional(Type.String()),
    flowVersionId: Type.String(),
    flowId: Type.String(),
    prompt: Type.String(),
    tools: Type.Array(Type.Enum(AskCopilotTool)),
})

export type AskCopilotRequest = Static<typeof AskCopilotRequest>

export const AskCopilotCodeResponse = Type.Object({
    code: Type.String(),
    packageJson: Type.Object({
        dependencies: Type.Record(Type.String(), Type.String()),
    }),
    inputs: Type.Record(Type.String(), Type.String()),
    icon: Type.Optional(Type.String()),
    title: Type.String(),
    textMessage: Type.Optional(Type.String()),
})

export type AskCopilotCodeResponse = Static<typeof AskCopilotCodeResponse>

export const AskCopilotHttpRequestResponse = Type.Object({
    headers: Type.Record(Type.String(), Type.String()),
    body: Type.String(),
    statusCode: Type.Number(),
    queryParams: Type.Record(Type.String(), Type.String()),
    method: Type.String(),
    url: Type.String(),
})

export type AskCopilotHttpRequestResponse = Static<typeof AskCopilotHttpRequestResponse>

export const AskCopilotResponse = Type.Union([
    AskCopilotCodeResponse,
    AskCopilotHttpRequestResponse,
])

export type AskCopilotResponse = Static<typeof AskCopilotResponse>


export enum CopilotProviderType {
    OPENAI = 'openai',
    AZURE_OPENAI = 'azureOpenai',
    AIXBLOCK = 'aixblock',
}
  
export const OpenAiProvider = Type.Object({
    baseUrl: Type.String(),
    apiKey: Type.String(),
})

export type OpenAiProvider = Static<typeof OpenAiProvider>

export const AzureOpenAiProvider = Type.Object({
    resourceName: Type.String(),
    deploymentName: Type.String(),
    apiKey: Type.String(),
})

export type AzureOpenAiProvider = Static<typeof AzureOpenAiProvider>

export const AIxBlockProvider = Type.Object({
    baseUrl: Type.String(),
    apiKey: Type.String(),
    model: Type.String(),
})

export type AIxBlockProvider = Static<typeof AIxBlockProvider>

export const CopilotSettings = Type.Object({
    providers: Type.Object({
        [CopilotProviderType.OPENAI]: Type.Optional(OpenAiProvider),
        [CopilotProviderType.AZURE_OPENAI]: Type.Optional(AzureOpenAiProvider),
        [CopilotProviderType.AIXBLOCK]: Type.Optional(AIxBlockProvider),
    }),
})

export type CopilotSettings = Static<typeof CopilotSettings>

export const CopilotSettingsWithoutSensitiveData = Type.Object({
    providers: Type.Object({
        [CopilotProviderType.OPENAI]: Type.Optional(Type.Object({})),
        [CopilotProviderType.AZURE_OPENAI]: Type.Optional(Type.Object({})),
        [CopilotProviderType.AIXBLOCK]: Type.Optional(Type.Object({})),
    }),
})
export type CopilotSettingsWithoutSensitiveData = Static<typeof CopilotSettingsWithoutSensitiveData>

export const CopilotConfig = Type.Object({
    ...BaseModelSchema,
    setting: CopilotSettings,
    platformId: Type.String(),
    projectId: Type.String(),
})

export type CopilotConfig = Static<typeof CopilotConfig>

export const CopilotWithoutSensitiveData = Type.Composite([Type.Omit(CopilotConfig, ['setting']),
    Type.Object({
        setting: Type.Object({
        }),
    }),
])
export type CopilotWithoutSensitiveData = Static<typeof CopilotWithoutSensitiveData>
