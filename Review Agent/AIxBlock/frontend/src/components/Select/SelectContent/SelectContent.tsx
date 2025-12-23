import React, { CSSProperties, ReactElement } from "react";
import Group from "../Group/Index";
import { DataSelect, SelectOption } from "../Select";
// import {highestZIndex} from "@/utils/zIndex";
import InputBase from "../../InputBase/InputBase";

type Ref = React.Ref<HTMLDivElement> | null;

interface IListOptionsProps {
  className: string;
  classNameWidth?: string
  style: CSSProperties;
  slRef: Ref;
  data: DataSelect[];
  isCreatePortal?: boolean;
  onChange: (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    val: SelectOption
  ) => void;
  selectedOptions?: SelectOption[];
	isSelectGroup?: boolean;
	type?: 'checkbox' | 'selectbox',
	customRenderLabel?: (item: SelectOption) => ReactElement
  canFilter?: boolean;
}

export interface SelectedGroup {
  groupName: string;
  value: string;
}

const SelectContent = (props: IListOptionsProps) => {
  const [search, setSearch] = React.useState("");
  const {
    className,
    style,
    slRef,
    data,
    // isCreatePortal,
    selectedOptions,
    onChange,
    isSelectGroup,
    classNameWidth,
		type = 'selectbox',
		customRenderLabel,
    canFilter,
  } = props;
  const onSelectItem = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    item: SelectOption
  ) => {
    if (item.disabled) {
      return;
    }

    onChange(e, item);
    setSearch("");
    // Other action
  };	

  // const isSingleSelectNode =  React.useMemo(() => {
  //   return selectedOptions.value && option.options.length === 0;
  // }, [option]);

	
  const selectedGroup: SelectedGroup | null = React.useMemo(() => {
    if (!selectedOptions || selectedOptions.length === 0) {
      return null;
    }

    const value = selectedOptions[0].value;
    let val: SelectedGroup = { groupName: "", value: "" };

    data.forEach((category) => {
      const selectedOption = category.options.find(
        (option) => option.value === value
      );
      if (selectedOption) {
        val = { groupName: category.label ?? "", value };
      }
    });

    return val;
  }, [selectedOptions, data]);

  const filteredData = React.useMemo(() => {
    const terms = search.toLowerCase();

    const newData = data.map(d => {
      return {
        ...d,
        options: d.options.filter(option => option.label.toLowerCase().includes(terms)),
      };
    });

    return newData.filter(d => d.options.length > 0);
  }, [data, search]);

  return (
    <div
      className={`c-select__list ${classNameWidth ? classNameWidth : ''} ${type}`}
      ref={slRef}
      style={style}
    >
      {canFilter && (
        <InputBase
          isControlledValue={true}
          value={search}
          onChange={e => setSearch(e.target.value.trim())}
          placeholder="Search"
          autoFocus={true}
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        />
      )}
      <ul className={`${className ? className : ""} ${type}`}>
        {filteredData.map((opt, index) => (
          <Group
            key={`group-key${index}-${opt.label}`}
            onSelectItem={onSelectItem}
            option={opt}
            selectedGroup={selectedGroup}
						isSelectGroup={isSelectGroup}
						type={type}
						selectedOptions={selectedOptions}
						customRenderLabel={customRenderLabel}
          />
        ))}
      </ul>
    </div>
  );
};

export default SelectContent;
