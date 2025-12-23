import {
    FastifyPluginAsyncTypebox,
    Type,
} from '@fastify/type-provider-typebox'
import dayjs from 'dayjs'
import { StatusCodes } from 'http-status-codes'
import {
    ApId,
    assertEqual,
    EndpointScope,
    PlatformWithoutSensitiveData,
    PrincipalType,
    SERVICE_KEY_SECURITY_OPENAPI,
    UpdatePlatformRequestBody,
} from 'workflow-shared'
import { copilotService } from '../copilot/copilot.service'
import { platformMustBeOwnedByCurrentUser } from '../ee/authentication/ee-authorization'
import { smtpEmailSender } from '../ee/helper/email/email-sender/smtp-email-sender'
import { platformService } from './platform.service'

export const platformController: FastifyPluginAsyncTypebox = async (app) => {
    app.post('/:id', UpdatePlatformRequest, async (req, res) => {
        await platformMustBeOwnedByCurrentUser.call(app, req, res)

        const { smtp } = req.body
        if (smtp) {
            await smtpEmailSender(req.log).validateOrThrow(smtp)
        }

        const platform = await platformService.update({
            id: req.params.id,
            ...req.body,
        })

        return platform
    })

    app.get('/:id', GetPlatformRequest, async (req) => {
        assertEqual(
            req.principal.platform.id,
            req.params.id,
            'userPlatformId',
            'paramId',
        )
        const platform = await platformService.getOneOrThrow(req.params.id)
        const copilot = await copilotService(req.log).getOrThrow({
            platformId: req.principal.platform.id,
            projectId: req.principal.projectId
        }).catch(() => null)
       
        const platformWithoutSensitiveData = platform as PlatformWithoutSensitiveData
        platformWithoutSensitiveData.hasLicenseKey = true
        platformWithoutSensitiveData.licenseExpiresAt = dayjs().add(60, 'day').utc().toDate().toISOString();
        platformWithoutSensitiveData.isCopilotEnabled = copilot !== null
        return platformWithoutSensitiveData
    })
}

const UpdatePlatformRequest = {
    schema: {
        body: UpdatePlatformRequestBody,
        params: Type.Object({
            id: ApId,
        }),
        response: {
            [StatusCodes.OK]: PlatformWithoutSensitiveData,
        },
    },
}

const GetPlatformRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
        scope: EndpointScope.PLATFORM,
    },
    schema: {
        tags: ['platforms'],
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        description: 'Get a platform by id',
        params: Type.Object({
            id: ApId,
        }),
        response: {
            [StatusCodes.OK]: PlatformWithoutSensitiveData,
        },
    },
}
