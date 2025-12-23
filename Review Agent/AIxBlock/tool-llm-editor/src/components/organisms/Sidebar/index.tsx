import React, { ReactNode } from "react"
import "./index.scss"
import SideBarHeader from "../../molecules/SidebarHeader"

type TProps = {
  text: string
  iconPosition?: "left" | "right"
  children?: ReactNode
}

const SideBar: React.FC<TProps> = ({ text, iconPosition, children }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const handleCollapseAction = () => {
    setIsCollapsed((isCollapsed) => !isCollapsed)
  }
  return (
    <div className={`main-sidebar ${isCollapsed && "collapsed"}`}>
      <SideBarHeader
        text={text}
        iconPosition={iconPosition}
        isCollapsed={isCollapsed}
        onCollapseToggle={handleCollapseAction}
      ></SideBarHeader>
      <div className="main-sidebar__child">{children}</div>
    </div>
  )
}

export default SideBar
