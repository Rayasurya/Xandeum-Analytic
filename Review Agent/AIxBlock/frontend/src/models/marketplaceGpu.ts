import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TMarketplaceGpuModel = {
  id: number;
  gpu_name?: string;
  power_consumption?: string;
  memory_usage?: string;
  gpu_index: number;
  gpu_id?: string;
  branch_name?: string;
  Kind: string,
  Value: string,
}

export const marketplaceGpuModelSchema: JSONSchemaType<TMarketplaceGpuModel> = {
  type: "object",
  properties: {
    id: { type: "number" },
    gpu_name: { type: "string", nullable: true },
    power_consumption: { type: "string", nullable: true },
    memory_usage: { type: "string", nullable: true },
    gpu_index: { type: "number" },
    gpu_id: { type: "string", nullable: true },
    branch_name: { type: "string", nullable: true },
    Kind: {type: "string"},
    Value: {type: "string"},
  },
  required: [
    "id",
    "gpu_index"
  ],
  additionalProperties: true,
}

export const validateMarketplaceGpuModel = createAjvValidator<TMarketplaceGpuModel>(marketplaceGpuModelSchema);
