import { SetStateAction, useCallback, useEffect, useRef } from "react";
import { useFormContext } from "../Context/Context";
import { TField } from "../Form";
import RenderFields from "./RenderField";

type TFieldsProps = {
  fields: TField[];
};

const PASSWORD_PROTECTED_VALUE = "got ya, suspicious hacker!";

const FormFields = (props: TFieldsProps) => {
  const { fields } = props;
  const { setFormData, setFormErrors } = useFormContext();
  const isMounted = useRef(true);

  const computeUpdatedValue = (
    type: string,
    value: string | boolean | number,
    PASSWORD_PROTECTED_VALUE: string
  ): any => {
    let updatedValue: any = value;

    switch (type) {
      case "select":
        updatedValue = value;
        break;
      case "toggle":
        updatedValue = value === true;
        break;
      case "counter":
        updatedValue = parseInt(value as string, 10);
        break;
      case "password":
        updatedValue =
          value === PASSWORD_PROTECTED_VALUE ? PASSWORD_PROTECTED_VALUE : value;
        break;
      default:
        break;
    }

    return updatedValue;
  };

  const handleFieldChange = useCallback(
    async (field: TField, value: string | boolean | number, type: string) => {
      const updatedValue = computeUpdatedValue(
        type,
        value,
        PASSWORD_PROTECTED_VALUE
      );

      if (["select", "input"].includes(field.type ?? "") && field.setErrorChange?.condition(value)) {
        setFormErrors(field.name ?? "", field.setErrorChange.error);
      } else {
        setFormErrors(field.name ?? "", "");
      }

      if (type === "select") {
        field?.onChange?.(value as SetStateAction<string>);
      }

      if (type === "toggle") {
        field.onChange?.(value ? "true" : "false");
      }

      setFormData((prevData: object) => ({
        ...prevData,
        [field && (field.name as string)]: field.required
          ? {
              name: updatedValue,
              rq: true,
            }
          : updatedValue,
      }));
    },
    [setFormData, setFormErrors]
  );

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <>
      {fields?.map((field) => (
        <div key={`field-${field && field.name}`}>
          <RenderFields field={field} onChange={handleFieldChange} />
          {field?.extraContent}
        </div>
      ))}
    </>
  );
};

export default FormFields;
