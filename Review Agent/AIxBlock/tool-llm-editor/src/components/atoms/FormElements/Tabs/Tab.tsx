import React from "react"
import "./index.scss"
import { TabItemProps } from "./types" // Import types
import { CloseIcon } from "../../../../assets/icons"

const Tab: React.FC<TabItemProps> = ({
  label,
  index,
  isActive,
  onClick,
  onRemove,
  isPreview = false,
}) => {
  return (
    <li className={`llm-tabs-view__nav__item ${isActive ? "active" : ""} ${isPreview ? "preview" : ""}`}>
      <div
        className="llm-tabs-view__nav__item__label"
        onClick={() => onClick(index)}
      >
        {label}
      </div>
      {!isPreview && (
        <div className="llm-tabs-view__nav__item__remove" onClick={onRemove}>
          <CloseIcon />
        </div>
      )}
    </li>
  )
}

export default Tab
