import React from "react"
import "./index.scss"
import Button from "../../Button"
import { TFormItemProps } from "../../../../common/types"
import ToolTip from "../../Tooltip"
import { IconList, IconListType } from "../../../../assets/icons"

type TProps = {
  formItem: TFormItemProps
  onClick?: () => void
  isPreview?: boolean
}

const FormOutlineButton: React.FC<TProps> = ({
  formItem: { options },
  onClick = () => {},
}) => {
  const { label, showInfo, tooltip, showIcon, icon, showLabel } = options ?? {}
  const Icon = IconList[icon as IconListType] ?? <></>

  return (
    <div className="llm-button-outline-view">
      <div className="llm-button-outline-view__content">
        <Button
          text={showLabel ? label ?? "" : ""}
          type="outline"
          onClick={onClick}
          {...(showIcon && icon && { icon: <Icon /> })}
        />
        {showInfo && (
          <div className="llm-button-outline-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
    </div>
  )
}
export default FormOutlineButton
