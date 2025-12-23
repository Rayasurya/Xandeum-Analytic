import React from "react"
import "./index.scss"
import { TFormItemProps } from "../../../../common/types"
import ToolTip from "../../Tooltip"

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const FormParagraph: React.FC<TProps> = ({ formItem: { options } }) => {
  const { label, showInfo, tooltip, text } = options ?? {}
  return (
    <div className="llm-paragraph-view">
      <div className="llm-paragraph-view__label__content">
        <div className="llm-paragraph-view__label">{label ?? ""}</div>
        {showInfo && (
          <div className="llm-paragraph-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-paragraph-view__paragraph">{text}</div>
    </div>
  )
}
export default FormParagraph
