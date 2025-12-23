import React from "react"
import ToolTip from "../../Tooltip"
import "./index.scss"
import { TFormItemProps } from "../../../../common/types"

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const FormDivider: React.FC<TProps> = ({ formItem: { options } }) => {
	const { label, showInfo, tooltip } = options ?? {}
  return (
    <div className="llm-divider-view">
      <div className="llm-divider-view__label__content">
        <div className="llm-divider-view__label">{label ?? ""}</div>
        {showInfo && (
          <div className="llm-divider-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
    </div>
  )
}
export default FormDivider
