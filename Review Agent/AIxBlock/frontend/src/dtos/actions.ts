import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";
import {actionModelSchema, TActionModel} from "../models/action";

export type TActionsResponseDTO = TActionModel[];

const actionsResponseSchema: JSONSchemaType<TActionsResponseDTO> = {
  type: "array",
  items: actionModelSchema,
  required: [
    "columns",
  ],
}

export const validateActionsResponse = createAjvValidator<TActionsResponseDTO>(actionsResponseSchema);
