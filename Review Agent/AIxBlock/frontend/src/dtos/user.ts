import { JSONSchemaType } from "ajv";
import createAjvValidator from "../utils/createAjvValidator";
import { userModelSchema, TUserModel } from "../models/user";

export type TUsersResponseDTO = {
  count: number,
  next?: string,
  previous?: string,
  results: TUserModel[]
};

const usersResponseSchema: JSONSchemaType<TUsersResponseDTO> = {
  type: "object",
  properties: {
    count: {type: "integer"},
    next: {type: "string", nullable: true},
    previous: {type: "string", nullable: true},
    results: {type: "array", items: userModelSchema},
  },
  required: [
    "count",
  ],
  additionalProperties: true,
};

export const validateUsersResponse = createAjvValidator<TUsersResponseDTO>(usersResponseSchema);
