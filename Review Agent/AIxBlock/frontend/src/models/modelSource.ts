import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TModelSource = {
  id: number;
  docker_image: string;
};

export type TModelSourceList = TModelSource[];

export const modelSourceSchema: JSONSchemaType<TModelSource> = {
  type: "object",
  properties: {
    id: {type: "number"},
    docker_image: {type: "string"},
  },
  required: [
    "id",
    "docker_image",
  ],
  additionalProperties: true,
};

export const modelSourceListSchema: JSONSchemaType<TModelSourceList> = {
  type: "array",
  items: modelSourceSchema,
};

export const validateModelSourceList = createAjvValidator<TModelSourceList>(modelSourceListSchema);
