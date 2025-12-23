import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";
import {columnModelSchema, TColumnModel} from "../models/column";

export type TColumnsResponseDTO = {
  columns: TColumnModel[],
}

const columnsResponseSchema: JSONSchemaType<TColumnsResponseDTO> = {
  type: "object",
  properties: {
    columns: {
      type: "array",
      items: columnModelSchema,
    },
  },
  required: [
    "columns",
  ],
}

export const validateColumnsResponse = createAjvValidator<TColumnsResponseDTO>(columnsResponseSchema);
