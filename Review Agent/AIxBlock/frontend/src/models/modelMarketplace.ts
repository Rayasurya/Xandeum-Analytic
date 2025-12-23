import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";
import { StatusString } from "./enum";

export type TModelTask = {
  id: number,
  name: string,
  description?: string,
  created_at?: string,
  updated_at?: string,
}

export const modelTaskSchema: JSONSchemaType<TModelTask> = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    description: { type: "string", nullable: true },
    created_at: { type: "string", nullable: true },
    updated_at: { type: "string", nullable: true },
  },
  required: [
    "id",
    "name",
  ],
  additionalProperties: true,
};

export const validateModelTaskModel = createAjvValidator<TModelTask>(modelTaskSchema);

export type TModelTasks = TModelTask[];

export const modelTasksSchema: JSONSchemaType<TModelTasks> = {
  type: "array",
  items: modelTaskSchema,
};

export const validateModelTasksModel = createAjvValidator<TModelTasks>(modelTasksSchema);

export type TModelMarketplace = {
  id: number;
  total_user_rent: number;
  name?: string;
  model_name?: string;
  created_at: string;
  updated_at?: string;
  owner_id: number;
  author_id: number;
  checkpoint_storage_id: string;
  catalog_id: number;
  order: number;
  config?: string;
  dataset_storage_id: number;
  model_desc?: string;
  ip_address?: string;
  port?: string;
  price: number;
  status?: StatusString;
  file?: string;
  docker_image?: string;
  docker_access_token?: string;
  type: "MODEL-SYSTEM" | "MODEL-CUSTOMER";
  like_count?: number;
  download_count?: number;
  user_liked?: boolean;
  ml_id?: number | null;
  // related_compute?: string | null;
  related_compute_gpu?: string | null;
  image_dockerhub_id?: string | null;
  infrastructure_id?: string | null;
  model_source?: string | null;
  model_id?: string | null;
  model_token?: string | null;
  checkpoint_source?: string | null;
  checkpoint_id?: string | null;
  checkpoint_token?: string | null;
  compute_gpus?: string[];
  is_auto_update_version?: boolean;
  interactive_preannotations?: boolean;
  schema?: string | null;
  model_type?: string | null;
  can_rent?: boolean;
  related_compute?: {
    id: number;
  },
  tasks: TModelTask[],
  history_id?: number | null;
};

export type TMarketplaceList = TModelMarketplace[];

export const marketplaceModelSchema: JSONSchemaType<TModelMarketplace> = {
  type: "object",
  properties: {
    id: { type: "number" },
    total_user_rent: { type: "number" },
    name: { type: "string", nullable: true },
    model_name: { type: "string", nullable: true },
    created_at: { type: "string" },
    updated_at: { type: "string", nullable: true },
    owner_id: { type: "number" },
    author_id: { type: "number" },
    checkpoint_storage_id: { type: "string" },
    catalog_id: { type: "number" },
    order: { type: "number" },
    config: { type: "string", nullable: true },
    dataset_storage_id: { type: "number" },
    model_desc: { type: "string", nullable: true },
    ip_address: { type: "string", nullable: true },
    port: { type: "string", nullable: true },
    price: { type: "number" },
    status: {
      type: "string",
      enum: [
        "created",
        "in_marketplace",
        "rented_bought",
        "completed",
        "pending",
        "suspended",
        "expired",
        "suppend",
      ],
      nullable: true,
    },
    file: { type: "string", nullable: true },
    docker_image: { type: "string", nullable: true },
    docker_access_token: { type: "string", nullable: true },
    type: { type: "string", enum: ["MODEL-CUSTOMER", "MODEL-SYSTEM"] },
    like_count: { type: "number", nullable: true },
    download_count: { type: "number", nullable: true },
    user_liked: { type: "boolean", nullable: true },
    ml_id: { type: "number", nullable: true },
    // related_compute: { type: "string", nullable: true },
    related_compute_gpu: { type: "string", nullable: true },
    image_dockerhub_id: { type: "string", nullable: true },
    infrastructure_id: { type: "string", nullable: true },
    model_source: { type: "string", nullable: true },
    model_id: { type: "string", nullable: true },
    model_token: { type: "string", nullable: true },
    checkpoint_source: { type: "string", nullable: true },
    checkpoint_id: { type: "string", nullable: true },
    checkpoint_token: { type: "string", nullable: true },
    compute_gpus: { type: "array", items: { type: "string" }, nullable: true },
    is_auto_update_version: { type: "boolean", nullable: true },
    interactive_preannotations: { type: "boolean", nullable: true },
    schema: { type: "string", nullable: true },
    model_type: { type: "string", nullable: true },
    can_rent: { type: "boolean", nullable: true },
    related_compute: {
      type: "object",
      properties: {
        id: { type: "number" },
      },
      required: ["id"],
      additionalProperties: true,
      nullable: true,
    },
    tasks: { type: "array", items: modelTaskSchema },
    history_id: { type: "number", nullable: true },
  },
  required: [
    "created_at",
    "owner_id",
    "author_id",
    "checkpoint_storage_id",
    "catalog_id",
    "order",
    "dataset_storage_id",
    "price",
    "tasks",
  ],
  additionalProperties: true,
};

export const modelMarketplaceListModelSchema: JSONSchemaType<TMarketplaceList> = {
  type: "array",
  items: marketplaceModelSchema,
}

export const validateMarketplaceListModel = createAjvValidator<TMarketplaceList>(modelMarketplaceListModelSchema);
