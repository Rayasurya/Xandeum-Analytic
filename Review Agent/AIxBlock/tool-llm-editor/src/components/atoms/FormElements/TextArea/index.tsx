import React, { useState } from "react"
import "./index.scss"
import TextInput from "../../TextInput"
import { TFormItemProps } from "../../../../common/types"
import ToolTip from "../../Tooltip"

type TProps = {
  formItem: TFormItemProps
  isPreview?: boolean
}

const FormTextArea: React.FC<TProps> = ({ formItem: { options } }) => {
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
    <div className="llm-textarea-view">
      {showInfo && (
        <div className="llm-textarea-view__info">
          <ToolTip text={tooltip ?? ""} />
        </div>
      )}
      <TextInput
        label={label ?? ""}
        placeholder={placeholder ?? ""}
        multipleLine={true}
        numberOfline={3}
				required={required}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
export default FormTextArea
