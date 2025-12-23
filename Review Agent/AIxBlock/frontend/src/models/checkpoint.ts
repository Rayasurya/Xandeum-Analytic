import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TCheckpoint = {
  id?: number;
  name: string;
  owner_id: number;
  author_id: number;
  checkpoint_storage_id: string;
  ml_id?: number;
  project_id: number;
  model_id: number;
  catalog_id?: number;
  order: number;
  config: string;
  type: string;
  version: string;
  status?: string;
  file?: string;
  created_at?: string;
  updated_at?: string;
};

export type TCheckpointList = TCheckpoint[];

export const checkpointSchema: JSONSchemaType<TCheckpoint> = {
  type: "object",
  properties: {
    id: { type: "number", nullable: true },
    name: { type: "string" },
    owner_id: { type: "number" },
    author_id: { type: "number" },
    checkpoint_storage_id: { type: "string" },
    ml_id: { type: "number", nullable: true },
    project_id: { type: "number" },
    model_id: { type: "number" },
    catalog_id: { type: "number", nullable: true },
    order: { type: "number" },
    config: { type: "string" },
    type: { type: "string" },
    version: { type: "string" },
    status: { type: "string", nullable: true },
    file: { type: "string", nullable: true },
    created_at: { type: "string", nullable: true },
    updated_at: { type: "string", nullable: true },
  },
  required: [
    "name",
    "owner_id",
    "author_id",
    "checkpoint_storage_id",
    // "ml_id",
    "project_id",
    "model_id",
    // "catalog_id",
    "order",
    "config",
    "type",
    "version",
  ],
  additionalProperties: true,
};

export const checkpointListSchema: JSONSchemaType<TCheckpointList> = {
  type: "array",
  items: checkpointSchema,
};

export const validateCheckpointModelMarketplace =
  createAjvValidator<TCheckpointList>(checkpointListSchema);
