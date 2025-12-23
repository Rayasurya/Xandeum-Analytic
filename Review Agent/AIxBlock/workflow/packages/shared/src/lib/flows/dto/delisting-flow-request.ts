import { Static, Type } from '@sinclair/typebox'
import { Nullable } from '../../common'

export const DelistingFlowRequest = Type.Object({
    listingName: Nullable(Type.String()),
    listingPrice: Nullable(Type.Number({ minimum: 0 })),
    listingDescription: Nullable(Type.String()),
    listingPreview: Nullable(Type.String()),
    listingUserId: Nullable(Type.Number()),
    listingCategoryId: Nullable(Type.String()),
})

export type DelistingFlowRequest = Static<typeof DelistingFlowRequest>
