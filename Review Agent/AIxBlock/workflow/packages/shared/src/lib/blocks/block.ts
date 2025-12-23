import { Static, Type } from '@sinclair/typebox'

export enum PackageType {
    ARCHIVE = 'ARCHIVE',
    REGISTRY = 'REGISTRY',
}

export enum BlockType {
    CUSTOM = 'CUSTOM',
    OFFICIAL = 'OFFICIAL',
}

export const PrivateBlockPackage = Type.Object({
    packageType: Type.Literal(PackageType.ARCHIVE),
    blockType: Type.Enum(BlockType),
    blockName: Type.String(),
    pieceVersion: Type.String(),
    archiveId: Type.String(),
    archive: Type.Unknown(),
})

export type PrivateBlockPackage = Static<typeof PrivateBlockPackage>

export const PublicBlockPackage = Type.Object({
    packageType: Type.Literal(PackageType.REGISTRY),
    blockType: Type.Enum(BlockType),
    blockName: Type.String(),
    pieceVersion: Type.String(),
})

export type PublicBlockPackage = Static<typeof PublicBlockPackage>

export const BlockPackage = Type.Union([PrivateBlockPackage, PublicBlockPackage])
export type BlockPackage = PrivateBlockPackage | PublicBlockPackage

export enum BlockCategory {
    ARTIFICIAL_INTELLIGENCE = 'ARTIFICIAL_INTELLIGENCE',
    COMMUNICATION = 'COMMUNICATION',
    COMMERCE = 'COMMERCE',
    CORE = 'CORE',
    UNIVERSAL_AI = 'UNIVERSAL_AI',
    FLOW_CONTROL = 'FLOW_CONTROL',
    BUSINESS_INTELLIGENCE = 'BUSINESS_INTELLIGENCE',
    ACCOUNTING = 'ACCOUNTING',
    PRODUCTIVITY = 'PRODUCTIVITY',
    CONTENT_AND_FILES = 'CONTENT_AND_FILES',
    DEVELOPER_TOOLS = 'DEVELOPER_TOOLS',
    CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
    FORMS_AND_SURVEYS = 'FORMS_AND_SURVEYS',
    HUMAN_RESOURCES = 'HUMAN_RESOURCES',
    PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
    MARKETING = 'MARKETING',
    SALES_AND_CRM = 'SALES_AND_CRM',
}
