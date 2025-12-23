import { Static, Type } from "@sinclair/typebox";
import { BlockCategory, BlockType, PackageType, ProjectId, TriggerTestStrategy } from "workflow-shared";
import { ErrorHandlingOptionsParam } from "./action/action";
import { PiecePropertyMap } from "./property";
import { PieceAuthProperty } from "./property/authentication";
import { TriggerStrategy, WebhookHandshakeConfiguration, WebhookRenewConfiguration } from "./trigger/trigger";

export const BlockBase = Type.Object({
  id: Type.Optional(Type.String()),
  name: Type.String(),
  displayName: Type.String(),
  logoUrl: Type.String(),
  description: Type.String(),
  projectId: Type.Optional(Type.String()),
  authors: Type.Array(Type.String()),
  platformId: Type.Optional(Type.String()),
  directoryPath: Type.Optional(Type.String()),
  auth: Type.Optional(PieceAuthProperty),
  version: Type.String(),
  categories: Type.Optional(Type.Array(Type.Enum(BlockCategory))),
  minimumSupportedRelease: Type.Optional(Type.String()),
  maximumSupportedRelease: Type.Optional(Type.String()),
})

export type BlockBase = {
  id?: string;
  name: string;
  displayName: string;
  logoUrl: string;
  description: string;
  projectId?: ProjectId;
  platformId?: string;
  authors: string[],
  directoryPath?: string;
  auth?: PieceAuthProperty;
  version: string;
  categories?: BlockCategory[];
  minimumSupportedRelease?: string;
  maximumSupportedRelease?: string;
}

export const ActionBase = Type.Object({
  name: Type.String(),
  displayName: Type.String(),
  description: Type.String(),
  props: PiecePropertyMap,
  requireAuth: Type.Boolean(),
  errorHandlingOptions: Type.Optional(ErrorHandlingOptionsParam),
})

export type ActionBase = {
  name: string,
  displayName: string,
  description: string,
  props: PiecePropertyMap,
  requireAuth: boolean;
  errorHandlingOptions?: ErrorHandlingOptionsParam;
}

export const TriggerBase = Type.Composite([
  Type.Omit(ActionBase, ["requireAuth"]),
  Type.Object({
    type: Type.Enum(TriggerStrategy),
    sampleData: Type.Unknown(),
    handshakeConfiguration: Type.Optional(WebhookHandshakeConfiguration),
    renewConfiguration: Type.Optional(WebhookRenewConfiguration),
    testStrategy: Type.Enum(TriggerTestStrategy),
  })
])
export type TriggerBase = ActionBase & {
  type: TriggerStrategy;
  sampleData: unknown,
  handshakeConfiguration?: WebhookHandshakeConfiguration;
  renewConfiguration?: WebhookRenewConfiguration;
  testStrategy: TriggerTestStrategy;
};

export const BlockMetadata = Type.Composite([
  BlockBase,
  Type.Object({
    actions: Type.Record(Type.String(), ActionBase),
    triggers: Type.Record(Type.String(), TriggerBase),
  })
])

export type BlockMetadata = BlockBase & {
  actions: Record<string, ActionBase>;
  triggers: Record<string, TriggerBase>;
};

export const BlockMetadataSummary = Type.Composite([
  Type.Omit(BlockMetadata, ["actions", "triggers"]),
  Type.Object({
    actions: Type.Number(),
    triggers: Type.Number(),
    suggestedActions: Type.Optional(Type.Array(TriggerBase)),
    suggestedTriggers: Type.Optional(Type.Array(ActionBase)),
  })
])
export type BlockMetadataSummary = Omit<BlockMetadata, "actions" | "triggers"> & {
  actions: number;
  triggers: number;
  rawActions?: Record<string, ActionBase>;
  rawTriggers?: Record<string, TriggerBase>;
  suggestedActions?: ActionBase[];
  suggestedTriggers?: TriggerBase[];
}


const BlockPackageMetadata = Type.Object({
  projectUsage: Type.Number(),
  tags: Type.Optional(Type.Array(Type.String())),
  blockType: Type.Enum(BlockType),
  packageType: Type.Enum(PackageType),
  archiveId: Type.Optional(Type.String()),
})
type BlockPackageMetadata = Static<typeof BlockPackageMetadata>

export const BlockMetadataModel = Type.Composite([
  BlockMetadata,
  BlockPackageMetadata,
])
export type BlockMetadataModel = BlockMetadata & BlockPackageMetadata

export const BLockMetadataModelSummary = Type.Composite([
  BlockMetadataSummary,
  BlockPackageMetadata,
])
export type BlockMetadataModelSummary = BlockMetadataSummary & BlockPackageMetadata
