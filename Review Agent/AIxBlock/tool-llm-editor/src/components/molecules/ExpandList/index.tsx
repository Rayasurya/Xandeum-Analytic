import React, { ReactNode } from "react"
import "./index.scss"
import { ArrowDownIcon } from "../../../assets/icons"

type TProps = {
  headerText: string
  iconPosition?: "left" | "right"
  isCollapsed?: boolean
  onCollapseToggle?: () => void
  children?: ReactNode
}

const ExpandList: React.FC<TProps> = ({
  headerText,
  isCollapsed: defaultCollapsed = true,
  onCollapseToggle = () => {},
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  return (
    <div className={`expand-box ${isCollapsed && "collapsed"}`}>
      <div className="expand-box__header">
        {headerText}
        <div
          className="expand-box__button"
          onClick={() => {
            setIsCollapsed((isCollapsed) => !isCollapsed)
          }}
        >
          <ArrowDownIcon />
        </div>
      </div>
      <div className="expand-box__content">{children}</div>
    </div>
  )
}

export default ExpandList
