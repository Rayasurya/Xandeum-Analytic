import React, { ChangeEvent, useMemo, useState } from "react";
import "./RadioGroup.scss";
import { CSSProperties } from "styled-components";

type TOption = {
  label: string;
  value: string | number;
};

type TRadioGroupProps = {
  className?: string;
  fieldName?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  status?: "" | "error" | "warning" | "success";
  style?: CSSProperties;
  value?: string | undefined;
  isRequired?: boolean;
  error?: string | null;
  onChange?: (value: string | number) => void;
  readonly?: boolean;
  options: TOption[];
};

const RadioGroup: React.FC<TRadioGroupProps> = ({
  className,
  fieldName,
  label,
  disabled,
  status = "",
  style,
  value,
  isRequired = false,
  error,
  onChange,
  readonly = false,
  options,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | number>(() => {
    return value ? value : "";
  });

  const inputStyle: React.CSSProperties = {
    ...style,
  };

  useMemo(() => {
    if (value?.length || value?.length === 0) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleInputChange = (option: TOption) => {
    setSelectedValue(option.value);
    onChange?.(option.value);
  };

  const classes = useMemo(() => {
    const list = ["c-radio-group-base__field"];

    if (fieldName) {
      list.push("c-radio-group-base__field-" + fieldName);
    }

    if (error) {
      list.push("c-radio-group-base--error");
    } else if (status) {
      list.push("c-radio-group-base--" + status);
    }

    if (disabled) {
      list.push("disabled");
    }

    if (className) {
      list.push(className);
    }

    return list;
  }, [error, className, fieldName, status, disabled]);

  return (
    <div className={classes.join(" ")}>
      {label && (
        <label className="c-radio-group-base__label">
          <span>{label}</span>{" "}
          {isRequired && <span className="required">*</span>}
        </label>
      )}
      <div className="c-radio-group-base__control">
        {options.map((option) => (
          <button
            key={`radio_${option.value}`}
            {...(selectedValue === option.value && { className: "active" })}
            onClick={() => {
              handleInputChange(option);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && <span className="c-radio-group-base__error">{error}</span>}
    </div>
  );
};

export default RadioGroup;
