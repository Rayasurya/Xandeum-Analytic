import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TCatalogCompute = {
  id: number;
  filter?: string;
  keyword?: string;
  name: string;
  created_at: string;
  updated_at?: string;
  catalog_id?: number;
  order?: number;
  tag?: string;
  status?: string;
  file?: string;
};

const catalogComputeSchema: JSONSchemaType<TCatalogCompute> = {
  type: "object",
  properties: {
    id: { type: "number" },
    filter: { type: "string", nullable: true },
    keyword: { type: "string", nullable: true },
    name: { type: "string" },
    created_at: { type: "string" },
    updated_at: { type: "string", nullable: true },
    catalog_id: { type: "number", nullable: true },
    order: { type: "number", nullable: true },
    tag: { type: "string", nullable: true },
    status: { type: "string", nullable: true },
    file: { type: "string", nullable: true },
  },
  required: ["id", "name", "created_at"],
  additionalProperties: true,
};

export const catalogComputeListSchema: JSONSchemaType<TCatalogCompute[]> = {
  type: "array",
  items: catalogComputeSchema,
};

export const validateCatalogComputeListModel = createAjvValidator<
  TCatalogCompute[]
>(catalogComputeListSchema);
