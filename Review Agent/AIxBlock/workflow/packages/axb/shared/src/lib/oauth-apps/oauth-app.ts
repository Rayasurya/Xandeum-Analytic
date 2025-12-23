import { Static, Type } from "@sinclair/typebox";
import { BaseModelSchema } from "workflow-shared";

export const OAuthApp = Type.Object({
  ...BaseModelSchema,
  blockName: Type.String(),
  platformId: Type.String(),
  clientId: Type.String(),
})

export type OAuthApp = Static<typeof OAuthApp>

export const UpsertOAuth2AppRequest = Type.Object({
  blockName: Type.String(),
  clientId: Type.String(),
  clientSecret: Type.String()
})

export type UpsertOAuth2AppRequest = Static<typeof UpsertOAuth2AppRequest>

export const ListOAuth2AppRequest = Type.Object({
  limit: Type.Optional(Type.Number()),
  cursor: Type.Optional(Type.String()),
})

export type ListOAuth2AppRequest = Static<typeof ListOAuth2AppRequest>;