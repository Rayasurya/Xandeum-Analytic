import { ArrayContains, ArrayOverlap, Brackets, Equal, ILike } from 'typeorm';
import { CreateFlowTemplateRequest } from 'workflow-axb-shared';
import {
    AIxBlockError,
    apId,
    ErrorCode,
    flowPieceUtil,
    FlowTemplate,
    FlowVersionTemplate,
    isNil,
    ListFlowTemplatesRequest,
    sanitizeObjectForPostgresql,
    SeekPage,
    TemplateType,
} from 'workflow-shared';
import { repoFactory } from '../../core/db/repo-factory';
import { paginationHelper } from '../../helper/pagination/pagination-utils';
import { FlowTemplateEntity } from './flow-template.entity';

const templateRepo = repoFactory<FlowTemplate>(FlowTemplateEntity)

export const flowTemplateService = {
    upsert: async (
        platformId: string | undefined,
        projectId: string | undefined,
        {
            description,
            type,
            template,
            blogUrl,
            tags,
            id,
            metadata,
        }: CreateFlowTemplateRequest,
    ): Promise<FlowTemplate> => {
        const flowTemplate: FlowVersionTemplate = sanitizeObjectForPostgresql(template)
        const newTags = tags ?? []
        const newId = id ?? apId()

        await templateRepo().upsert(
            {
                id: newId,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                template: flowTemplate as any,
                name: flowTemplate.displayName,
                description: description ?? '',
                blocks: flowPieceUtil.getUsedBlocks(flowTemplate.trigger),
                blogUrl,
                type,
                tags: newTags,
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                platformId,
                projectId: type === TemplateType.PLATFORM ? undefined : projectId,
                metadata: (metadata as unknown) ?? null,
            },
            ['id'],
        )
        return templateRepo().findOneByOrFail({
            id: newId,
        })
    },
    list: async (
        platformId: string,
        { blocks: pieces, tags, search }: ListFlowTemplatesRequest,
        projectId: string,
    ): Promise<SeekPage<FlowTemplate>> => {
        const commonFilters: Record<string, unknown> = {}
        if (pieces) {
            commonFilters.pieces = ArrayOverlap(pieces)
        }
        if (tags) {
            commonFilters.tags = ArrayContains(tags)
        }
        if (search) {
            commonFilters.name = ILike(`%${search}%`)
            commonFilters.description = ILike(`%${search}%`)
        }
        commonFilters.platformId = Equal(platformId)
        const templates = await templateRepo()
            .createQueryBuilder('flow_template')
            .where(commonFilters)
            .andWhere(qb => {
                qb.where({ type: Equal(TemplateType.PLATFORM) })
                    .orWhere(new Brackets(qb2 => {
                        qb2.where(new Brackets(qb3 => {
                            qb3.where({ type: Equal(TemplateType.PROJECT) })
                                .orWhere({ type: Equal(TemplateType.MARKETPLACE) })
                        }))
                            .andWhere({ projectId: Equal(projectId) })
                    }));
            })
            .addOrderBy('created', 'DESC')
            .getMany()
        return paginationHelper.createPage(templates, null)
    },
    getOrThrow: async (id: string): Promise<FlowTemplate> => {
        const template = await templateRepo().findOneBy({
            id,
        })
        if (isNil(template)) {
            throw new AIxBlockError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    message: `Flow template ${id} is not found`,
                },
            })
        }
        return template
    },
    async delete({ id }: { id: string }): Promise<void> {
        await templateRepo().delete({
            id,
        })
    },
}
