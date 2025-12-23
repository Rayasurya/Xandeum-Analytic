import { EntityManager } from 'typeorm'
import { BlockMetadata, BlockMetadataModel, BlockMetadataModelSummary } from 'workflow-blocks-framework'
import {
    ApEdition,
    BlockCategory,
    BlockOrderBy,
    BlockSortBy,
    BlockType,
    ListVersionsResponse,
    PackageType,
    PlatformId,
    ProjectId,
    SuggestionType,
} from 'workflow-shared'

type ListParams = {
    release: string
    projectId?: string
    platformId?: string
    includeHidden: boolean
    edition: ApEdition
    categories?: BlockCategory[]
    includeTags?: boolean
    getAllBlocks?: boolean
    tags?: string[]
    sortBy?: BlockSortBy
    orderBy?: BlockOrderBy
    searchQuery?: string
    suggestionType?: SuggestionType
}

type GetOrThrowParams = {
    name: string
    version: string | undefined
    entityManager?: EntityManager
    projectId: string | undefined
    platformId: string | undefined
}

type ListVersionsParams = {
    name: string
    projectId: string | undefined
    release: string | undefined
    edition: ApEdition
    platformId: string | undefined
}

type CreateParams = {
    blockMetadata: BlockMetadata
    platformId?: string
    projectId?: string
    packageType: PackageType
    blockType: BlockType
    archiveId?: string
}

type UpdateUsage = {
    id: string
    usage: number
}

type GetExactBlockVersionParams = {
    name: string
    version: string
    projectId: ProjectId
    platformId: PlatformId
}

export type BlockMetadataService = {
    list(params: ListParams): Promise<BlockMetadataModelSummary[]>
    get(params: GetOrThrowParams): Promise<BlockMetadataModel | undefined>
    getOrThrow(params: GetOrThrowParams): Promise<BlockMetadataModel>
    getVersions(params: ListVersionsParams): Promise<ListVersionsResponse>
    create(params: CreateParams): Promise<BlockMetadataModel>
    updateUsage(params: UpdateUsage): Promise<void>
    getExactBlockVersion(params: GetExactBlockVersionParams): Promise<string>
}
