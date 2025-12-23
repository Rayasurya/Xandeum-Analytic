import dayjs from 'dayjs';
import { FastifyBaseLogger } from 'fastify';
import semVer from 'semver';
import { IsNull } from 'typeorm';
import { BlockMetadataModel, BlockMetadataModelSummary } from 'workflow-blocks-framework';
import {
    AIxBlockError,
    apId,
    assertNotNullOrUndefined,
    BlockType,
    ErrorCode,
    EXACT_VERSION_REGEX,
    isNil,
    ListVersionsResponse,
} from 'workflow-shared';
import { toBlockMetadataModelSummary } from '.';
import { repoFactory } from '../../core/db/repo-factory';
import { blockTagService } from '../../tags/blocks/block-tag.service';
import { BlockMetadataEntity, BlockMetadataSchema } from '../block-metadata-entity';
import { BlockMetadataService } from './block-metadata-service';
import { localBlockCache } from './helper/local-block-cache';
import { blockMetadataServiceHooks } from './hooks';

const repo = repoFactory(BlockMetadataEntity);

export const FastDbBlockMetadataService = (log: FastifyBaseLogger): BlockMetadataService => {
    return {
        async list(params): Promise<BlockMetadataModelSummary[]> {
            const originalBlocks = await findAllBlocksVersionsSortedByNameAscVersionDesc({
                ...params,
                log,
            });
            const uniqueBlocks = new Set<string>(originalBlocks.map((block) => block.name));
            const latestVersionOfEachBlock = Array.from(uniqueBlocks).map((name) => {
                const result = originalBlocks.find((block) => block.name === name);
                const usageCount = originalBlocks
                    .filter((block) => block.name === name)
                    .reduce((acc, block) => {
                        return acc + block.projectUsage;
                    }, 0);
                assertNotNullOrUndefined(result, 'block_metadata_not_found');
                return {
                    ...result,
                    projectUsage: usageCount,
                };
            });
            const blocksWithTags = await enrichTags(params.platformId, latestVersionOfEachBlock, params.includeTags);
            const filteredBlocks = await blockMetadataServiceHooks.get().filterBlocks({
                ...params,
                blocks: blocksWithTags,
                suggestionType: params.suggestionType,
            });
            return toBlockMetadataModelSummary(filteredBlocks, blocksWithTags, params.suggestionType);
        },
        async get({ projectId, platformId, version, name }): Promise<BlockMetadataModel | undefined> {
            const versionToSearch = findNextExcludedVersion(version);
            const originalBlocks = await findAllBlocksVersionsSortedByNameAscVersionDesc({
                projectId,
                platformId,
                release: undefined,
                log,
                getAllBlocks: false,
            });
            const block = originalBlocks.find((block) => {
                const strictlyLessThan =
                    isNil(versionToSearch) ||
                    (semVer.compare(block.version, versionToSearch.nextExcludedVersion) < 0 &&
                        semVer.compare(block.version, versionToSearch.baseVersion) >= 0);
                return block.name === name && strictlyLessThan;
            });
            return block;
        },
        async getOrThrow({ projectId, version, name, platformId }): Promise<BlockMetadataModel> {
            const block = await this.get({ projectId, version, name, platformId });
            if (isNil(block)) {
                throw new AIxBlockError({
                    code: ErrorCode.ENTITY_NOT_FOUND,
                    params: {
                        message: `block_metadata_not_found projectId=${projectId}`,
                    },
                });
            }
            return block;
        },
        async getVersions({ name, projectId, release, platformId }): Promise<ListVersionsResponse> {
            const blocks = await findAllBlocksVersionsSortedByNameAscVersionDesc({
                projectId,
                platformId,
                release,
                log,
                getAllBlocks: false,
            });
            return blocks
                .filter((p) => p.name === name)
                .reverse()
                .reduce((record, blockMetadata) => {
                    record[blockMetadata.version] = {};
                    return record;
                }, {} as ListVersionsResponse);
        },
        async updateUsage({ id, usage }): Promise<void> {
            const existingMetadata = await repo().findOneByOrFail({
                id,
            });
            await repo().update(id, {
                projectUsage: usage,
                updated: existingMetadata.updated,
                created: existingMetadata.created,
            });
        },
        async getExactBlockVersion({ name, version, projectId, platformId }): Promise<string> {
            const isExactVersion = EXACT_VERSION_REGEX.test(version);

            if (isExactVersion) {
                return version;
            }

            const blockMetadata = await this.getOrThrow({
                projectId,
                name,
                version,
                platformId,
            });

            return blockMetadata.version;
        },
        async create({ blockMetadata, projectId, platformId, packageType, blockType, archiveId }): Promise<BlockMetadataSchema> {
            const existingMetadata = await repo().findOneBy({
                name: blockMetadata.name,
                version: blockMetadata.version,
                projectId: projectId ?? IsNull(),
                platformId: platformId ?? IsNull(),
            });
            if (!isNil(existingMetadata)) {
                throw new AIxBlockError({
                    code: ErrorCode.VALIDATION,
                    params: {
                        message: `block_metadata_already_exists name=${blockMetadata.name} version=${blockMetadata.version} projectId=${projectId}`,
                    },
                });
            }
            const createdDate = await findOldestCreateDate({
                name: blockMetadata.name,
                projectId,
                platformId,
            });
            return repo().save({
                id: apId(),
                projectId,
                packageType,
                blockType,
                archiveId,
                platformId,
                created: createdDate,
                ...blockMetadata,
            });
        },
    };
};

const findOldestCreateDate = async ({
    name,
    projectId,
    platformId,
}: {
    name: string;
    projectId: string | undefined;
    platformId: string | undefined;
}): Promise<string> => {
    const block = await repo().findOne({
        where: {
            name,
            projectId: projectId ?? IsNull(),
            platformId: platformId ?? IsNull(),
        },
        order: {
            created: 'ASC',
        },
    });
    return block?.created ?? dayjs().toISOString();
};

const enrichTags = async (
    platformId: string | undefined,
    blocks: BlockMetadataSchema[],
    includeTags: boolean | undefined
): Promise<BlockMetadataSchema[]> => {
    if (!includeTags || isNil(platformId)) {
        return blocks;
    }
    const tags = await blockTagService.findByPlatform(platformId);
    return blocks.map((block) => {
        return {
            ...block,
            tags: tags[block.name] ?? [],
        };
    });
};

const findNextExcludedVersion = (version: string | undefined): { baseVersion: string; nextExcludedVersion: string } | undefined => {
    if (version?.startsWith('^')) {
        const baseVersion = version.substring(1);
        return {
            baseVersion,
            nextExcludedVersion: increaseMajorVersion(baseVersion),
        };
    }
    if (version?.startsWith('~')) {
        const baseVersion = version.substring(1);
        return {
            baseVersion,
            nextExcludedVersion: increaseMinorVersion(baseVersion),
        };
    }
    if (isNil(version)) {
        return undefined;
    }
    return {
        baseVersion: version,
        nextExcludedVersion: increasePatchVersion(version),
    };
};

const increasePatchVersion = (version: string): string => {
    const incrementedVersion = semVer.inc(version, 'patch');
    if (isNil(incrementedVersion)) {
        throw new Error(`Failed to increase patch version ${version}`);
    }
    return incrementedVersion;
};

const increaseMinorVersion = (version: string): string => {
    const incrementedVersion = semVer.inc(version, 'minor');
    if (isNil(incrementedVersion)) {
        throw new Error(`Failed to increase minor version ${version}`);
    }
    return incrementedVersion;
};

const increaseMajorVersion = (version: string): string => {
    const incrementedVersion = semVer.inc(version, 'major');
    if (isNil(incrementedVersion)) {
        throw new Error(`Failed to increase major version ${version}`);
    }
    return incrementedVersion;
};

async function findAllBlocksVersionsSortedByNameAscVersionDesc({
    projectId,
    platformId,
    release,
    getAllBlocks,
    log,
}: {
    projectId?: string;
    platformId?: string;
    release: string | undefined;
    getAllBlocks?: boolean;
    log: FastifyBaseLogger;
}): Promise<BlockMetadataSchema[]> {
    const block = (await localBlockCache(log).getSortedByNameAscThenVersionDesc())
        .filter((block) => {
            return isOfficialBlock(block) || isProjectBlock(projectId, block) || isPlatformBlock(platformId, block) || getAllBlocks;
        })
        .filter((block) => isSupportedRelease(release, block));
    return block;
}

function isSupportedRelease(release: string | undefined, block: BlockMetadataSchema): boolean {
    if (isNil(release)) {
        return true;
    }
    if (!isNil(block.maximumSupportedRelease) && semVer.compare(release, block.maximumSupportedRelease) == 1) {
        return false;
    }
    if (!isNil(block.minimumSupportedRelease) && semVer.compare(release, block.minimumSupportedRelease) == -1) {
        return false;
    }
    return true;
}

function isOfficialBlock(block: BlockMetadataSchema): boolean {
    return block.blockType === BlockType.OFFICIAL && isNil(block.projectId) && isNil(block.platformId);
}

function isProjectBlock(projectId: string | undefined, block: BlockMetadataSchema): boolean {
    if (isNil(projectId)) {
        return false;
    }
    return block.projectId === projectId && block.blockType === BlockType.CUSTOM;
}

function isPlatformBlock(platformId: string | undefined, block: BlockMetadataSchema): boolean {
    if (isNil(platformId)) {
        return false;
    }
    return block.platformId === platformId && isNil(block.projectId) && block.blockType === BlockType.CUSTOM;
}
