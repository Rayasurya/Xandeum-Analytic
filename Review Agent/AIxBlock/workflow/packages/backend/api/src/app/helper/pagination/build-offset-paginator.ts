import { EntitySchema, ObjectLiteral } from 'typeorm'
import { OffsetPaginator } from './offset-paginator'
import { Order } from '.'

export type OffsetPagingQuery = {
    limit?: number
    page?: number
    order?: Order | 'ASC' | 'DESC'
    orderBy?: string
}

export type OffsetPaginationOptions<Entity> = {
    entity: EntitySchema<Entity>
    alias?: string
    query?: OffsetPagingQuery
}

export function buildOffsetPaginator<Entity extends ObjectLiteral>(
    options: OffsetPaginationOptions<Entity>,
): OffsetPaginator<Entity> {
    const {
        entity,
        query = {},
        alias = entity.options.name.toLowerCase(),
    } = options

    const paginator = new OffsetPaginator<Entity>(entity)

    paginator.setAlias(alias)
    if (query.limit) {
        paginator.setLimit(query.limit)
    }
    if (query.page) {
        paginator.setPage(query.page)
    }

    if (query.order) {
        paginator.setOrder(query.order as Order)
    }

    if (query.orderBy) {
        paginator.setOrderBy(query.orderBy)
    }

    return paginator
}