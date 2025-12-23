import { BlocksFilterType, FilteredPieceBehavior, isNil } from 'workflow-shared'
import { BlockMetadataSchema } from '../../../blocks/block-metadata-entity'
import {
    BlockMetadataServiceHooks,
    defaultBlockHooks,
} from '../../../blocks/block-metadata-service/hooks'
import { platformService } from '../../../platform/platform.service'
import { projectLimitsService } from '../../project-plan/project-plan.service'

export const enterpriseBlockMetadataServiceHooks: BlockMetadataServiceHooks = {
    async filterBlocks(params) {
        const { platformId, includeHidden, blocks, projectId } = params
        if (isNil(platformId) || includeHidden) {
            return defaultBlockHooks.filterBlocks({ ...params, blocks })
        }
        const resultBlocks = await filterPiecesBasedPlatform(platformId, blocks)
        const blocksAfterDefaultFilter = await defaultBlockHooks.filterBlocks({ ...params, blocks: resultBlocks })

        if (isNil(projectId)) {
            return blocksAfterDefaultFilter
        }
        return filterBasedOnProject(projectId, blocksAfterDefaultFilter)
    },
}

async function filterBasedOnProject(
    projectId: string,
    pieces: BlockMetadataSchema[],
): Promise<BlockMetadataSchema[]> {
    const { pieces: allowedPieces, piecesFilterType } = await projectLimitsService.getPiecesFilter(projectId)

    const filterPredicate: Record<
    BlocksFilterType,
    (p: BlockMetadataSchema) => boolean
    > = {
        [BlocksFilterType.NONE]: () => true,
        [BlocksFilterType.ALLOWED]: (p) =>
            allowedPieces.includes(p.name),
    }

    const predicate = filterPredicate[piecesFilterType]
    return pieces.slice().filter(predicate)
}

/*
    @deprecated This function is deprecated and will be removed in the future. replaced with project filtering
*/
async function filterPiecesBasedPlatform(
    platformId: string,
    pieces: BlockMetadataSchema[],
): Promise<BlockMetadataSchema[]> {
    const platform = await platformService.getOneOrThrow(platformId)

    const filterPredicate: Record<
    FilteredPieceBehavior,
    (p: BlockMetadataSchema) => boolean
    > = {
        [FilteredPieceBehavior.ALLOWED]: (p) =>
            platform.filteredPieceNames.includes(p.name),
        [FilteredPieceBehavior.BLOCKED]: (p) =>
            !platform.filteredPieceNames.includes(p.name),
    }

    const predicate = filterPredicate[platform.filteredPieceBehavior]
    return pieces.slice().filter(predicate)
}
