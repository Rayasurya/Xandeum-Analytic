import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TAnnotationTemplate = {
  id: number,
  name: string,
  group: string,
  created_at: string,
  updated_at: string,
  author_id: number,
  order: number,
  image: string,
  details: string,
  ml_image?: string,
  ml_ip?: string,
  ml_port?: string,
  config: string,
  status: boolean,
  infrastructure_id?: string,
  data_type: string,
  extensions?: string,
}

export type TAnnotationTemplateList = TAnnotationTemplate[];

export const annotationTemplateModelSchema: JSONSchemaType<TAnnotationTemplate> = {
  type: "object",
  properties: {
    id: {type: "number"},
    name: {type: "string"},
    group: {type: "string"},
    created_at: {type: "string"},
    updated_at: {type: "string"},
    author_id: {type: "number"},
    order: {type: "number"},
    image: {type: "string"},
    details: {type: "string"},
    ml_image: {type: "string", nullable: true},
    ml_ip: {type: "string", nullable: true},
    ml_port: {type: "string", nullable: true},
    config: {type: "string"},
    status: {type: "boolean"},
    infrastructure_id: {type: "string", nullable: true},
    data_type: {type: "string"},
    extensions: {type: "string", nullable: true},
  },
  required: [
    "name",
    "group",
    "created_at",
    "updated_at",
    "author_id",
    "order",
    "image",
    "details",
    "config",
    "status",
    "data_type",
  ],
  additionalProperties: true,
}

export const annotationTemplateListModelSchema: JSONSchemaType<TAnnotationTemplateList> = {
  type: "array",
  items: annotationTemplateModelSchema,
}

export const validateAnnotationTemplateListModel = createAjvValidator<TAnnotationTemplateList>(annotationTemplateListModelSchema);
