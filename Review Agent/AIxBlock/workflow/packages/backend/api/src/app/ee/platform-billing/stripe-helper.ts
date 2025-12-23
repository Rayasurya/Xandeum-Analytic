import { FastifyBaseLogger } from 'fastify'
import Stripe from 'stripe'
import { getTasksPriceId } from 'workflow-axb-shared'
import { AppSystemProp } from 'workflow-server-shared'
import { ApEdition, UserWithMetaInformation } from 'workflow-shared'
import { system } from '../../helper/system/system'

export const stripeWebhookSecret = system.get(
    AppSystemProp.STRIPE_WEBHOOK_SECRET,
)!

export const TASKS_PAYG_PRICE_ID = getTasksPriceId(system.get(AppSystemProp.STRIPE_SECRET_KEY) ?? '')

export const stripeHelper = (log: FastifyBaseLogger) => ({
    getStripe: (): Stripe | undefined => {
        const edition = system.getEdition()
        if (edition !== ApEdition.CLOUD) {
            return undefined
        }
        const stripeSecret = system.getOrThrow(AppSystemProp.STRIPE_SECRET_KEY)
        return new Stripe(stripeSecret, {
            apiVersion: '2023-10-16',
        })
    },
    async createCustomer(user: UserWithMetaInformation, platformId: string) {
        const stripe = this.getStripe()
        if (!stripe) {
            throw new Error('Stripe is not enabled')
        }
        const customer = await stripe.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            description: `Platform ID: ${platformId}, user ${user.id}`,
            metadata: {
                platformId,
            },
        })

        return customer.id
    },
    isPriceForTasks: (subscription: Stripe.Subscription): boolean => {
        return subscription.items.data.some((item) => item.price.id === TASKS_PAYG_PRICE_ID)
    },
})
