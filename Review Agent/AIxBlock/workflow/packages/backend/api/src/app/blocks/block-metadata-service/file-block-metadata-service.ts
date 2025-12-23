import { AppSystemProp, fileBlocksUtils } from 'workflow-server-shared';

import { FastifyBaseLogger } from 'fastify';
import { nanoid } from 'nanoid';
import { BlockMetadata, BlockMetadataModel, BlockMetadataModelSummary } from 'workflow-blocks-framework';
import { AIxBlockError, BlockType, ErrorCode, EXACT_VERSION_REGEX, isNil, ListVersionsResponse, PackageType, ProjectId } from 'workflow-shared';
import { toBlockMetadataModelSummary } from '.';
import { system } from '../../helper/system/system';
import { BlockMetadataSchema } from '../block-metadata-entity';
import { BlockMetadataService } from './block-metadata-service';
import { FastDbBlockMetadataService } from './db-block-metadata-service';
import { blockMetadataServiceHooks } from './hooks';

const loadBlocksMetadata = async (): Promise<BlockMetadata[]> => {
    const packages = system.getOrThrow(AppSystemProp.DEV_BLOCKS)?.split(',');
    const blocks = await fileBlocksUtils(packages, system.globalLogger()).findAllBlocks();
    return blocks.sort((a, b) => a.displayName.toUpperCase().localeCompare(b.displayName.toUpperCase()));
};
export const FileBlockMetadataService = (_log: FastifyBaseLogger): BlockMetadataService => {
    return {
        async list(params): Promise<BlockMetadataModelSummary[]> {
            const { projectId } = params;
            const originalBlocksMetadata: BlockMetadataSchema[] = (await loadBlocksMetadata()).map((p) => {
                return {
                    id: nanoid(),
                    ...p,
                    projectUsage: 0,
                    blockType: BlockType.OFFICIAL,
                    packageType: PackageType.REGISTRY,
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                };
            });

            const blocks = await blockMetadataServiceHooks.get().filterBlocks({
                ...params,
                blocks: originalBlocksMetadata,
                suggestionType: params.suggestionType,
            });
            const filteredBlocks = blocks.map((p) =>
                toBlockMetadataModel({
                    blockMetadata: p,
                    projectId,
                })
            );

            const dbBlocks = await FastDbBlockMetadataService(_log).list(params);
            const localBlocks = toBlockMetadataModelSummary(filteredBlocks, originalBlocksMetadata, params.suggestionType);

            const map = new Map();
            for (const block of dbBlocks) {
                map.set(block.name, block);
            }
            for (const block of localBlocks) {
                map.set(block.name, block);
            }
            return Array.from(map.values());
        },
        async updateUsage() {
            throw new Error('Updating blocks is not supported in development mode');
        },
        async getVersions(params): Promise<ListVersionsResponse> {
            const blocksMetadata = await loadBlocksMetadata();
            const blockMetadata = blocksMetadata.find((p) => p.name === params.name);
            return blockMetadata?.version ? { [blockMetadata.version]: {} } : {};
        },
        async get({ name, projectId, platformId, version }): Promise<BlockMetadataModel | undefined> {
            const blocksMetadata = await loadBlocksMetadata();
            const blockMetadata = blocksMetadata.find((p) => p.name === name);

            if (isNil(blockMetadata)) {
                return await FastDbBlockMetadataService(_log).get({ name, projectId, platformId, version });
            }

            return toBlockMetadataModel({
                blockMetadata,
                projectId,
            });
        },
        async getOrThrow({ name, version, projectId, platformId }): Promise<BlockMetadataModel> {
            const blockMetadata = await this.get({
                name,
                version,
                projectId,
                platformId,
            });

            if (isNil(blockMetadata)) {
                throw new AIxBlockError({
                    code: ErrorCode.BLOCK_NOT_FOUND,
                    params: {
                        blockName: name,
                        pieceVersion: version,
                        message: 'Blocks is not found in file system',
                    },
                });
            }

            return toBlockMetadataModel({
                blockMetadata,
                projectId,
            });
        },
        async create(): Promise<BlockMetadataModel> {
            throw new Error('Creating blocks is not supported in development mode');
        },

        async getExactBlockVersion({ projectId, platformId, name, version }): Promise<string> {
            const isExactVersion = EXACT_VERSION_REGEX.test(version);

            if (isExactVersion) {
                return version;
            }

            const blockMetadata = await this.getOrThrow({
                projectId,
                platformId,
                name,
                version,
            });

            return blockMetadata.version;
        },
    };
};

const toBlockMetadataModel = ({ blockMetadata, projectId }: ToBlockMetadataModelParams): BlockMetadataModel => {
    return {
        name: blockMetadata.name,
        displayName: blockMetadata.displayName,
        description: blockMetadata.description,
        logoUrl: blockMetadata.logoUrl,
        version: blockMetadata.version,
        auth: blockMetadata.auth,
        projectUsage: 0,
        minimumSupportedRelease: blockMetadata.minimumSupportedRelease,
        maximumSupportedRelease: blockMetadata.maximumSupportedRelease,
        actions: blockMetadata.actions,
        authors: blockMetadata.authors,
        categories: blockMetadata.categories,
        triggers: blockMetadata.triggers,
        directoryPath: blockMetadata.directoryPath,
        projectId,
        packageType: PackageType.REGISTRY,
        blockType: BlockType.OFFICIAL,
    };
};

type ToBlockMetadataModelParams = {
    blockMetadata: BlockMetadata;
    projectId?: ProjectId;
};
