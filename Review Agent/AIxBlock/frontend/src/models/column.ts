import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TColumnSchemaItemsModel = number[] | string[] | { title: string, value: string | number }[]

export const columnSchemaItemsModelSchema: JSONSchemaType<TColumnSchemaItemsModel> = {
  anyOf: [
    {type: "array", items: {type: "string"}},
    {type: "array", items: {type: "integer"}},
    {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {type: "string"},
          value: {type: ["string", "number"]},
        },
        required: [
          "title",
          "value",
        ],
      },
    },
  ],
}

export type TColumnModel = {
  id: string,
  title: string,
  type: string,
  help: string,
  target: string,
  parent?: string,
  children?: string[],
  schema?: {
    items: number[] | string[] | {
      title: string,
      value: string | number,
    }[],
  },
  visibility_defaults?: {
    explore: boolean,
    labeling: boolean,
  },
}

export const columnModelSchema: JSONSchemaType<TColumnModel> = {
  type: "object",
  properties: {
    id: {type: "string"},
    title: {type: "string"},
    type: {type: "string"},
    help: {type: "string"},
    target: {type: "string"},
    parent: {type: "string", nullable: true},
    children: {type: "array", items: {type: "string"}, nullable: true},
    schema: {
      type: "object",
      properties: {
        items: columnSchemaItemsModelSchema,
      },
      required: [
        "items",
      ],
      nullable: true,
    },
    visibility_defaults: {
      type: "object",
      properties: {
        explore: {type: "boolean"},
        labeling: {type: "boolean"},
      },
      required: [
        "explore",
        "labeling",
      ],
      nullable: true,
    },
  },
  required: [
    "id",
    "title",
    "type",
    "target",
  ],
  additionalProperties: false,
}

export const validateColumnModel = createAjvValidator<TColumnModel>(columnModelSchema);
export const validateColumnSchemaItemsModel = createAjvValidator<TColumnSchemaItemsModel>(columnSchemaItemsModelSchema);
