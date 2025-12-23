// import IconChecked from "@/assets/icons/IconChecked";
import {
  IconLineSubMenu,
  IconLineSubMenuLast,
} from "@/assets/icons/IconSubMenu";
import Checkbox from "../../Checkbox/Checkbox";
import { SelectOption } from "../Select";
import { SelectedGroup } from "../SelectContent/SelectContent";
import React, { ReactElement } from "react";

interface IOptionProps {
  onSelectItem: (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    val: SelectOption
  ) => void;
  options: SelectOption[];
  selectedGroup: SelectedGroup | null;
	isSelectGroup?: boolean;
	type?: 'checkbox' | 'selectbox',
	selectedOptions?: SelectOption[];
	customRenderLabel?: (item: SelectOption) => ReactElement
}

const Option = (props: IOptionProps) => {
  return (
    <div className="c-select__group-content">
			{props.options.map((item, index) => {
				const isChecked =
					props.selectedOptions?.findIndex((o) => o.value === item.value) !== -1;
				
        return (
          <li
            onClick={(e) => props.onSelectItem(e, item)}
            className={`c-select__item ${
              index === props.options.length ? "last" : ""
            } ${
              props.selectedGroup?.value === item.value
                ? "c-select__item--selected"
                : ""
            } ${props.type === "checkbox" ? "c-select__item--checkbox" : ""} ${
              props.type === "checkbox" && isChecked
                ? "c-select__item--checked"
                : ""
            }`}
            key={`option-key-${index}-${item.label}`}
          >
            {props.isSelectGroup &&
              (index !== props.options.length - 1 ? (
                <IconLineSubMenu />
              ) : (
                <IconLineSubMenuLast />
              ))}
            {props.type === "checkbox" && (
              <Checkbox label="" checked={isChecked} />
            )}
            {props.customRenderLabel
              ? props.customRenderLabel(item)
              : item.label && (
                  <p className="c-select__item-value">{item.label}</p>
                )}
          </li>
        );
      })}
    </div>
  );
};

export default Option;
