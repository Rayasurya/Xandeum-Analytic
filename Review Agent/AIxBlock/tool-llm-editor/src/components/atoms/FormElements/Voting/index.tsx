import React from "react"
import { DislikeIcon, LikeIcon } from "../../../../assets/icons"
import { TFormItemProps } from "../../../../common/types"
import ToolTip from "../../Tooltip"
import "./index.scss"

type TProps = {
  formItem: TFormItemProps
  isPreview?: boolean
}

const FormVoting: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const { label, showInfo, tooltip, required } = formOptions ?? {}

  const [value, setValue] = React.useState<boolean | undefined>(undefined)
  const handleVotingChange = (liked: boolean) => {
    if (liked === value) {
      setValue(undefined)
    } else {
      setValue(liked)
    }
  }

  return (
    <div className="llm-voting-view">
      <div className="llm-voting-view__label__content">
        <div className="llm-voting-view__label">
          {label}
          {required ? <span>*</span> : null}
        </div>
        {showInfo && (
          <div className="llm-voting-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-voting-view__option">
        <div
          className="llm-voting-view__item"
          onClick={() => handleVotingChange(true)}
        >
          <LikeIcon
            {...(value !== undefined && value && { color: "#27BE69" })}
          />
        </div>
        <div
          className="llm-voting-view__item"
          onClick={() => handleVotingChange(false)}
        >
          <DislikeIcon
            {...(value !== undefined && !value && { color: "#f5222d" })}
          />
        </div>
      </div>
    </div>
  )
}
export default FormVoting
