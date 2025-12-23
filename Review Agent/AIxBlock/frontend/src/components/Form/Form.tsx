import {ReactNode, SetStateAction, useEffect, useMemo} from "react";
import { TCreateStorage } from "@/hooks/settings/cloudStorage/useCreateStorage";
import { SelectOption } from "../Select/Select";
import FormColumns from "./Columns/Columns";
import { FormProvider, useFormContext } from "./Context/Context";
import FormFields from "./Fields/Fields";
import "./Form.scss";
import FormRow from "./Row/Row";
import { getDataStorage } from "./utils";
import {createAlert} from "@/utils/createAlert";

type Ref = React.Ref<HTMLDivElement> | null;

export type TField = {
  type?: string;
  name?: string;
  label?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  skipAutofill?: boolean;
  allowEmpty?: boolean;
  dependency?: string;
  value?: number | string;
  min?: number;
  validators?: string[];
  options?: SelectOption[];
  onChange?: (value: SetStateAction<string>) => void;
  onBlur?: (e: any) => void;
  disabled?: boolean;
  readonly?: boolean;
  setErrorChange?: { error: string, condition: any };
  extraContent?: React.ReactNode;
};

export type TColumns = {
  fields?: TField[];
  width?: number;
};

export type TFields = {
  columnCount: number;
  fields?: TField[];
  columns?: TColumns[];
};

export type TFormProps = {
  formRef?: Ref;
  children?: ReactNode;
  className?: string;
  autoComplete?: string | undefined;
  autoSave?: string | undefined;
  fields?: TFields[];
  onSubmit?: (formData: TCreateStorage | Record<string, any>) => void;
  onChange?: () => void;
  error?: string | undefined | null;
};

const Form = ({ children, className, fields, onSubmit, error }: TFormProps) => {
  const { formData, setFormData, setFormErrors, clearFormErrors } = useFormContext();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearFormErrors();
    let hasError = false;

    Object.keys(formData).forEach(fieldName => {
      const fieldValue = formData[fieldName];
      // const fieldInFields = fields?.flatMap(field => field.fields ?? []).find(field => field?.name === fieldName);
      // if (typeof fieldValue === 'object' && Object.hasOwnProperty.call(fieldValue, 'name') && fieldInFields) {
      //   formData[fieldName].name = fieldInFields.value;
      // }
      if (typeof fieldValue !== "object"
        || !Object.hasOwn(fieldValue, "name")
        || !Object.hasOwn(fieldValue, "rq")
        || typeof fieldValue["name"] !== "string"
        || !fieldValue["rq"]
        || String(fieldValue["name"]).trim().length > 0
      ) {
        return false;
      }

      setFormErrors(fieldName, `Field ${fieldName.replaceAll("_", " ")} is required`);
      hasError = true;
    });

    if (hasError || !onSubmit) {
      return false;
    }

    onSubmit(formData);
    return false;

    // const errors = validateForm(formData, setFormErrors);
    //
    // if (errors.isValid && onSubmit) {
    //   onSubmit(formData);
    // }
  };

  useEffect(() => {
    if (fields) {
      const data = getDataStorage(fields);
      if (data) {
        setFormData(data);
      }
    }
  }, [fields, setFormData]);

  const errorNode = useMemo(() => {
    return createAlert(error);
  }, [error])

  return (
    <form
      className={`c-form ${className ? className : ""}`}
      onSubmit={handleSubmit}
    >
      {errorNode}
      {fields?.map(({ columnCount, fields, columns }, index) => (
        <FormRow key={`row-${index}`} columnCount={columnCount} gap={10}>
          {columns ? (
            <FormColumns columns={columns} />
          ) : (
            <FormFields fields={fields ?? []} />
          )}
        </FormRow>
      ))}
      {children}
    </form>
  );
};

export const FormBuilder = (props: TFormProps) => {
  const { children, fields, onSubmit, ...otherProps } = props;
  return (
    <FormProvider>
      <div className="c-form__wrapper">
        <Form fields={fields} onSubmit={onSubmit} {...otherProps}>
          {children}
        </Form>
      </div>
    </FormProvider>
  );
};

export default FormBuilder;
