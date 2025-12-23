import { Type } from '@sinclair/typebox'

export type OffsetPaginationParams = {
    page?: number
    limit?: number
}

export const OffsetPaginationQuery = Type.Object({
    page: Type.Optional(Type.Number({ minimum: 0 })),
    limit: Type.Optional(Type.Number({ minimum: 10 })),
})