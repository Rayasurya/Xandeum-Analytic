import React, { ChangeEvent } from "react";
import "./Checkbox.scss";

type TCheckboxProps = {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  onChange?: (checked: boolean) => void;
  fieldName?: string;
};

const Checkbox: React.FC<TCheckboxProps> = ({
  fieldName,
  label,
  checked,
  disabled = false,
  size = "lg",
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <div className="c-checkbox">
      <label className="c-checkbox__label">
        <input
          name={fieldName}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className={`${size ? `size-${size}` : ""}`}
        />
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
