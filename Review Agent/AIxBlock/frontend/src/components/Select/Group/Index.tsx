import { ReactElement, memo, useMemo, useState } from "react";
import IconArrowLeft from "@/assets/icons/IconArrowLeft";
import { DataSelect, SelectOption } from "../Select";
import { SelectedGroup } from "../SelectContent/SelectContent";
import Option from "../Option/Index";

interface IGroupProps {
  onSelectItem: (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    val: SelectOption
  ) => void;
  option: DataSelect;
  selectedGroup: SelectedGroup | null;
  isSelectGroup?: boolean;
	type?: 'checkbox' | 'selectbox'
  selectedOptions?: SelectOption[];
	customRenderLabel?: (item: SelectOption) => ReactElement
}

const MemoizedGroup = (props: IGroupProps) => {
  const { option, selectedGroup, isSelectGroup, onSelectItem, type = 'selectbox', selectedOptions, customRenderLabel } = props;
  const [isShowOptionGroup, setShowOptionGroup] = useState<boolean>(false);

  const isSingleSelectNode = useMemo(() => {
    return option.value && option.options.length === 0;
  }, [option]);

  const onToggleGroup = () => {
    setShowOptionGroup((prev) => !prev);
  };

  return (
    <div
      className={`c-select__group ${
        isShowOptionGroup || selectedGroup?.groupName === option.label
          ? "active"
          : ""
      }`}
    >
      {option.label && isSelectGroup && (
        <span
          className="c-select__group-label"
          onClick={(e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
            isSingleSelectNode
              ? onSelectItem(e, {
                  label: option.label ?? "",
                  value: option.value ?? "",
                  data: option.data,
                })
              : onToggleGroup();
          }}
        >
          {option.label}
          {!isSingleSelectNode && <IconArrowLeft />}
        </span>
      )}
      {!isSelectGroup && !isSingleSelectNode && (
        <Option
          onSelectItem={onSelectItem}
          options={option.options}
					selectedGroup={selectedGroup}
					type={type}
					selectedOptions={selectedOptions}
					customRenderLabel={customRenderLabel}
        />
      )}
      {isSelectGroup && isShowOptionGroup && !isSingleSelectNode && (
        <Option
          onSelectItem={onSelectItem}
          options={option.options}
          selectedGroup={selectedGroup}
          isSelectGroup
					type={type}
					selectedOptions={selectedOptions}
					customRenderLabel={customRenderLabel}
        />
      )}
    </div>
  );
};

const Group = memo(MemoizedGroup);

export default Group;
