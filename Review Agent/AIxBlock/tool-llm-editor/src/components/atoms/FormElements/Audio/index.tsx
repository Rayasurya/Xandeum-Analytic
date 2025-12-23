import React from "react"
import "./index.scss"
import ToolTip from "../../Tooltip"
import { TFormItemProps } from "../../../../common/types"

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const AudioPlayer: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const { label, showInfo, tooltip, url } = formOptions ?? {}
  //"https://www.w3schools.com/html/horse.ogg",
  return (
    <div className="llm-audio-view">
      <div className="llm-audio-view__label__content">
        <div className="llm-audio-view__label">{label}</div>
        {showInfo && (
          <div className="llm-audio-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-audio-view__audio">
        <audio controls src={url} />
      </div>
    </div>
  )
}
export default AudioPlayer
