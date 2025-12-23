import React from "react"
import AvatarHolder from "../../../../assets/images/AvatarHolder"
import ToolTip from "../../Tooltip"
import "./index.scss"
import { TFormItemProps } from "../../../../common/types"

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const FormAvatar: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const { label, showInfo, tooltip, url, alt } = formOptions ?? {}

  return (
    <div className="llm-avatar-view">
      <div className="llm-avatar-view__label__content">
        <div className="llm-avatar-view__label">{label}</div>
        {showInfo && (
          <div className="llm-avatar-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-avatar-view__image">
        {url ? <img src={url} alt={alt} /> : <AvatarHolder />}
      </div>
    </div>
  )
}
export default FormAvatar
