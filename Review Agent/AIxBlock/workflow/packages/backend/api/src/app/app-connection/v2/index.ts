import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { appConnectionController } from './controller'

export const plugin: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(appConnectionController)
}

export default plugin