import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { marketplaceController } from './marketplace.controller'

export const marketplaceModule: FastifyPluginAsyncTypebox = async (fastify) => {
    await fastify.register(marketplaceController, { prefix: '/v1/marketplace' })
}
