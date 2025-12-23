import { ApId, EndpointScope, PrincipalType } from 'workflow-shared';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { marketplaceService } from './marketplace.service'
import { Type } from '@sinclair/typebox';
import { projectRepo } from '../project/project-service';

export const marketplaceController: FastifyPluginAsyncTypebox = async (app) => {
    app.get('/', ListMarketplaceRequest, async (request) => {
        const page = request.query.page ?? 1
        const category = request.query.category
        const name = request.query.name
        return marketplaceService(request.log).list(page, category, name)
    })

    app.get('/:id', DetailMarketplaceRequest, async (request) => {
        const id = request.params.id
        return marketplaceService(request.log).detail(id)
    })

    app.post('/:id/create-template', CreateTemplateMarketplaceRequest, async (request) => {
        const id = request.params.id

        const project = await projectRepo().findOneOrFail({
            where: {
                externalId: request.body.externalProjectId,
            },
        })

        return marketplaceService(request.log).createTemplate(id, project.id, request.principal.platform.id);
    })

    app.get('/categories', CategoriesMarketplaceRequest, async (request) => {
        return marketplaceService(request.log).categories()
    })
}

const ListMarketplaceRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
        scope: EndpointScope.PLATFORM,
    },
    schema: {
        querystring: Type.Object({
            page: Type.Optional(Type.Number({ minimum: 1 })),
            category: Type.Optional(Type.String()),
            name: Type.Optional(Type.String()),
        }),
    },
}

const DetailMarketplaceRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
        scope: EndpointScope.PLATFORM,
    },
    schema: {
        params: Type.Object({
            id: ApId,
        }),
    },
}

const CreateTemplateMarketplaceRequest = {
    config: {
        allowedPrincipals: [PrincipalType.SERVICE],
        scope: EndpointScope.PLATFORM,
    },
    schema: {
        body : Type.Object({
            externalProjectId: Type.String(),
        }),
        params: Type.Object({
            id: ApId,
        }),
    },
}

const CategoriesMarketplaceRequest = {
    config: {
        allowedPrincipals: [PrincipalType.SERVICE],
        scope: EndpointScope.PLATFORM,
    },
}
