import { Static, Type } from '@sinclair/typebox'
import { ApMultipartFile } from '../../common'
import { ApEdition } from '../../flag/flag'
import { BlockCategory, BlockType, PackageType } from '../block'

export const EXACT_VERSION_PATTERN = '^[0-9]+\\.[0-9]+\\.[0-9]+$'
export const EXACT_VERSION_REGEX = new RegExp(EXACT_VERSION_PATTERN)
const VERSION_PATTERN = '^([~^])?[0-9]+\\.[0-9]+\\.[0-9]+$'

export const ExactVersionType = Type.String({
    pattern: EXACT_VERSION_PATTERN,
})
export const VersionType = Type.String({
    pattern: VERSION_PATTERN,
})
export enum SuggestionType {
    ACTION = 'ACTION',
    TRIGGER = 'TRIGGER',
    ACTION_AND_TRIGGER = 'ACTION_AND_TRIGGER',
}
export enum BlockSortBy {
    NAME = 'NAME',
    UPDATED = 'UPDATED',
    CREATED = 'CREATED',
    POPULARITY = 'POPULARITY',
}

export enum BlockOrderBy {
    ASC = 'ASC',
    DESC = 'DESC',
}

export const GetBlockRequestWithScopeParams = Type.Object({
    name: Type.String(),
    scope: Type.String(),
})

export type GetBlockRequestWithScopeParams = Static<typeof GetBlockRequestWithScopeParams>


export const GetBlockRequestParams = Type.Object({
    name: Type.String(),
})

export type GetBlockRequestParams = Static<typeof GetBlockRequestParams>

export const ListBlocksRequestQuery = Type.Object({
    release: Type.Optional(ExactVersionType),
    includeTags: Type.Optional(Type.Boolean()),
    includeHidden: Type.Optional(Type.Boolean()),
    edition: Type.Optional(Type.Enum(ApEdition)),
    searchQuery: Type.Optional(Type.String()),
    sortBy: Type.Optional(Type.Enum(BlockSortBy)),
    orderBy: Type.Optional(Type.Enum(BlockOrderBy)),
    categories: Type.Optional(Type.Array(Type.Enum(BlockCategory))),
    suggestionType: Type.Optional(Type.Enum(SuggestionType)),
})

export type ListBlocksRequestQuery = Static<typeof ListBlocksRequestQuery>

export const ListVersionRequestQuery = Type.Object({
    release: ExactVersionType,
    name: Type.String(),
    edition: Type.Optional(Type.Enum(ApEdition)),
})

export type ListVersionRequestQuery = Static<typeof ListVersionRequestQuery>

export const GetBlockRequestQuery = Type.Object({
    version: Type.Optional(VersionType),
    projectId: Type.Optional(Type.String()),
})

export const ListVersionsResponse = Type.Record(ExactVersionType, Type.Object({}))
export type ListVersionsResponse = Static<typeof ListVersionsResponse>

export type GetBlockRequestQuery = Static<typeof GetBlockRequestQuery>

export const BlockOptionRequest = Type.Object({
    packageType: Type.Enum(PackageType),
    blockType: Type.Enum(BlockType),
    blockName: Type.String({}),
    pieceVersion: VersionType,
    actionOrTriggerName: Type.String({}),
    propertyName: Type.String({}),
    flowId: Type.String(),
    flowVersionId: Type.String(),
    input: Type.Any({}),
    searchValue: Type.Optional(Type.String()),
})

export type BlockOptionRequest = Static<typeof BlockOptionRequest>

export enum BlockScope {
    PLATFORM = 'PLATFORM',
    // TODO: all users have their own platform, so we can remove this
    // @deprecated
    PROJECT = 'PROJECT',

}

export const AddBlockRequestBody = Type.Union([
    Type.Object({
        packageType: Type.Literal(PackageType.ARCHIVE),
        scope: Type.Literal(BlockScope.PLATFORM),
        blockName: Type.String({
            minLength: 1,
        }),
        pieceVersion: ExactVersionType,
        pieceArchive: ApMultipartFile,
    }, {
        title: 'Private Piece',
    }),
    Type.Object({
        packageType: Type.Literal(PackageType.REGISTRY),
        scope: Type.Literal(BlockScope.PLATFORM),
        blockName: Type.String({
            minLength: 1,
        }),
        pieceVersion: ExactVersionType,
    }, {
        title: 'NPM Piece',
    }),
])

export type AddBlockRequestBody = Static<typeof AddBlockRequestBody>
