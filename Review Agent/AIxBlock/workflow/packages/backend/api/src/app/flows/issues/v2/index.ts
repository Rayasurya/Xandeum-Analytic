import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import Controller from './controller'

export const plugin: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(Controller)
}

export default plugin