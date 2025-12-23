import React, { HTMLInputTypeAttribute, ReactNode, forwardRef } from "react"
import "./index.scss"

type TProps = {
  label?: string
  placeholder?: string
  required?: boolean
  multipleLine?: boolean
  numberOfline?: number
  type?: HTMLInputTypeAttribute | undefined
  icon?: ReactNode
  value?: string | number
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

type Ref = HTMLInputElement

const TextInput = forwardRef<Ref, TProps>(
  (
    {
      label,
      placeholder,
      required,
      multipleLine,
      numberOfline,
      type,
      icon,
      value,
      onChange,
    },
    ref
  ) => {
    return (
      <div className="llm-text-input">
        {label ? (
          <label>
            {label}
            {required ? <span>*</span> : null}
          </label>
        ) : null}
        <div className="llm-text-input__container">
          {multipleLine ? (
            <textarea
              placeholder={placeholder}
              {...(numberOfline && {
                style: {
                  height: numberOfline * 38,
                },
              })}
              value={value}
              onChange={onChange}
            ></textarea>
          ) : (
            <input
              ref={ref}
              placeholder={placeholder}
              type={type}
              value={value}
              onChange={onChange}
            ></input>
          )}
          {icon && <div className="llm-text-input__icon">{icon}</div>}
        </div>
      </div>
    )
  }
)

export default TextInput
