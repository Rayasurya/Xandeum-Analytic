import React, { useState } from "react"
import "./index.scss"
import TextInput from "../../TextInput"
import { TFormItemProps } from "../../../../common/types"
import ToolTip from "../../Tooltip"

type TProps = {
  formItem: TFormItemProps
  isPreview?: boolean
}

const FormInput: React.FC<TProps> = ({ formItem: { options } }) => {
  const {
    label,
    showInfo,
    tooltip,
    placeholder,
    required,
    minLength,
    maxLength,
  } = options ?? {}

  const [value, setValue] = useState("")
  const onChange = (
    e?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (
      minLength !== undefined &&
      maxLength !== undefined &&
      minLength !== null &&
      maxLength !== null &&
      e?.target.value &&
      (e?.target.value?.length < minLength ||
        e?.target.value.length > maxLength)
    )
      return
    setValue(e?.target.value ?? "")
  }

  return (
    <div className="llm-textinput-view">
      {showInfo && (
        <div className="llm-textinput-view__info">
          <ToolTip text={tooltip ?? ""} />
        </div>
      )}
      <TextInput
        label={label ?? ""}
        required={required}
        placeholder={placeholder ?? ""}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
export default FormInput
