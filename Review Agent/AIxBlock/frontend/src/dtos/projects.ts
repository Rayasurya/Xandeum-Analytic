import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";
import {projectModelSchema, TProjectModel} from "../models/project";

export type TProjectsResponseDTO = {
  count: number,
  next?: string,
  previous?: string,
  results: TProjectModel[],
}

const projectsResponseSchema: JSONSchemaType<TProjectsResponseDTO> = {
  type: "object",
  properties: {
    count: {type: "number"},
    next: {type: "string", nullable: true},
    previous: {type: "string", nullable: true},
    results: {type: "array", items: projectModelSchema},
  },
  required: [
    "count",
    "results",
  ],
  additionalProperties: false,
}

export const validateProjectsResponse = createAjvValidator<TProjectsResponseDTO>(projectsResponseSchema);
