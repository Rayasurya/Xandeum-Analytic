import { AI_PROVIDERS } from 'workflow-blocks-common'
import { AiProviderConfig, AiProviderWithoutSensitiveData, AIxBlockError, ApId, apId, ErrorCode, isNil, PlatformId, SeekPage } from 'workflow-shared'
import { repoFactory } from '../core/db/repo-factory'
import { encryptUtils } from '../helper/encryption'
import { AiProviderEntity, AiProviderSchema } from './ai-provider-entity'

const repo = repoFactory(AiProviderEntity)

export const aiProviderService = {
    async getOrThrow(params: GetParams): Promise<AiProviderConfig> {
        const provider = await repo().findOneBy({
            platformId: params.platformId,
            provider: params.provider,
            projectId: params.projectId,
        })
        if (isNil(provider)) {
            throw new AIxBlockError({
                code: ErrorCode.NOT_FOUND,
                params: {
                    message: `provider: ${params.provider}, platformId: ${params.platformId}, projectId: ${params.projectId} not found`,
                },
            });
        }
        const decryptedConfig = encryptUtils.decryptObject<AiProviderConfig['config']>(provider.config)
        return { ...provider, config: decryptedConfig }
    },
    async upsert(platformId: string, projectId: string, aiConfig: Omit<AiProviderConfig, 'id' | 'created' | 'updated' | 'platformId' | 'projectId'>): Promise<AiProviderWithoutSensitiveData> {
        const existingProvider = await this.getOrThrow({ platformId, provider: aiConfig.provider, projectId }).catch(() => null)
        const existingHeaders = existingProvider?.config.defaultHeaders ?? {}
        const nonEmptyHeaders = Object.fromEntries(Object.entries(aiConfig.config.defaultHeaders).filter(([_, v]) => !isNil(v)))
        const newHeaders = { ...existingHeaders, ...nonEmptyHeaders }
        const encryptedConfig = encryptUtils.encryptObject({ ...aiConfig.config, defaultHeaders: newHeaders })
        await repo().upsert({
            id: apId(),
            platformId,
            baseUrl: aiConfig.baseUrl,
            config: encryptedConfig,
            provider: aiConfig.provider,
            projectId: projectId,
        }, ['platformId', 'provider'])
        const provider = await repo().findOneByOrFail({ platformId, provider: aiConfig.provider })
        return removeSensitiveData(provider)
    },
    async delete(params: DeleteParams): Promise<void> {
        await this.getOrThrow(params)
        await repo().delete(params)
    },
    async list(platformId: PlatformId, projectId: ApId): Promise<SeekPage<AiProviderConfig>> {
        const providers = await repo().findBy({ platformId, projectId })
        const data: any = providers.map((p) => {
            const decryptedConfig = encryptUtils.decryptObject<AiProviderConfig['config']>(p.config)
            return { ...p, config: decryptedConfig };
        })
        return {
            data,
            next: null,
            previous: null,
        }
    },
    async autoConnectAIxBlockProvider(params: {
        platformId: string,
        projectId: string,
        token: string,
        url: string,
    }) {
        const provider = await repo().findOneBy({ platformId: params.platformId, projectId: params.projectId, provider: 'aixblock' });
        if (provider?.config?.data) {
            console.log('Ignore update provider')
            return
        }
        const aiProvider = AI_PROVIDERS.find((provider) => provider.value === 'aixblock');
        if (!aiProvider) return;
        const auth = aiProvider.auth;
        await this.upsert(params.platformId, params.projectId, {
            provider: 'aixblock',
            baseUrl: params.url,
            config: {
                defaultHeaders: {
                    [auth.name]: auth.mapper(params.token)
                }
            }
        })
    }
}

function removeSensitiveData(provider: AiProviderSchema | AiProviderConfig): AiProviderWithoutSensitiveData {
    return { ...provider, config: {} }
}

type DeleteParams = {
    platformId: PlatformId
    projectId: ApId
    provider: string
}

type GetParams = {
    platformId: PlatformId
    projectId: ApId
    provider: string
}