import { EntitySchema, ObjectLiteral, SelectQueryBuilder } from 'typeorm'
import { Order } from '.'

const PAGINATION_KEY = 'created'

export type PagingOffsetResult<Entity> = {
    data: Entity[]
    pageCount: number
}

export class OffsetPaginator<Entity extends ObjectLiteral> {
    public constructor(private readonly entity: EntitySchema) { }

    private alias: string = this.entity.options.name

    private limit = 10
    private page = 1

    private order: Order = Order.DESC

    private orderBy: string = PAGINATION_KEY

    async paginate(builder: SelectQueryBuilder<Entity>): Promise<PagingOffsetResult<Entity>> {
        const orderedBuilder = builder.orderBy(this.buildOrder())
        const [data, total] = await orderedBuilder
            .skip((this.page - 1) * this.limit)
            .take(this.limit)
            .getManyAndCount()

        const pageCount = Math.ceil(total / this.limit)

        return {
            data,
            pageCount,
        }
    }

    public setAlias(alias: string): void {
        this.alias = alias
    }

    public setLimit(limit: number): void {
        this.limit = limit
    }
    public setPage(page: number): void {
        this.page = page
    }

    public setOrder(order: Order): void {
        this.order = order
    }

    public setOrderBy(orderBy: string): void {
        this.orderBy = orderBy
    }

    private buildOrder(): Record<string, Order> {
        const orderByCondition: Record<string, Order> = {}
        orderByCondition[`${this.alias}.${this.orderBy}`] = this.order

        return orderByCondition
    }
}