import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TActivityModel = {
  id: string;
  activityId: string;
  hashIpfs: string;
  data: string;
  txnHash: string;
  createdAt: string;
};

export const activityModelSchema: JSONSchemaType<TActivityModel> = {
  type: "object",
  properties: {
    id: { type: "string" },
    activityId: { type: "string" },
    hashIpfs: { type: "string" },
    data: { type: "string" },
    txnHash: { type: "string" },
    createdAt: { type: "string"}, // Correctly define the date type
  },
  required: ["id", "activityId", "hashIpfs", "data", "txnHash", "createdAt"],
  additionalProperties: true,
};

const validateActivityModel = createAjvValidator<TActivityModel>(activityModelSchema);

export default validateActivityModel;
