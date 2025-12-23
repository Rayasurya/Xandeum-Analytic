import { Static, Type } from '@sinclair/typebox'
import { BaseModelSchema, Nullable } from '../common/base-model'
import { ApId } from '../common/id-generator'
import { Metadata } from '../common/metadata'
import { FlowVersion } from './flow-version'

export type FlowId = ApId

export enum ScheduleType {
    CRON_EXPRESSION = 'CRON_EXPRESSION',
}

export enum FlowStatus {
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED',
}

export const FlowScheduleOptions = Type.Object({
    type: Type.Literal(ScheduleType.CRON_EXPRESSION),
    cronExpression: Type.String(),
    timezone: Type.String(),
    failureCount: Type.Optional(Type.Number()),
})

export type FlowScheduleOptions = Static<typeof FlowScheduleOptions>

export const Flow = Type.Object({
    ...BaseModelSchema,
    projectId: Type.String(),
    externalId: Nullable(Type.String()),
    folderId: Nullable(Type.String()),
    status: Type.Enum(FlowStatus),
    schedule: Nullable(FlowScheduleOptions),
    publishedVersionId: Nullable(Type.String()),
    metadata: Nullable(Metadata),
    listingName: Nullable(Type.String()),
    listingPrice: Nullable(Type.Number({ minimum: 0 })),
    listingStatus: Nullable(Type.Boolean()),
    listingDescription: Nullable(Type.String()),
    listingPreview: Nullable(Type.String()),
    listingUserId: Nullable(Type.Number()),
    listingCategoryId: Nullable(Type.String()),
})

export const ListingCategory = Type.Object({
    ...BaseModelSchema,
    name: Type.String(),
    displayName: Nullable(Type.String()),
    description: Nullable(Type.String()),
    enabled: Type.Boolean(),

})

export type Flow = Static<typeof Flow>
export const PopulatedFlow = Type.Composite([
    Flow,
    Type.Object({
        version: FlowVersion,
    }),
])

export type PopulatedFlow = Static<typeof PopulatedFlow>


export type ListingCategory = Static<typeof ListingCategory>
export const PopulatedListingCategory = Type.Composite([
    ListingCategory,
])
export type PopulatedListingCategory = Static<typeof PopulatedListingCategory>

export enum ImportTemplateType {
    LOCAL = 'local',
    N8N = 'n8n',
    MAKE = 'make',
    ZAPIER = 'zapier'
}
