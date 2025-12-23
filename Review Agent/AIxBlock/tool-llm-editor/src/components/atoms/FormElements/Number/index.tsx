import React, { useState } from "react"
import "./index.scss"
import TextInput from "../../TextInput"
import { TFormItemProps } from "../../../../common/types"
import ToolTip from "../../Tooltip"

type TProps = {
  formItem: TFormItemProps
  isPreview?: boolean
}

const FormNumber: React.FC<TProps> = ({ formItem: { options } }) => {
  const { label, showInfo, tooltip, placeholder, min, max, required } =
    options ?? {}
  const [value, setValue] = useState(0)
  const onChange = (
    e?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (
      min !== undefined &&
      max !== undefined &&
      min !== null &&
      max !== null &&
      (Number(e?.target.value) < min || Number(e?.target.value) > max)
    )
      return
    setValue(Number(e?.target.value))
  }
  return (
    <div className="llm-number-view">
      {showInfo && (
        <div className="llm-number-view__info">
          <ToolTip text={tooltip ?? ""} />
        </div>
      )}
      <TextInput
        label={label}
        placeholder={placeholder}
        type="number"
        value={value}
        required={required}
        onChange={onChange}
      />
    </div>
  )
}
export default FormNumber
