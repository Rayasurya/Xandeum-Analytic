import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { PrincipalType, VerifyLicenseKeyRequestBody } from 'workflow-shared'
import { licenseKeysService } from './license-keys-service'



export const licenseKeysController: FastifyPluginAsyncTypebox = async (app) => {
    app.post('/verify', VerifyLicenseKeyRequest, async (req) => {
        const { platformId, licenseKey } = req.body
        const key = await licenseKeysService(app.log).verify(platformId, licenseKey)
        return key
    })

}

const VerifyLicenseKeyRequest = {
    config: {
        allowedPrincipals: [
            PrincipalType.UNKNOWN,
            PrincipalType.USER,
        ],
    },
    schema: {
        body: VerifyLicenseKeyRequestBody,
    },
}
