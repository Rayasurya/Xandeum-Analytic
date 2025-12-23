import {rewardActionModelSchema, rewardHistoryModelSchema, TRewardAction, TRewardHistory} from "../models/rewards";
import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TUserRewardsResponseDTO = {
  count: number,
  next?: string,
  previous?: string,
  results: TRewardHistory[],
}

const userRewardsResponseSchema: JSONSchemaType<TUserRewardsResponseDTO> = {
  type: "object",
  properties: {
    count: {type: "number"},
    next: {type: "string", nullable: true},
    previous: {type: "string", nullable: true},
    results: {type: "array", items: rewardHistoryModelSchema},
  },
  required: [
    "count",
    "results",
  ],
  additionalProperties: false,
}

export const validateUserRewardsResponse = createAjvValidator<TUserRewardsResponseDTO>(userRewardsResponseSchema);

export type TRewardActionsResponseDTO = {
  count: number,
  next?: string,
  previous?: string,
  results: TRewardAction[],
}

const rewardActionsResponseSchema: JSONSchemaType<TRewardActionsResponseDTO> = {
  type: "object",
  properties: {
    count: {type: "number"},
    next: {type: "string", nullable: true},
    previous: {type: "string", nullable: true},
    results: {type: "array", items: rewardActionModelSchema},
  },
  required: [
    "count",
    "results",
  ],
  additionalProperties: false,
}

export const validateRewardActionsResponse = createAjvValidator<TRewardActionsResponseDTO>(rewardActionsResponseSchema);
