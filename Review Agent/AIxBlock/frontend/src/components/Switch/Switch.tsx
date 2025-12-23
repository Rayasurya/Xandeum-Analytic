import React from "react";
import "./Switch.scss";
import Spin from "../Spin/Spin";

type SwitchProps = {
  onChange?: (isChecked: boolean) => void;
  checked?: boolean | undefined;
  size?: "small" | "medium" | "large";
  label?: string;
  desc?: string;
  disabled?: boolean;
  processing?: boolean;
};

const Switch: React.FC<SwitchProps> = ({
  onChange,
  checked = false,
  size = "small",
  label,
  desc,
  disabled = false,
  processing = false,
}) => {
	
	const handleToggle = (e: any) => {
		e.stopPropagation();
		e.preventDefault();

    if (disabled || processing) {
      return;
    }

    onChange?.(!checked);
  };
  
  return (
    <div className="c-switch__wrapper" style={disabled ? {opacity: 0.25} : {}} onClick={handleToggle}>
			<label className={`c-switch ${size}`}>
        {
          processing
            ? <Spin loading={true} />
            : (
              <>
                <input type="checkbox" checked={checked} onChange={() => void 0}/>
                <span className="slider round"></span>
              </>
            )
        }
      </label>
      <div className="c-switch__content">
      {label && <span className="c-switch__title">{label}</span>}
        {desc && <span className="c-switch__desc">{desc}</span>}
      </div>
    </div>
  );
};

export default Switch;
