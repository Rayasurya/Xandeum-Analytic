import {
    FastifyPluginAsyncTypebox,
} from '@fastify/type-provider-typebox'
import { EngineHelperPropResult, EngineHelperResponse } from 'server-worker'
import { BlockMetadata, BlockMetadataModel, BlockMetadataModelSummary } from 'workflow-blocks-framework'
import { apVersionUtil, UserInteractionJobType } from 'workflow-server-shared'
import {
    ALL_PRINCIPAL_TYPES,
    ApEdition,
    BlockCategory,
    BlockOptionRequest,
    FileType,
    GetBlockRequestParams,
    GetBlockRequestQuery,
    GetBlockRequestWithScopeParams,
    ListBlocksRequestQuery,
    ListVersionRequestQuery,
    ListVersionsResponse,
    PrincipalType
} from 'workflow-shared'
import { flowService } from '../flows/flow/flow.service'
import { sampleDataService } from '../flows/step-run/sample-data.service'
import { userInteractionWatcher } from '../workers/user-interaction-watcher'
import {
    blockMetadataService,
    getBlockPackageWithoutArchive,
} from './block-metadata-service'
import { blockSyncService } from './block-sync-service'

export const blockModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(baseBlocksController, { prefix: '/v1/blocks' })
}

const baseBlocksController: FastifyPluginAsyncTypebox = async (app) => {

    app.get('/versions', ListVersionsRequest, async (req): Promise<ListVersionsResponse> => {
        return blockMetadataService(req.log).getVersions({
            name: req.query.name,
            projectId: req.principal.type === PrincipalType.UNKNOWN ? undefined : req.principal.projectId,
            release: req.query.release,
            edition: req.query.edition ?? ApEdition.COMMUNITY,
            platformId: req.principal.type === PrincipalType.UNKNOWN ? undefined : req.principal.platform.id,
        })
    })

    app.get(
        '/categories',
        ListCategoriesRequest,
        async (): Promise<BlockCategory[]> => {
            return Object.values(BlockCategory)
        },
    )

    app.get(
        '/',
        ListBlocksRequest,
        async (req): Promise<BlockMetadataModelSummary[]> => {
            const latestRelease = await apVersionUtil.getCurrentRelease()
            const includeTags = req.query.includeTags ?? false
            const release = req.query.release ?? latestRelease
            const edition = req.query.edition ?? ApEdition.COMMUNITY
            const platformId = req.principal.type === PrincipalType.UNKNOWN ? undefined : req.principal.platform.id
            const projectId = req.principal.type === PrincipalType.UNKNOWN ? undefined : req.principal.projectId
            const blockMetadataSummary = await blockMetadataService(req.log).list({
                release,
                includeHidden: req.query.includeHidden ?? false,
                projectId,
                platformId,
                edition,
                includeTags,
                categories: req.query.categories,
                searchQuery: req.query.searchQuery,
                sortBy: req.query.sortBy,
                orderBy: req.query.orderBy,
                suggestionType: req.query.suggestionType,
            })
            return blockMetadataSummary
        },
    )

    app.get(
        '/:scope/:name',
        GetBlockParamsWithScopeRequest,
        async (req): Promise<BlockMetadata> => {
            const { name, scope } = req.params
            const { version } = req.query

            const decodeScope = decodeURIComponent(scope)
            const decodedName = decodeURIComponent(name)
            const projectId = req.principal.type === PrincipalType.UNKNOWN ? undefined : req.principal.projectId
            const platformId = req.principal.type === PrincipalType.UNKNOWN ? undefined : req.principal.platform.id
            return blockMetadataService(req.log).getOrThrow({
                projectId,
                platformId,
                name: `${decodeScope}/${decodedName}`,
                version,
            })
        },
    )

    app.get(
        '/:name',
        GetBlockParamsRequest,
        async (req): Promise<BlockMetadataModel> => {
            const { name } = req.params
            const { version } = req.query

            const decodedName = decodeURIComponent(name)
            const projectId = req.principal.type === PrincipalType.UNKNOWN ? undefined : req.principal.projectId
            const platformId = req.principal.type === PrincipalType.UNKNOWN ? undefined : req.principal.platform.id
            return blockMetadataService(req.log).getOrThrow({
                projectId,
                platformId,
                name: decodedName,
                version,
            })
        },
    )

    app.post('/sync', SyncBlocksRequest, async (req) => blockSyncService(req.log).sync())

    app.post(
        '/options',
        OptionsBlockRequest,
        async (req) => {
            const { projectId, platform } = req.principal
            const flow = await flowService(req.log).getOnePopulatedOrThrow({
                projectId,
                id: req.body.flowId,
                versionId: req.body.flowVersionId,
            })
            const sampleData = await sampleDataService(req.log).getSampleDataForFlow(projectId, flow.version, FileType.SAMPLE_DATA)
            const { result } = await userInteractionWatcher(req.log).submitAndWaitForResponse<EngineHelperResponse<EngineHelperPropResult>>({
                jobType: UserInteractionJobType.EXECUTE_PROPERTY,
                projectId,
                flowVersion: flow.version,
                propertyName: req.body.propertyName,
                actionOrTriggerName: req.body.actionOrTriggerName,
                input: req.body.input,
                sampleData,
                piece: await getBlockPackageWithoutArchive(req.log, projectId, platform.id, req.body),
            })
            return result
        },
    )

}

const ListBlocksRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        querystring: ListBlocksRequestQuery,

    },
}
const GetBlockParamsRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        params: GetBlockRequestParams,
        querystring: GetBlockRequestQuery,
    },
}

const GetBlockParamsWithScopeRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        params: GetBlockRequestWithScopeParams,
        querystring: GetBlockRequestQuery,
    },
}

const ListCategoriesRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        querystring: ListBlocksRequestQuery,
    },
}

const OptionsBlockRequest = {
    schema: {
        body: BlockOptionRequest,
    },
}


const ListVersionsRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        querystring: ListVersionRequestQuery,
    },
}

const SyncBlocksRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
    },
}