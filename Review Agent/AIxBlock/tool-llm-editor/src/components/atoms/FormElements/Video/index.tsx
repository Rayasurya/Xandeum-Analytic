import React from "react"
import ToolTip from "../../Tooltip"
import "./index.scss"
import { TFormItemProps } from "../../../../common/types"

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const VideoPlayer: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const { label, showInfo, tooltip, url } = formOptions ?? {}
  //https://www.w3schools.com/html/mov_bbb.mp4
  return (
    <div className="llm-video-view">
      <div className="llm-video-view__label__content">
        <div className="llm-video-view__label">{label}</div>
        {showInfo && (
          <div className="llm-video-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-video-view__video">
        <video controls src={url} />
      </div>
    </div>
  )
}
export default VideoPlayer
