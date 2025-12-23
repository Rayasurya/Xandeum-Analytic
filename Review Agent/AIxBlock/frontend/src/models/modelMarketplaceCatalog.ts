import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TMarketplaceCatalog = {
  id: number;
  name: string;
  created_at: string;
  updated_at?: string;
  catalog_id?: number;
  order?: number;
  tag?: string;
  status?: string;
  file?: string;
  author_id?: number;
}

export type TMarketplaceCatalogList = TMarketplaceCatalog[];

export const marketplaceCatalogModelSchema: JSONSchemaType<TMarketplaceCatalog> = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    created_at: { type: "string" },
    updated_at: { type: "string", nullable: true },
    catalog_id: { type: "number", nullable: true },
    order: { type: "number", nullable: true, default: 0 },
    tag: { type: "string", nullable: true },
    status: { type: "string", nullable: true },
    file: { type: "string", nullable: true },
    author_id: { type: "number", nullable: true },
  },
  required: [
    "name",
    "created_at"
  ],
  additionalProperties: true,
}

export const marketplaceCatalogListModelSchema: JSONSchemaType<TMarketplaceCatalogList> = {
  type: "array",
  items: marketplaceCatalogModelSchema,
}

export const validateMarketplaceCatalogListModel = createAjvValidator<TMarketplaceCatalogList>(marketplaceCatalogListModelSchema);
