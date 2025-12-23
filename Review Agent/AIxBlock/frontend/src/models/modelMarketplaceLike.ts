import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TModelMarketplaceLikeModel = {
  is_like: boolean,
  like_count: number,
}

export const modelMarketplaceLikeModelSchema: JSONSchemaType<TModelMarketplaceLikeModel> = {
  type: "object",
  properties: {
    is_like: {type: "boolean"},
    like_count: {type: "number"},
  },
  required: [
    "is_like",
    "like_count",
  ],
  additionalProperties: true,
}

export const validateModelMarketplaceLikeModel = createAjvValidator<TModelMarketplaceLikeModel>(modelMarketplaceLikeModelSchema);
