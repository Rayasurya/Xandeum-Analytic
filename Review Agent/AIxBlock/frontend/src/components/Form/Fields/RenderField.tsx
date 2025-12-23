import { memo } from "react";
import Counter from "../../Counter/Counter";
import InputBase from "../../InputBase/InputBase";
import Select, { DataSelect, SelectOption } from "../../Select/Select";
import Switch from "../../Switch/Switch";
import { useFormContext } from "../Context/Context";
import { TField } from "../Form";
import { getError } from "../validateForm";

type RenderFieldProps = {
  field: TField | null;
  onChange: (
    field: TField,
    value: string | boolean | number,
    type: string
  ) => void;
};

const MemoizedRenderFields = ({ field, onChange }: RenderFieldProps) => {
  const {
    type,
    label,
    options,
    value,
    description,
    min,
    placeholder,
    required,
  } = field || {};
  const { formData, formErrors } = useFormContext();

  const PASSWORD_PROTECTED_VALUE = "";

  const getValue = (field: TField | null) => {
    if (!field) return null;

    const { value, options, skipAutofill, type, allowEmpty } = field;
    const isProtected = skipAutofill && !allowEmpty && type === "password";
    const isSelectField = type === "select";
    const fieldName = field.name ?? "";
    const finalValue = typeof formData === "object" && fieldName in formData ? formData[fieldName] : value;
    
    return isProtected
      ? PASSWORD_PROTECTED_VALUE
      : (skipAutofill
          ? null
          : (isSelectField
            ? options?.find((option) => option.value === finalValue)
            : finalValue ?? "")
      );
  };

  const getRequiredField = (field: TField | null) => {
    if (!field) return null;
    const { name, required } = field;
    if (field && required) {
      return name;
    }
  };

  const valueFromField = getValue(field);

  if (field && type) {
    switch (type) {
      case "select":
        const dataSelect = [{ label, options }];
        const selectError = getError(formErrors, field.name ?? "");

        return (
          <Select
            label={label}
            key={`option-${options}`}
            defaultValue={
              valueFromField
                ? (valueFromField as unknown as SelectOption)
                : options?.[0] ?? { value: "", label: "" }
            }
            data={(dataSelect as DataSelect[]) ?? []}
            onChange={(value) => onChange(field, value.value, type)}
            error={selectError}
            disabled={field.disabled}
          />
        );
      case "toggle":
        return (
          <Switch
            key={`option-${field.name}`}
            label={label}
            desc={description}
            checked={formData[field?.name ?? ""]}
            onChange={(isChecked) => onChange(field, isChecked, type)}
            disabled={field.disabled}
          />
        );
      case "counter":
        return (
          <Counter
            defaultValue={value as number}
            min={min}
            label={label}
            onChange={(value) => onChange(field, value, type)}
          />
        );
      default:
        const fieldRequired = getRequiredField(field);
        const error = getError(formErrors, fieldRequired as string);

        return (
          <InputBase
            type={type === "password" ? "password" : "text"}
            label={label}
            placeholder={placeholder}
            value={type !== "select" ? (valueFromField as string) : ""}
            isRequired={required}
            onChange={(e) => onChange(field, e.target.value, type)}
            allowClear={false}
            error={error && error}
            status={error ? "error" : ""}
            onBlur={field.onBlur}
            disabled={field.disabled}
            readonly={field.readonly}
          />
        );
    }
  }

  if (!field) {
    return null;
  }

  return null;
};

const RenderFields = memo(MemoizedRenderFields);

export default RenderFields;
