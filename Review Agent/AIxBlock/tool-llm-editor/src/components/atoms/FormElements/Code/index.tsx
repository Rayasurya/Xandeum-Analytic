import CodeEditor from "@uiw/react-textarea-code-editor"
import React from "react"
import { TFormItemProps } from "../../../../common/types"
import ToolTip from "../../Tooltip"
import "./index.scss"

type TProps = {
  formItem: TFormItemProps
  isPreview?: boolean
}

const FormCodeViewer: React.FC<TProps> = ({ formItem: { options } }) => {
  const { label, showInfo, tooltip, text = ``, required } = options ?? {}
  const language = "tsx"
  return (
    <div className="llm-code-view">
      <div className="llm-code-view__label__content">
        <div className="llm-code-view__label">
          {label ?? ""}
          {required ? <span>*</span> : null}
        </div>
        {showInfo && (
          <div className="llm-code-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <CodeEditor
        value={text}
        language={language}
        {...{ "data-color-mode": "light" }}
      ></CodeEditor>
    </div>
  )
}
export default FormCodeViewer
