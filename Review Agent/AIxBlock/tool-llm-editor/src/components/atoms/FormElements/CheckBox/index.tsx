import { keyBy } from "lodash"
import React from "react"
import { TFormItemProps } from "../../../../common/types"
import Checkbox from "../../Checkbox"
import ToolTip from "../../Tooltip"
import "./index.scss"

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const FormCheckBox: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const { label, showInfo, tooltip, defaultOptions, options } =
    formOptions ?? {}
  const checkedValues = React.useMemo(
    () => Object.keys(keyBy(defaultOptions ?? [], "value")),
    [defaultOptions]
  )

  return (
    <div className="llm-checkbox-view">
      <div className="llm-checkbox-view__label__content">
        <div className="llm-checkbox-view__label">{label}</div>
        {showInfo && (
          <div className="llm-checkbox-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-checkbox-view__option">
        {(options ?? []).map((option) => (
          <Checkbox
            label={option.label}
            isChecked={checkedValues.indexOf(option.value) !== -1}
          />
        ))}
      </div>
    </div>
  )
}
export default FormCheckBox
