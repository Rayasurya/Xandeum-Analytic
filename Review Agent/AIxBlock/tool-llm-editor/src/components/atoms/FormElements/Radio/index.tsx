import React, { useCallback } from "react"
import "./index.scss"
import { QuestionIcon, RadioIcon } from "../../../../assets/icons"
import ToolTip from "../../Tooltip"
import Radio from "../../Radio"
import { OptionType, TFormItemProps } from "../../../../common/types"
import { keyBy } from "lodash"

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const FormRadio: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const { label, showInfo, tooltip, defaultOptions, options } =
    formOptions ?? {}
  const checkedValues = React.useMemo(
    () => Object.keys(keyBy(defaultOptions ?? [], "value")),
    [defaultOptions]
  )

  return (
    <div className="llm-form-radio-view">
      <div className="llm-form-radio-view__label__content">
        <div className="llm-form-radio-view__label">{label}</div>
        {showInfo && (
          <div className="llm-form-radio-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-form-radio-view__option">
        {(options ?? []).map((option) => (
          <Radio
            isChecked={checkedValues.indexOf(option.value) !== -1}
            label={option.label}
            value={option.value}
          />
        ))}
      </div>
    </div>
  )
}
export default FormRadio
