import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type ActionWebhooks = "PROJECT_CREATED" | "PROJECT_UPDATED" | "PROJECT_DELETED" | "TASKS_CREATED" | "TASKS_DELETED" | "ANNOTATION_CREATED" | "ANNOTATIONS_CREATED" | "ANNOTATION_UPDATED" | "ANNOTATIONS_DELETED" | "LABEL_LINK_CREATED" | "LABEL_LINK_UPDATED" | "LABEL_LINK_DELETED";

export type TWebhookResponse = {
  created_at: string;
  updated_at: string;
  headers: {};
  id: number;
  is_active: boolean;
  organization: number;
  project: number;
  send_for_all_actions: boolean;
  send_payload: boolean;
  url: string;
};

export type TWebhookResList = TWebhookResponse[];

export const webhooksSchema: JSONSchemaType<TWebhookResponse> = {
  type: "object",
  properties: {
    created_at: {type: "string"},
    updated_at: {type: "string"},
    headers: {type: "object"},
    id: {type: "number"},
    is_active: {type: "boolean"},
    organization: {type: "number"},
    project: {type: "number"},
    send_for_all_actions: {type: "boolean"},
    send_payload: {type: "boolean"},
    url: {type: "string"},
  },
  required: [
    "organization",
    "project",
    "url",
    "send_payload",
    "send_for_all_actions",
    "headers",
    "is_active",
    "created_at",
    "updated_at",
  ],
  additionalProperties: true,
}

export const modelWebhooksSchema: JSONSchemaType<TWebhookResList> = {
  type: "array",
  items: webhooksSchema,
}

export const validateWebhooksListModel = createAjvValidator<TWebhookResList>(modelWebhooksSchema);
