import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

type DayRange = {
  start_day: string;
  end_day: string;
};

export type TTimeWorking = {
  id: number;
  compute_id: number;
  infrastructure_id: string;
  time_start: string;
  time_end: string;
  day_range?: DayRange[];
  created_at: string;
  updated_at?: string;
  status?: string;
};

export const timeWorkingSchema: JSONSchemaType<TTimeWorking> = {
  type: "object",
  properties: {
    id: { type: "number" },
    compute_id: { type: "number" },
    infrastructure_id: { type: "string" },
    time_start: { type: "string" },
    time_end: { type: "string" },
    day_range: {
      type: "array",
      items: {
        type: "object",
        properties: {
          start_day: { type: "string" },
          end_day: { type: "string" },
        },
        required: ["start_day", "end_day"],
      },
      nullable: true,
    },
    created_at: { type: "string" },
    updated_at: { type: "string", nullable: true },
    status: { type: "string", nullable: true },
  },
  required: [
    "id",
    "compute_id",
    "infrastructure_id",
    "time_start",
    "time_end",
    "created_at",
  ],
  additionalProperties: true,
};

export const validateTimeWorkingModel =
  createAjvValidator<TTimeWorking>(timeWorkingSchema);
