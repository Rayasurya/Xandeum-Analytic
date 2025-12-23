import React, { CSSProperties, HtmlHTMLAttributes, ReactNode } from "react"
import "./index.scss"
import { QuestionIcon } from "../../../assets/icons"

type TProps = {
  text: string
  icon?: ReactNode
}

const ToolTip: React.FC<TProps> = ({ icon, text }) => {
  const [show, setShow] = React.useState(false)
  React.useEffect(() => {
    return () => {}
  }, [])

  const onMouseIn = () => {
    setShow(true)
  }
  const onMouseOut = () => {
    setShow(false)
  }

  return (
    <div className={"llm-tooltip"}>
      <div
        className={"llm-tooltip__icon"}
        onMouseOver={onMouseIn}
        onMouseLeave={onMouseOut}
      >
        {icon ?? <QuestionIcon />}
      </div>
      {show && <div className={"llm-tooltip__content"}>{text}</div>}
    </div>
  )
}

export default ToolTip
