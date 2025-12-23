import { Static, Type } from '@sinclair/typebox'
import { BaseModelSchema } from '../common/base-model'

export const Tag = Type.Object({
    ...BaseModelSchema,
    platformId: Type.String(),
    name: Type.String(),
})

export type Tag = Static<typeof Tag>

export const BlockTag = Type.Object({
    ...BaseModelSchema,
    blockName: Type.String(),
    tagId: Type.String(),
    platformId: Type.String(),
})

export type BlockTag = Static<typeof BlockTag>

export const ListTagsRequest = Type.Object({
    limit: Type.Optional(Type.Number()),
    cursor: Type.Optional(Type.String()),
})

export type ListTagsRequest = Static<typeof ListTagsRequest>

export const SetBlockTagsRequest = Type.Object({
    blocksName: Type.Array(Type.String()),
    tags: Type.Array(Type.String()),
})

export type SetBlockTagsRequest = Static<typeof SetBlockTagsRequest>

export const UpsertTagRequest = Type.Object({
    name: Type.String(),
})

export type UpsertTagRequest = Static<typeof UpsertTagRequest>
