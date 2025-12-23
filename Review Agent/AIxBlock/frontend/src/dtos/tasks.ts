import {taskModelSchema, TTaskModel} from "../models/task";
import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TTasksResponseDTO = {
  total_annotations: number,
  total_predictions: number,
  total: number,
  tasks: TTaskModel[],
}

export const tasksResponseSchema: JSONSchemaType<TTasksResponseDTO> = {
  type: "object",
  properties: {
    total_annotations: {type: "integer"},
    total_predictions: {type: "integer"},
    total: {type: "integer"},
    tasks: {
      type: "array",
      items: taskModelSchema,
    },
  },
  required: [
    "total_annotations",
    "total_predictions",
    "total",
    "tasks",
  ],
}

export const validateTasksResponseModel = createAjvValidator<TTasksResponseDTO>(tasksResponseSchema);
