import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TLoginDTO = {
  email: string,
  password: string,
  csrfmiddlewaretoken: string,
}

export type TSignupDTO = {
  first_name: string,
  email: string,
  password: string,
  role: number,
  csrfmiddlewaretoken: string,
}

export type TLoginResponseDTO = {
  status: number,
  redirect: string,
}

export type TResetPasswordDTO = {
  email: string,
  csrfmiddlewaretoken: string,
}

export type TUpdateResetPasswordDTO = {
  password: string,
  uidb64: string,
  token: string,
  csrfmiddlewaretoken: string,
}


const loginResponseSchema: JSONSchemaType<TLoginResponseDTO> = {
  type: "object",
  properties: {
    status: {type: "number"},
    redirect: {type: "string", minLength: 1},
  },
  required: ["status", "redirect"],
  additionalProperties: false,
}

export const validateLoginResponse = createAjvValidator<TLoginResponseDTO>(loginResponseSchema);
