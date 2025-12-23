import { ILike } from 'typeorm'
import {
    AIxBlockError,
    apId,
    CreateTableRequest,
    CreateTableWebhookRequest,
    ErrorCode,
    ExportTableResponse,
    isNil,
    OffsetPaginationParams,
    SeekPage,
    Table,
    TableWebhook,
    TableWebhookEventType,
    UpdateTableRequest,
} from 'workflow-shared'
import { AppSystemProp } from '../../../../../shared/src/lib/system-props'
import { repoFactory } from '../../core/db/repo-factory'
import { APArrayContains } from '../../database/database-connection'
import { buildOffsetPaginator } from '../../helper/pagination/build-offset-paginator'
import { paginationHelper } from '../../helper/pagination/pagination-utils'
import { system } from '../../helper/system/system'
import { fieldService } from '../field/field.service'
import { RecordEntity } from '../record/record.entity'
import { TableWebhookEntity } from './table-webhook.entity'
import { TableEntity } from './table.entity'
const tableRepo = repoFactory(TableEntity)
const recordRepo = repoFactory(RecordEntity)
const tableWebhookRepo = repoFactory(TableWebhookEntity)

export const tableService = {


    async create({
        projectId,
        request,
    }: CreateParams): Promise<Table> {
        await this.validateCount({ projectId })
        const table = await tableRepo().save({
            id: apId(),
            name: request.name,
            projectId,
        })
        return table
    },
    async list({ projectId, page, limit, name }: ListParams): Promise<SeekPage<Table>> {
        const paginator = buildOffsetPaginator({
            entity: TableEntity,
            query: {
                limit,
                page,
                order: 'DESC',
            },
        })
        const queryWhere: Record<string, unknown> = { projectId }
        if (!isNil(name)) {
            queryWhere.name = ILike(`%${name}%`)
        }
        const paginationResult = await paginator.paginate(
            tableRepo().createQueryBuilder('table').where(queryWhere),
        )

        return paginationHelper.createPageOffet(paginationResult.data, paginationResult.pageCount)
    },

    async getById({
        projectId,
        id,
    }: GetByIdParams): Promise<Table> {
        const table = await tableRepo().findOne({
            where: { projectId, id },
        })

        if (isNil(table)) {
            throw new AIxBlockError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    entityType: 'Table',
                    entityId: id,
                },
            })
        }

        return table
    },

    async delete({
        projectId,
        id,
    }: DeleteParams): Promise<void> {
        await tableRepo().delete({
            projectId,
            id,
        })
    },

    async exportTable({
        projectId,
        id,
    }: ExportTableParams): Promise<ExportTableResponse> {
        const table = await this.getById({ projectId, id })

        // TODO: Change field sorting to use position when it's added
        const fields = await fieldService.getAll({ projectId, tableId: id })

        const records = await recordRepo().find({
            where: { tableId: id, projectId },
            relations: ['cells'],
        })

        const rows = records.map((record) => {
            const row: Record<string, string> = {}
            for (const field of fields) {
                const cell = record.cells.find((c) => c.fieldId === field.id)
                row[field.name] = cell?.value?.toString() ?? ''
            }
            return row
        })

        return {
            fields: fields.map((f) => ({ id: f.id, name: f.name })),
            rows,
            name: table.name,
        }
    },

    async createWebhook({
        projectId,
        id,
        request,
    }: CreateWebhookParams): Promise<TableWebhook> {
        return tableWebhookRepo().save({
            id: apId(),
            projectId,
            tableId: id,
            events: request.events,
            flowId: request.flowId,
        })
    },

    async deleteWebhook({
        projectId,
        id,
        webhookId,
    }: DeleteWebhookParams): Promise<void> {
        await tableWebhookRepo().delete({
            projectId,
            tableId: id,
            id: webhookId,
        })
    },

    async getWebhooks({
        projectId,
        id,
        events,
    }: GetWebhooksParams): Promise<TableWebhook[]> {
        return tableWebhookRepo().find({
            where: { projectId, tableId: id, ...APArrayContains('events', events) },
        })
    },

    async update({
        projectId,
        id,
        request,
    }: UpdateParams): Promise<Table> {
        await tableRepo().update({
            id,
            projectId,
        }, {
            name: request.name,
        })
        return this.getById({ projectId, id })
    },
    async count({ projectId }: CountParams): Promise<number> {
        return tableRepo().count({
            where: { projectId },
        })
    },
    async validateCount(params: CountParams): Promise<void> {
        const countRes = await this.count(params)
        if (countRes > system.getNumberOrThrow(AppSystemProp.MAX_TABLES_PER_PROJECT)) {
            throw new AIxBlockError({
                code: ErrorCode.VALIDATION,
                params: { message: `Max tables per project reached: ${system.getNumberOrThrow(AppSystemProp.MAX_TABLES_PER_PROJECT)}`,
                },
            })
        }
    },
  
}

type CreateParams = {
    projectId: string
    request: CreateTableRequest
}

type ListParams = {
    projectId: string
    cursor: string | undefined
    name: string | undefined
} & OffsetPaginationParams

type GetByIdParams = {
    projectId: string
    id: string
}

type DeleteParams = {
    projectId: string
    id: string
}

type ExportTableParams = {
    projectId: string
    id: string
}

type CreateWebhookParams = {
    projectId: string
    id: string
    request: CreateTableWebhookRequest
}

type DeleteWebhookParams = {
    projectId: string
    id: string
    webhookId: string
}

type GetWebhooksParams = {
    projectId: string
    id: string
    events: TableWebhookEventType[]
}

type UpdateParams = {
    projectId: string
    id: string
    request: UpdateTableRequest
}

type CountParams = {
    projectId: string
}
