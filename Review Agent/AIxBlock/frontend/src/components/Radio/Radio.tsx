import React, { ChangeEvent } from "react";
import "./Radio.scss";

type TRadioProps = {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  onChange?: (checked: boolean) => void;
};

const Radio: React.FC<TRadioProps> = ({
  label,
  checked,
  disabled = false,
  size = "sm",
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <div className="c-radio">
      <label className="c-radio__label">
        <input
          type="radio"
          checked={checked}
          disabled={disabled}
          className={`${size ? `size-${size}` : ""}`}
          onChange={handleChange}
        />
        {label}
      </label>
    </div>
  );
};

export default Radio;
