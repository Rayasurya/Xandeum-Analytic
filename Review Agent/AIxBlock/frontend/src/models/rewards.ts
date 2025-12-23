import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export const emptyRewardAction: TRewardAction = {
  id: 0,
  point: 0,
  activity: "",
}

export type TRewardAction = {
  id: number,
  name?: string,
  date?: string,
  description?: string,
  activity: string,
  point: number,
  detail?: string,
  customer?: string,
  note?: string,
  created_at?: string,
  updated_at?: string,
}

export const rewardActionModelSchema: JSONSchemaType<TRewardAction> = {
  type: "object",
  properties: {
    id: {type: "number"},
    name: {type: "string", nullable: true},
    date: {type: "string", nullable: true},
    description: {type: "string", nullable: true},
    activity: {type: "string"},
    point: {type: "number"},
    detail: {type: "string", nullable: true},
    customer: {type: "string", nullable: true},
    note: {type: "string", nullable: true},
    created_at: {type: "string", nullable: true},
    updated_at: {type: "string", nullable: true},
  },
  required: [
    "activity",
    "point",
  ],
  additionalProperties: true,
}

export const validateRewardActionModel = createAjvValidator<TRewardAction>(rewardActionModelSchema);

export const emptyRewardHistory: TRewardHistory = {
  action: 0,
  id: 0,
  point: 0,
  status: 0,
  user: 0,
}

export type TRewardHistory = {
  id: number,
  point: number,
  status: 0 | 1,
  user: number,
  action: number,
  order?: number,
  created_at?: string,
  updated_at?: string,
  created_by?: number,
  note?: string,
}

export const rewardHistoryModelSchema: JSONSchemaType<TRewardHistory> = {
  type: "object",
  properties: {
    id: {type: "number"},
    point: {type: "number"},
    status: {type: "number", enum: [0, 1]},
    user: {type: "number"},
    action: {type: "number"},
    order: {type: "number", nullable: true},
    created_at: {type: "string", nullable: true},
    updated_at: {type: "string", nullable: true},
    created_by: {type: "number", nullable: true},
    note: {type: "string", nullable: true},
  },
  required: [
    "point",
    "status",
    "user",
    "action",
  ],
  additionalProperties: true,
}

export const validateRewardHistoryModel = createAjvValidator<TRewardHistory>(rewardHistoryModelSchema);

export type TUserPoint = {
  id: number,
  user: number,
  point: number,
  created_at?: string,
  updated_at?: string,
}

export const userPointModelSchema: JSONSchemaType<TUserPoint> = {
  type: "object",
  properties: {
    id: {type: "number"},
    user: {type: "number"},
    point: {type: "number"},
    created_at: {type: "string", nullable: true},
    updated_at: {type: "string", nullable: true},
  },
  required: [
    "user",
    "point",
  ],
  additionalProperties: true,
}

export const validateUserPointModel = createAjvValidator<TUserPoint>(userPointModelSchema);
