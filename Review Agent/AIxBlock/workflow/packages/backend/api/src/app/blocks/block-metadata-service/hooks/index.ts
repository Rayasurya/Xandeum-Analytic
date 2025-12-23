import { BlockCategory, BlockOrderBy, BlockSortBy, PlatformId, SuggestionType } from 'workflow-shared'
import { BlockMetadataSchema } from '../../block-metadata-entity'
import { filterBlocksBasedOnEmbedding, filterBlocksBasedUser } from './block-filtering'
import { sortAndOrderBlocks } from './block-sorting'

export const defaultBlockHooks: BlockMetadataServiceHooks = {
    async filterBlocks(params) {
        const sortedBlocks = sortAndOrderBlocks(
            params.sortBy,
            params.orderBy,
            params.blocks,
        )
        
        const userBasedBlocks = await filterBlocksBasedUser({
            categories: params.categories,
            searchQuery: params.searchQuery,
            blocks: sortedBlocks,
            platformId: params.platformId,
            suggestionType: params.suggestionType,
        })

        const platformEmbeddedBasedBlocks = filterBlocksBasedOnEmbedding({
            platformId: params.platformId,
            blocks: userBasedBlocks,
        })

        return platformEmbeddedBasedBlocks
    },
}

let hooks = defaultBlockHooks

export const blockMetadataServiceHooks = {
    set(newHooks: BlockMetadataServiceHooks): void {
        hooks = newHooks
    },

    get(): BlockMetadataServiceHooks {
        return hooks
    },
}

export type BlockMetadataServiceHooks = {
    filterBlocks(p: FilterBlocksParams): Promise<BlockMetadataSchema[]>
}

export type FilterBlocksParams = {
    includeHidden?: boolean
    platformId?: PlatformId
    searchQuery?: string
    categories?: BlockCategory[]
    projectId?: string
    sortBy?: BlockSortBy
    orderBy?: BlockOrderBy
    blocks: BlockMetadataSchema[]
    suggestionType?: SuggestionType
}
