import React, { ReactNode } from "react"
import "./index.scss"

type TProps = {
  text: string
  icon: ReactNode
  onClick: () => void
}

const ToolBoxItem: React.FC<TProps> = ({ text, icon, onClick }) => {
  return (
    <div className="toolbox-item" onClick={onClick}>
      <div className="toolbox-item__icon">{icon}</div>
      <div className="toolbox-item__text">{text}</div>
    </div>
  )
}

export default ToolBoxItem
