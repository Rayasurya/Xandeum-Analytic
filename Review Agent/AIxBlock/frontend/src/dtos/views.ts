import {TViewModel, viewModelSchema} from "../models/view";
import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TViewsResponseDTO = TViewModel[];

const viewsResponseSchema: JSONSchemaType<TViewsResponseDTO> = {
  type: "array",
  items: viewModelSchema,
}

export const validateViewsResponse = createAjvValidator<TViewsResponseDTO>(viewsResponseSchema);
