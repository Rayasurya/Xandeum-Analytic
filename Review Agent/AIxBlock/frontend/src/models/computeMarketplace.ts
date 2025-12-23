import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";
import { StatusString } from "./enum";

export type Price = {
  id: number;
  token_symbol: string;
  price: number;
  unit: string;
  compute_gpu_id: number;
  compute_marketplace_id: number;
  model_marketplace_id?: number;
};

export type ComputeGPU = {
  id: number;
  vast_contract_id?: number;
  prices: Price[];
  gpu_name: string;
  power_consumption?: string;
  gpu_index: number;
  gpu_memory?: string;
  branch_name?: string;
  gpu_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  compute_marketplace: number;
  infrastructure_id: string;
};

export type CPUPrice = {
  id: number;
  token_symbol: string;
  price: number;
  unit: string;
  type: string;
  compute_marketplace_id: number;
};


export type TComputeMarketplace = {
  id: number,
  name: string,
  created_at: string,
  updated_at?: string,
  infrastructure_id: string,
  owner_id: number,
  author_id: number,
  catalog_id: number,
  organization_id: number,
  order: number,
  config: string | object,
  infrastructure_desc: string,
  ip_address: string;
  port: string;
  docker_port: string;
  kubernetes_port: string;
  status: StatusString;
  callback_url: string;
  client_id: string;
  client_secret: string;
  ssh_key?: string;
  card?: number;
  price?: number;
  compute_type?: string;
  compute_gpus?: ComputeGPU[];
  type?: string;
  cpu_price?: CPUPrice;
  is_using_cpu: boolean;
};

export type TComputeMarketplaceList = TComputeMarketplace[];

export const computeMarketplaceModelSchema: JSONSchemaType<TComputeMarketplace> =
  {
    type: "object",
    properties: {
      id: { type: "number" },
      name: { type: "string" },
      created_at: { type: "string" },
      updated_at: { type: "string", nullable: true },
      infrastructure_id: { type: "string" },
      owner_id: { type: "number" },
      author_id: { type: "number" },
      catalog_id: { type: "number", default: 0 },
      organization_id: { type: "number" },
      order: { type: "number", default: 0 },
      config: { anyOf: [{ type: "string" }, { type: "object" }], default: {}},
      infrastructure_desc: { type: "string", default: "" },
      ip_address: { type: "string" },
      port: { type: "string", default: "8080" },
      docker_port: { type: "string", default: "4243" },
      kubernetes_port: { type: "string", default: "6443" },
      status: {
        type: "string",
        enum: [
          "created",
          "in_marketplace",
          "rented_bought",
          "completed",
          "pending",
          "suppend",
          "expired",
        ],
        maxLength: 64,
      },
      callback_url: { type: "string", default: "" },
      client_id: { type: "string" },
      client_secret: { type: "string" },
      ssh_key: { type: "string", nullable: true },
      card: { type: "number", nullable: true },
      price: { type: "number", nullable: true, default: 0 },
      compute_type: { type: "string", nullable: true },
      type: { type: "string", nullable: true },
      compute_gpus: {
				type: "array",
				nullable: true, 
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            prices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  token_symbol: { type: "string" },
                  price: { type: "number" },
                  unit: { type: "string" },
                  compute_gpu_id: { type: "number" },
                  compute_marketplace_id: { type: "number" },
                  model_marketplace_id: { type: "number", nullable: true },
                },
                required: [
                  "id",
                  "token_symbol",
                  "price",
                  "unit",
                  "compute_gpu_id",
                  "compute_marketplace_id",
                ],
              },
            },
            vast_contract_id: { type: "number", nullable: true },
            gpu_name: { type: "string" },
            power_consumption: { type: "string", nullable: true },
            gpu_index: { type: "number" },
            gpu_memory: { type: "string", nullable: true },
            branch_name: { type: "string", nullable: true },
            gpu_id: { type: "string" },
            created_at: { type: "string" },
            updated_at: { type: "string" },
            status: { type: "string" },
            compute_marketplace: { type: "number" },
            infrastructure_id: { type: "string" },
          },
          required: [
            "id",
            "prices",
            "gpu_name",
            "gpu_index",
            "gpu_id",
            "created_at",
            "updated_at",
            "status",
            "compute_marketplace",
            "infrastructure_id",
          ],
        },
      },
      cpu_price: {
      type: "object",
      nullable: true,
      properties: {
        id: { type: "number" },
        token_symbol: { type: "string" },
        price: { type: "number" },
        unit: { type: "string" },
        type: { type: "string" },
        compute_marketplace_id: { type: "number" },
      },
      required: ["id", "token_symbol", "price", "unit", "type", "compute_marketplace_id"],
      },
      is_using_cpu: { type: "boolean" }
    },
    required: [
      "id",
      "name",
      "created_at",
      "infrastructure_id",
      "owner_id",
      "author_id",
      "catalog_id",
      "organization_id",
      "order",
      "config",
      "infrastructure_desc",
      "ip_address",
      "port",
      "docker_port",
      "kubernetes_port",
      "status",
      "callback_url",
      "client_id",
      "client_secret",
      "is_using_cpu"
    ],
    additionalProperties: true,
  };

export const computeMarketplaceListModelSchema: JSONSchemaType<TComputeMarketplaceList> =
  {
    type: "array",
    items: computeMarketplaceModelSchema,
  };

export const validateComputeMarketplaceListModel =
  createAjvValidator<TComputeMarketplaceList>(
    computeMarketplaceListModelSchema
  );
