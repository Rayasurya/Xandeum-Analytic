import React from "react"
import "./index.scss"
import { ImageHolderIcon, QuestionIcon } from "../../../../assets/icons"
import ToolTip from "../../Tooltip"
import { TFormItemProps } from "../../../../common/types"

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const FormImage: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const { label, showInfo, tooltip, url, alt } = formOptions ?? {}

  return (
    <div className="llm-image-view">
      <div className="llm-image-view__label__content">
        <div className="llm-image-view__label">{label}</div>
        {showInfo && (
          <div className="llm-timepicker-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-image-view__image">
        {!url ? (
          <div className="llm-image-view__image-placeholder">
            <ImageHolderIcon />
          </div>
        ) : (
          <img src={url} alt={alt}></img>
        )}
      </div>
    </div>
  )
}
export default FormImage
