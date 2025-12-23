import { ListingCategory } from 'workflow-shared'
import { EntitySchema } from 'typeorm'
import { BaseColumnSchemaPart } from '../../database/database-common'

export type ListingCategorySchema = ListingCategory & object
export const ListingCategoryEntity = new EntitySchema<ListingCategorySchema>({
    name: 'listing_category',
    columns: {
        ...BaseColumnSchemaPart,
        name: {
            type: String,
            nullable: false,
        },
        displayName: {
            type: String,
            nullable: true,
        },
        description: {
            type: String,
            nullable: true,
        },
        enabled: {
            type: Boolean,
            nullable: false,
        },

    },
})