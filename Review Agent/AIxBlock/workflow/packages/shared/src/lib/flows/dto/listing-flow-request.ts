import { Static, Type } from '@sinclair/typebox'
import { Nullable } from '../../common'

export const ListingFlowRequest = Type.Object({
    listingName: Type.String(),
    listingPrice: Type.Number({ minimum: 0 }),
    listingDescription: Type.String(),
    listingPreview: Nullable(Type.String()),
    listingUserId: Nullable(Type.Number()),
    listingCategoryId: Nullable(Type.String()),
})

export type ListingFlowRequest = Static<typeof ListingFlowRequest>
