import React, { CSSProperties, HtmlHTMLAttributes, ReactNode } from "react"
import "./index.scss"

type TProps = {
  text: string
  className?: string
  icon?: ReactNode 
  type?: "primary" | "outline"
  style?: CSSProperties
  onClick?: () => void
}

const Button: React.FC<TProps> = ({
  icon,
  className,
  text,
  type = "primary",
  style,
  onClick,
}) => {
  const buttonStyle: React.CSSProperties = {
    ...style,
  }
	
  return (
    <div className={`llm-button ${type} ${className}`} style={buttonStyle} onClick={onClick}>
      {icon ?? ""}
      <span>{text}</span>
    </div>
  )
}

export default Button
