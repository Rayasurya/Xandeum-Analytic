import { FlowTemplate, TemplateType } from 'workflow-shared';
import { FastifyBaseLogger } from 'fastify';
import { Equal, FindOneOptions, ILike, IsNull, Not } from 'typeorm';
import { flowTemplateService } from '../ee/flow-template/flow-template.service';
import { FlowSchema } from '../flows/flow/flow.entity';
import { flowRepo } from '../flows/flow/flow.repo';
import { flowService } from '../flows/flow/flow.service';
import { listingCategoryRepo } from '../flows/listing/listing-category.repo';
import { repoFactory } from '../core/db/repo-factory';
import { FlowTemplateEntity } from '../ee/flow-template/flow-template.entity';

const templateRepo = repoFactory<FlowTemplate>(FlowTemplateEntity)

export const marketplaceService = (logger: FastifyBaseLogger) => ({
    async list(page?: number, category?: string, name?: string): Promise<{
        count: number,
        list: TMarketplaceTemplate[],
    }> {
        const pageSize = 10
        const pageNum = Math.max((page ?? 1) - 1, 0)

        // Fetch flows
        const flowConditions: FindOneOptions<FlowSchema>["where"] = {
            listingStatus: true,
            listingUserId: Not(IsNull()),
            ...category ? { listingCategoryId: category } : {},
            ...(name && name.trim().length > 0) ? { listingName: ILike(`%${name}%`) } : {},
        }

        const flowsCount = await flowRepo().count({ where: flowConditions })

        // Fetch templates
        const templateWhere: any = {
            type: Equal(TemplateType.PLATFORM),
            ...(name && name.trim().length > 0) ? { name: ILike(`%${name}%`) } : {},
        }

        const templatesCount = await templateRepo().count({ where: templateWhere })
        const totalCount = flowsCount + templatesCount

        // Calculate which items to fetch from flows/templates
        let flowsToSkip = pageNum * pageSize
        let flowsToTake = Math.min(pageSize, Math.max(flowsCount - flowsToSkip, 0))
        let templatesToTake = 0
        let templatesToSkip = 0

        if (flowsToTake < pageSize) {
            templatesToTake = pageSize - flowsToTake
            templatesToSkip = Math.max(0, flowsToSkip - flowsCount)
            flowsToTake = Math.max(0, flowsCount - flowsToSkip)
            flowsToSkip = Math.min(flowsToSkip, flowsCount)
        }

        // Get flows
        const flows = flowsToTake > 0 ? await flowRepo().find({
            where: flowConditions,
            order: { updated: 'DESC' },
            skip: flowsToSkip,
            take: flowsToTake,
        }) : []

        // Get templates
        const templates = templatesToTake > 0 ? await templateRepo().find({
            where: templateWhere,
            order: { created: 'DESC' },
            skip: templatesToSkip,
            take: templatesToTake,
        }) : []

        // Map to TMarketplaceTemplate
        const flowList = flows.map(f => ({
            id: f.id,
            name: f.listingName ?? "No name",
            price: (f.listingPrice ?? 0) / 100,
            description: f.listingDescription ?? "",
            preview: flowService(logger).getPreviewFlowPublicUrl(f),
            userId: f.listingUserId ?? 0,
            categoryId: f.listingCategoryId ?? "",
        }))

        const templateList = templates.map(t => ({
            id: t.id,
            name: t.name ?? "No name",
            price: 0,
            description: t.description ?? "",
            preview: null,
            userId: -1,
            categoryId: "Community",
        }));

        return {
            count: totalCount,
            list: [...flowList, ...templateList],
        };
    },

    async detail(id: string): Promise<TMarketplaceTemplate> {
        try {
            const flow = await flowRepo().findOneOrFail({ where: { id } })

            return {
                id: flow.id,
                name: flow.listingName ?? "No name",
                price: (flow.listingPrice ?? 0) / 100,
                description: flow.listingDescription ?? "",
                preview: flowService(logger).getPreviewFlowPublicUrl(flow),
                userId: flow.listingUserId ?? 0,
                categoryId: flow.listingCategoryId ?? "",
            }
        } catch {
            const template = await templateRepo().findOneBy({ id, type: TemplateType.PLATFORM })

            if (!template) {
                throw new Error(`Marketplace item with id ${id} not found`);
            }

            return {
                id: template.id,
                name: template.name ?? "No name",
                price: 0,
                description: template.description ?? "",
                preview: null,
                userId: -1,
                categoryId: "",
            }
        }
    },

    async createTemplate(flowId: string, projectId: string, platformId: string): Promise<FlowTemplate> {
        try {
            const flow = await flowService(logger).getOnePopulatedOrThrow({
                id: flowId,
                projectId,
            });

            const template = await flowService(logger).getTemplate({
                flowId,
                projectId,
                versionId: flow.version.id,
            });

            return flowTemplateService.upsert(platformId, projectId, {
                type: TemplateType.MARKETPLACE,
                description: flow.listingDescription ?? "",
                template: {
                    ...template.template,
                    displayName: flow.listingName ?? "No name",
                },
                tags: template.tags,
                metadata: template.metadata,
            });
        }  catch {
            // If flow not found, try to find in community templateRepo
            const communityTemplate = await templateRepo().findOneBy({ id: flowId, type: TemplateType.PLATFORM })

            if (!communityTemplate) {
                throw new Error(`Flow or community template with id ${flowId} not found`)
            }

            return flowTemplateService.upsert(platformId, projectId, {
                type: TemplateType.MARKETPLACE,
                description: communityTemplate.description ?? "",
                template: {
                    ...communityTemplate.template,
                    displayName: communityTemplate.name ?? "No name",
                },
                tags: communityTemplate.tags,
                metadata: communityTemplate.metadata,
            })
        }
    },

    async categories() {
        return listingCategoryRepo().find({
            where: {
                enabled: true,
            },
            order: {
                displayName: "ASC",
            }
        })
    },
})

export type TMarketplaceTemplate = {
    id: string,
    name: string,
    price: number,
    description: string,
    preview: string | null,
    userId: number,
    categoryId: string,
}
