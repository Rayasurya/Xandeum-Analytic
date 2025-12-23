import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TActionModel = {
  id: string,
  title: string,
  order: number,
  permission: string,
  reload?: boolean,
  dialog?: {
    text: string,
    type: "confirm",
  },
}

export const actionModelSchema: JSONSchemaType<TActionModel> = {
  type: "object",
  properties: {
    id: {type: "string"},
    title: {type: "string"},
    order: {type: "integer"},
    permission: {type: "string"},
    reload: {type: "boolean", nullable: true},
    dialog: {
      type: "object",
      properties: {
        text: {type: "string"},
        type: {type: "string", enum: ["confirm"]},
      },
      required: [
        "text",
        "type",
      ],
      nullable: true,
    }
  },
  required: [
    "id",
    "title",
    "order",
    "permission",
  ],
  additionalProperties: false,
}

export const validateActionModel = createAjvValidator<TActionModel>(actionModelSchema);
