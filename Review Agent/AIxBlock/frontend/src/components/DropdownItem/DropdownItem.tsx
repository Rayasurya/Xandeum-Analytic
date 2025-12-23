import React from "react";
import "./DropdownItem.scss";

export type TDropdownItem = {
  label: React.ReactNode;
  id?: string | number;
  disabled?: boolean;
  checked?: boolean;
  className?: string;
  handler: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
};

type TDropdownItemProps = {
  data: TDropdownItem[];
  isCheckbox?: boolean;
};

const MemoizedDropdownItem: React.FC<TDropdownItemProps> = (props) => {
  const { data, isCheckbox } = props;
  if (!data || !Array.isArray(data)) {
    return null;
  }

  return (
    <>
      {data.map((item, index) => {
        const { id, label, checked, className = "", disabled, handler } = item;

        return (
          <li
            className={`c-dropdown-item ${
              item.disabled ? "c-dropdown-item__disabled" : ""
            } ${className}`}
            key={id ?? `dropdownitem-${index}`}
            onClick={disabled ? undefined : handler}
          >
            {isCheckbox && (
              <input type="checkbox" checked={checked} disabled={disabled} />
            )}
            <button disabled={disabled}>{label}</button>
          </li>
        );
      })}
    </>
  );
};

const DropdownItem = React.memo(MemoizedDropdownItem);

export default DropdownItem;
