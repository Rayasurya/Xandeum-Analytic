import React, { forwardRef, useCallback, useMemo } from "react"
import "./index.scss"

type TProps = {
  label?: string
  required?: boolean
  value?: string | number
  isChecked?: boolean
  onChange?: (isChecked: boolean, value: string | number) => void
}

type Ref = HTMLInputElement

const Switch = forwardRef<Ref, TProps>(
  ({ label, value, onChange, isChecked: isPropChecked }, ref) => {
    const [isChecked, setIsChecked] = React.useState(isPropChecked)

    const handleCheckedValue = useCallback(() => {
      const isCheckedChanged = !isChecked
      setIsChecked(isCheckedChanged)
      onChange?.(isCheckedChanged, value ?? "")
    }, [value, isChecked, setIsChecked, onChange])

    const isCheckedMod = useMemo(() => {
      return isPropChecked ?? isChecked
    }, [isChecked, isPropChecked])

    return (
      <div className="llm-switch__item">
        <span className="llm-switch__item__switch">
          <input
            key={value}
            type="checkbox"
            value={value}
            checked={isCheckedMod}
          />
          <label
            className="llm-switch__item__helper"
            onClick={() => {
              handleCheckedValue()
            }}
          ></label>
        </span>
        <div className="llm-switch__item__label">{label}</div>
      </div>
    )
  }
)

export default Switch
