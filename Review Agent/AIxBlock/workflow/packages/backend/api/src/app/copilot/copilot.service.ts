import { FastifyBaseLogger } from 'fastify';
import { removeTrailingSlash } from 'packages/backend/worker/src/lib/api/server-api.service';
import { workerMachine } from 'packages/backend/worker/src/lib/utils/machine';
import { installModel } from 'workflow-blocks-common';
import {
    AIxBlockError,
    apId,
    ApId,
    AskCopilotRequest,
    AskCopilotResponse,
    CopilotConfig,
    CopilotProviderType,
    CopilotSettings,
    ErrorCode,
    isNil,
    PlatformId,
    PrincipalType,
} from 'workflow-shared';
import { accessTokenManager } from '../authentication/lib/access-token-manager';
import { userIdentityRepository } from '../authentication/user-identity/user-identity-service';
import { repoFactory } from '../core/db/repo-factory';
import { encryptUtils } from '../helper/encryption';
import { userService } from '../user/user-service';
import { CopilotEntity } from './copilot-entity';
import { codeGeneratorTool } from './tools/code/code-generate';

const repo = repoFactory(CopilotEntity);

export const copilotService = (log: FastifyBaseLogger) => ({
    async ask(projectId: string, platformId: string, request: AskCopilotRequest): Promise<AskCopilotResponse | null> {
        return codeGeneratorTool(log).generateCode(projectId, platformId, request);
    },
    async getOrThrow(params: GetParams): Promise<CopilotConfig> {
        const copilot = await repo().findOneBy({
            platformId: params.platformId,
            projectId: params.projectId,
        });
        if (isNil(copilot)) {
            throw new AIxBlockError({
                code: ErrorCode.NOT_FOUND,
                params: {
                    message: `copilot of platformId: ${params.platformId}, projectId: ${params.projectId} not found`,
                },
            });
        }
        const decryptedConfig = encryptUtils.decryptObject<CopilotConfig['setting']>(copilot.setting);
        return { ...copilot, setting: decryptedConfig };
    },
    async upsert(
        platformId: string,
        projectId: string,
        userId: string,
        copilotParams: Omit<CopilotConfig, 'id' | 'created' | 'updated' | 'platformId' | 'projectId'>
    ) {
        const settings = copilotParams.setting;

        if (settings?.providers?.[CopilotProviderType.AIXBLOCK]?.apiKey) {
            this.installCopilotAixBlockModel(settings, userId, projectId, platformId);
        }

        const encryptedConfig = encryptUtils.encryptObject(settings);
        await repo().upsert(
            {
                id: apId(),
                platformId,
                setting: encryptedConfig,
                projectId: projectId,
            },
            ['platformId', 'projectId']
        );
        const copilot = await repo().findOneByOrFail({ platformId, projectId });
        return { ...copilot, setting: {} };
    },
    async delete(platformId: string, projectId: string) {
        await repo().delete({ platformId, projectId });
    },
    async installCopilotAixBlockModel(copilotSettings: CopilotSettings, userId: string, projectId: string, platformId: string) {
        const providers = copilotSettings.providers;
        if (isNil(providers[CopilotProviderType.AIXBLOCK])) return;

        const user = await userService.getOneOrFail({ id: userId });
        const identity = await userIdentityRepository().findOneByOrFail({ id: user.identityId });
        const provider = providers[CopilotProviderType.AIXBLOCK];

        const token = await accessTokenManager.generateToken({
            id: userId,
            type: PrincipalType.ENGINE,
            projectId: projectId,
            platform: {
                id: platformId,
            },
            tokenVersion: identity.tokenVersion,
        });

        const serverUrl = removeTrailingSlash(workerMachine.getInternalApiUrl());
        try {
            await installModel(provider.baseUrl, provider.apiKey, provider.model, serverUrl + '/', token, platformId);
        } catch (error) {
            console.error('Failed to install model, removing old key: ', error);
            await this.delete(platformId, projectId);
        }
    },
});

type GetParams = {
    platformId: PlatformId;
    projectId: ApId;
};
