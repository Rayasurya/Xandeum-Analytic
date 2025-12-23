import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TMLBackend = {
  id: number;
  state: "CO" | "DI" | "ER" | "TR" | "PR",
  is_interactive: boolean,
  url: string,
  error_message?: string,
  title?: string,
  description?: string,
  model_version?: string,
  timeout: number,
  project: number,
  created_at: string,
  updated_at: string,
  auto_update: boolean,
  status: string,
  status_training: string,
  install_status?: string,
  entry_file?: string | null,
  arguments?: { name: string, value: string }[] | null,
  network_history?: { status: string },
  mlnetwork?: number | null,
  model_checkpoint?: string
}

export type TMLBackendList = TMLBackend[];

export const mlBackendModelSchema: JSONSchemaType<TMLBackend> = {
  type: "object",
  properties: {
    id: {type: "number"},
    state: {type: "string", enum: ["CO", "DI", "ER", "TR", "PR"]},
    is_interactive: {type: "boolean"},
    url: {type: "string"},
    error_message: {type: "string", nullable: true},
    title: {type: "string", nullable: true},
    description: {type: "string", nullable: true},
    model_version: {type: "string", nullable: true},
    timeout: {type: "number"},
    project: {type: "number"},
    created_at: {type: "string"},
    updated_at: {type: "string"},
    auto_update: {type: "boolean"},
    status: {type: "string"},
    status_training: {type: "string"},
    install_status: {type: "string", nullable: true},
    entry_file: {type: "string", nullable: true},
    mlnetwork: {type: "number", nullable: true},
    arguments: {
      items: {
        type: "object",
        properties: {
          name: {type: "string"},
          value: {type: "string"},
        },
        required: ["name", "value"],
      },
      type: "array",
      nullable: true,
    },
    network_history: {
      type: "object",
      properties: {
        status: { type: "string" },
      },
      required: ["status"],
      nullable: true,
    },
    model_checkpoint: {type: "string", nullable: true}
  },
  required: [
    "state",
    "is_interactive",
    "url",
    "timeout",
    "project",
    "created_at",
    "updated_at",
    "auto_update",
    "status",
    "status_training",
  ],
  additionalProperties: true,
}

export const mlBackendListModelSchema: JSONSchemaType<TMLBackendList> = {
  type: "array",
  items: mlBackendModelSchema,
}

export const validateMLBackendModel = createAjvValidator<TMLBackend>(mlBackendModelSchema);
export const validateMLBackendListModel = createAjvValidator<TMLBackendList>(mlBackendListModelSchema);
