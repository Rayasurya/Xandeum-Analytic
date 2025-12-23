import { ActionBase, TriggerBase } from 'workflow-blocks-framework'

import Fuse from 'fuse.js'
import {
    BlockCategory,
    isNil,
    PlatformId,
    SuggestionType,
} from 'workflow-shared'
import { platformService } from '../../../platform/platform.service'
import { BlockMetadataSchema } from '../../block-metadata-entity'

const blockFilterKeys = [
    {
        name: 'displayName',
        weight: 3,
    },
    {
        name: 'description',
        weight: 1,
    },
]

export const filterBlocksBasedUser = async ({
    searchQuery,
    blocks,
    categories,
    suggestionType,
    platformId,
}: {
    categories: BlockCategory[] | undefined
    searchQuery: string | undefined
    blocks: BlockMetadataSchema[]
    suggestionType?: SuggestionType
    platformId?: PlatformId
}): Promise<BlockMetadataSchema[]> => {
    return filterBlocksBasedOnFeatures(
        platformId,
        filterBasedOnCategories({
            categories,
            blocks: filterBasedOnSearchQuery({ searchQuery, blocks, suggestionType }),
        }),
    )
}

export const filterBlocksBasedOnEmbedding = async ({
    platformId,
    blocks,
}: {
    platformId?: string
    blocks: BlockMetadataSchema[]
}): Promise<BlockMetadataSchema[]> => {
    if (isNil(platformId)) {
        return blocks
    }
    const platform = await platformService.getOne(platformId)
    if (isNil(platform)) {
        return blocks
    }
    if (!platform.embeddingEnabled) {
        return blocks
    }

    return blocks
}

async function filterBlocksBasedOnFeatures(
    platformId: PlatformId | undefined,
    blocks: BlockMetadataSchema[],
): Promise<BlockMetadataSchema[]> {
    if (isNil(platformId)) {
        return blocks
    }
    return blocks
}

const filterBasedOnSearchQuery = ({
    searchQuery,
    blocks,
    suggestionType,
}: {
    searchQuery: string | undefined
    blocks: BlockMetadataSchema[]
    suggestionType?: SuggestionType
}): BlockMetadataSchema[] => {
    if (!searchQuery) {
        return blocks
    }
    const putActionsAndTriggersInAnArray = blocks.map((block) => {
        const actions = Object.values(block.actions)
        const triggers = Object.values(block.triggers)
        return {
            ...block,
            actions:
        suggestionType === SuggestionType.ACTION ||
        suggestionType === SuggestionType.ACTION_AND_TRIGGER
            ? actions
            : [],
            triggers:
        suggestionType === SuggestionType.TRIGGER ||
        suggestionType === SuggestionType.ACTION_AND_TRIGGER
            ? triggers
            : [],
        }
    })

    const blockWithTriggersAndActionsFilterKeys = [
        ...blockFilterKeys,
        'actions.displayName',
        'actions.description',
        'triggers.displayName',
        'triggers.description',
    ]

    const fuse = new Fuse(putActionsAndTriggersInAnArray, {
        isCaseSensitive: false,
        shouldSort: true,
        keys: blockWithTriggersAndActionsFilterKeys,
        threshold: 0.2,
        distance: 250,
    })

    return fuse.search(searchQuery).map(({ item }) => {
        const suggestedActions = searchForSuggestion(
            item.actions,
            searchQuery,
            item.displayName,
        )
        const suggestedTriggers = searchForSuggestion(
            item.triggers,
            searchQuery,
            item.displayName,
        )

        return {
            ...item,
            actions: suggestedActions,
            triggers: suggestedTriggers,
        }
    })
}

const filterBasedOnCategories = ({
    categories,
    blocks,
}: {
    categories: BlockCategory[] | undefined
    blocks: BlockMetadataSchema[]
}): BlockMetadataSchema[] => {
    if (!categories) {
        return blocks
    }

    return blocks.filter((p) => {
        return categories.some((item) => (p.categories ?? []).includes(item))
    })
}

function searchForSuggestion<T extends ActionBase | TriggerBase>(
    actionsOrTriggers: T[],
    searchQuery: string,
    blockDisplayName: string,
): Record<string, T> {
    const actionsOrTriggerWithBlockDisplayName = actionsOrTriggers.map(
        (actionOrTrigger) => ({
            ...actionOrTrigger,
            blockDisplayName,
        }),
    )

    const nestedFuse = new Fuse(actionsOrTriggerWithBlockDisplayName, {
        isCaseSensitive: false,
        shouldSort: true,
        keys: ['blockDisplayName', 'displayName', 'description'],
        threshold: 0.2,
    })
    const suggestions = nestedFuse.search(searchQuery).map(({ item }) => item)
    return suggestions.reduce<Record<string, T>>(
        (filteredSuggestions, suggestion) => {
            filteredSuggestions[suggestion.name] = {
                ...suggestion,
                blockDisplayName: undefined,
            }
            return filteredSuggestions
        },
        {},
    )
}
