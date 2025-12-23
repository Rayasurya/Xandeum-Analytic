import React from "react"
import "./index.scss"
import { SideExpandIcon } from "../../../assets/icons"

type TProps = {
  text: string
  iconPosition?: "left" | "right"
  isCollapsed?: boolean
  onCollapseToggle?: () => void
}

const SideBarHeader: React.FC<TProps> = ({
  text,
  iconPosition = "right",
  isCollapsed = false,
  onCollapseToggle = () => {},
}) => {
  return (
    <div
      className={`sidebar-header ${isCollapsed && "collapsed"}`}
      {...(isCollapsed && { onClick: onCollapseToggle })}
    >
      {iconPosition === "left" && (
        <div
          className="sidebar-header__expand-button left"
          onClick={onCollapseToggle}
        >
          <SideExpandIcon />
        </div>
      )}
			<span className="sidebar-header__text">{text}</span>
      {iconPosition === "right" && (
        <div
          className="sidebar-header__expand-button right"
          onClick={onCollapseToggle}
        >
          <SideExpandIcon />
        </div>
      )}
    </div>
  )
}

export default SideBarHeader
