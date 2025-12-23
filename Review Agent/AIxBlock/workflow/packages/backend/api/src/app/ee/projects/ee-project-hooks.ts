import { FastifyBaseLogger } from 'fastify'
import { AlertChannel } from 'workflow-axb-shared'
import { userIdentityService } from '../../authentication/user-identity/user-identity-service'
import { platformService } from '../../platform/platform.service'
import { ProjectHooks } from '../../project/project-hooks'
import { userService } from '../../user/user-service'
import { alertsService } from '../alerts/alerts-service'

export const projectEnterpriseHooks = (log: FastifyBaseLogger): ProjectHooks => ({
    async postCreate(project) {
        const owner = await userService.getOneOrFail({
            id: project.ownerId,
        })
        const identity = await userIdentityService(log).getBasicInformation(owner.identityId)
        const platform = await platformService.getOneOrThrow(project.platformId)
        if (!platform.embeddingEnabled) {
            await alertsService(log).add({
                channel: AlertChannel.EMAIL,
                projectId: project.id,
                receiver: identity.email,
            })
        }
    },
})