import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TCompactOrganization = {
  id: number,
  title: string,
  status: string,
}

export const compactOrganizationModelSchema: JSONSchemaType<TCompactOrganization> = {
  type: "object",
  properties: {
    id: {type: "number"},
    title: {type: "string", maxLength: 1000, minLength: 1},
    status: {type: "string"},
  },
  required: [
    "title",
    "status",
  ],
  additionalProperties: true,
}

export const validateCompactOrganizationModel = createAjvValidator<TCompactOrganization>(compactOrganizationModelSchema);

export type TCompactOrganizationsList = TCompactOrganization[];

export const compactOrganizationsListModelSchema: JSONSchemaType<TCompactOrganizationsList> = {
  type: "array",
  items: compactOrganizationModelSchema,
}

export const validateCompactOrganizationsListModel = createAjvValidator<TCompactOrganizationsList>(compactOrganizationsListModelSchema);

export type TOrganizationsAdmin = {
  id: number,
  created_by?: number,
  title: string,
  token: string,
  team_id: string,
  created_at: string,
  updated_at: string,
  status?: string,
  user: number[],
}

export const organizationsAdminModelSchema: JSONSchemaType<TOrganizationsAdmin> = {
  type: "object",
  properties: {
    id: {type: "number"},
    created_by: {type: "number", nullable: true},
    title: {type: "string"},
    token: {type: "string"},
    team_id: {type: "string"},
    created_at: {type: "string"},
    updated_at: {type: "string"},
    status: {type: "string", nullable: true},
    user: {type: "array", items: {type: "number"}}
  },
  required: [
    "title",
    "token",
    "team_id",
    "created_at",
    "updated_at",
  ],
  additionalProperties: true,
}

export type TOrganizationAdminList = TOrganizationsAdmin[];

export const organizationsAdminListModelSchema: JSONSchemaType<TOrganizationAdminList> = {
  type: "array",
  items: organizationsAdminModelSchema,
}

export const validateOrganizationAdminModel = createAjvValidator<TOrganizationAdminList>(organizationsAdminListModelSchema);
