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

const FormPrimaryButton: React.FC<TProps> = ({
  formItem: { options },
  onClick = () => {},
}) => {
  const { label, showInfo, tooltip, showIcon, icon, showLabel } = options ?? {}
  const Icon = IconList[icon as IconListType] ?? <></>

  return (
    <div className="llm-button-primary-view">
      <div className="llm-button-primary-view__content">
        <Button
          text={showLabel ? label ?? "" : ""}
          type="primary"
          onClick={onClick}
          {...(showIcon && icon && { icon: <Icon /> })}
        />
        {showInfo && (
          <div className="llm-button-primary-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
    </div>
  )
}
export default FormPrimaryButton
