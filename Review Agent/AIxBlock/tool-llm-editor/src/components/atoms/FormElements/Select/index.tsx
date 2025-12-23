import React from "react"
import { TFormItemProps } from "../../../../common/types"
import ToolTip from "../../Tooltip"
import "./index.scss"
import Select from "../../Select"

export type TSelectOption = {
  label: string
  value: string
}

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const FormSelect: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const {
    label,
    showInfo,
    tooltip,
    placeholder,
    defaultOptions,
    optionType,
    options,
	} = formOptions ?? {}
	
  return (
    <div className="llm-formselect-view">
      {showInfo && (
        <div className="llm-formselect-view__info">
          <ToolTip text={tooltip ?? ""} />
        </div>
      )}
      <Select
        label={label ?? ""}
        placeholder={placeholder}
        isMulti={optionType === "multiple"}
        defaultValue={defaultOptions}
        options={options}
      />
    </div>
  )
}
export default FormSelect
