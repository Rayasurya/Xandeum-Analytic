import React from "react"
import Select, { ActionMeta, MultiValue, SingleValue } from "react-select"
import { IconList, IconListType } from "../../../assets/icons"
import "./index.scss"

export type TSelectOption = {
  label: string
  value: string
}

type TProps = {
  label?: string
  options?: TSelectOption[]
  defaultValue?: TSelectOption[]
  value?: TSelectOption[]
  isMulti?: boolean
  placeholder?: string
  hasIcon?: boolean
  onChange?: (
    newValue: SingleValue<TSelectOption> | MultiValue<TSelectOption>,
    actionMeta?: ActionMeta<TSelectOption>
  ) => void
}

const CustomOption = (props: any) => {
  const { innerRef, innerProps, value, label } = props
  const Icon = IconList[value as IconListType]
  return (
    <div ref={innerRef} {...innerProps} className="select-item">
      <div className="select-item__icon">
        <Icon />
      </div>
      <span>{label}</span>
    </div>
  )
}

const CustomSingleValue = (props: any) => {
  const {
    data: { label, value },
  } = props
  const Icon = IconList[value as IconListType]
  return (
    <div
      className="select-item"
      style={{
        position: "absolute",
        left: "5px",
      }}
    >
      <div className="select-item__icon">
        <Icon />
      </div>
      <span>{label}</span>
    </div>
  )
}

const SelectBase: React.FC<TProps> = ({
  label = "Select",
  options = [
    {
      value: "1",
      label: "1",
    },
    {
      value: "2",
      label: "2",
    },
  ],
  isMulti = false,
  placeholder = "",
  defaultValue = [],
  value,
  hasIcon = false,
  onChange = (_selectedOption) => {},
}) => {
  console.log({ defaultValue })

  return (
    <div className="llm-select-view">
      <div className="llm-select-view__label">{label}</div>
      <Select
        options={options}
        placeholder={placeholder}
        isMulti={isMulti}
        onChange={onChange}
        defaultValue={defaultValue}
        value={value ?? defaultValue}
        className="llm-select-view__option"
        {...(hasIcon
          ? {
              components: {
                Option: CustomOption,
                SingleValue: CustomSingleValue,
                IndicatorSeparator: () => false,
              },
            }
          : {
              components: {
                IndicatorSeparator: () => false,
              },
            })}
      />
    </div>
  )
}
export default SelectBase
