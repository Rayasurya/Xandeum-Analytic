import Ajv, {JSONSchemaType} from "ajv";

const ajv = new Ajv({
  allowUnionTypes: true,
});

export type TAjvValidator<T> = (data: any) => TAjvValidatorResult<T>;

export type TAjvValidatorResult<T> =
  {
    isValid: true,
    errors: null,
    data: T,
  } | {
  isValid: false,
  errors: string,
  data: null,
}

export default function createAjvValidator<T>(schema: JSONSchemaType<T>): TAjvValidator<T> {
  const validate = ajv.compile(schema);

  return function validator(data: any) {
    const isValid = validate(data);

    if (isValid) {
      return {
        isValid: true,
        errors: null,
        data: data,
      }
    }

    return {
      isValid: false,
      errors: ajv.errorsText(validate.errors),
      data: null,
    }
  }
}
