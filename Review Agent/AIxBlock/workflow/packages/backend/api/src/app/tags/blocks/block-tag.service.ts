import { In } from 'typeorm'
import { apId } from 'workflow-shared'
import { repoFactory } from '../../core/db/repo-factory'
import { tagService } from '../tag-service'
import { BlockTagEntity } from './block-tag.entity'


const repo = repoFactory(BlockTagEntity)

export const blockTagService = {
    async set(platformId: string, blockName: string, tags: string[]): Promise<void> {
        const tagIds = await Promise.all(tags.map(tag => tagService.upsert(platformId, tag).then(tag => tag.id)))
        await repo().delete({ blockName, platformId })
        await repo().upsert(tagIds.map(tagId => ({ id: apId(), tagId, blockName, platformId })), ['tagId', 'blockName'])
    },
    async findByPlatform(platformId: string):  Promise<Record<string, string[]>> {
        const blockTags = await repo().findBy({ platformId })
        const tagIds = Array.from(new Set(blockTags.map(blockTag => blockTag.tagId)))
        const tags = await tagService.findNamesByIds(tagIds)
        return blockTags.reduce((acc, blockTag) => {
            acc[blockTag.blockName] = acc[blockTag.blockName] || []
            acc[blockTag.blockName].push(tags[blockTag.tagId])
            return acc
        }, {} as Record<string, string[]>)
    },
    async findByPlatformAndTags(platformId: string, blockTags: string[]): Promise<string[]> {
        const tagIds = await tagService.convertIdsToNames(platformId, blockTags)
        const blockTagEntities = await repo().findBy({
            platformId,
            tagId: In(tagIds),
        })
        return blockTagEntities.map(blockTag => blockTag.blockName)
    },

}