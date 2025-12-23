import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";
import { activityModelSchema, TActivityModel } from "../models/activity";

export type TActivityResponseDTO = {
  count: number;
  next?: string;
  previous?: string;
  results: TActivityModel[];
};

const activityResponseSchema: JSONSchemaType<TActivityResponseDTO> = {
  type: "object",
  properties: {
    count: { type: "integer" },
    next: { type: "string", nullable: true },
    previous: { type: "string", nullable: true },
    results: { type: "array", items: activityModelSchema },
  },
  required: ["count"],
  additionalProperties: true,
};

export const validateActivityResponse =
  createAjvValidator<TActivityResponseDTO>(activityResponseSchema);
