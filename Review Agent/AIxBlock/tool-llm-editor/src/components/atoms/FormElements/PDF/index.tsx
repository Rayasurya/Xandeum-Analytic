import React from "react"
import ToolTip from "../../Tooltip"
import "./index.scss"
import { TFormItemProps } from "../../../../common/types"

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const PDFView: React.FC<TProps> = ({ formItem: { options: formOptions } }) => {
  const { label, showInfo, tooltip, url, height } = formOptions ?? {}
  //https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
  return (
    <div className="llm-pdf-view">
      <div className="llm-pdf-view__label__content">
        <div className="llm-pdf-view__label">{label}</div>
        {showInfo && (
          <div className="llm-pdf-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-pdf-view__viewer">
        {!url ? (
          <span className="llm-pdf-view__viewer__placeholder">
            Provide a Source URL in the component's properties to see the PDF
            here
          </span>
        ) : (
          // <embed src={ url}></embed>
          <iframe
            style={{ height: `${height}px` }}
            src={`https://docs.google.com/gview?url=${url}&embedded=true`}
          ></iframe>
        )}
      </div>
    </div>
  )
}
export default PDFView
