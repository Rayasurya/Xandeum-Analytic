import React, {
  ForwardedRef,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useCallback,
  useMemo,
} from "react"
import "./index.scss"
import CheckboxCheckedIcon from "../../../assets/icons/CheckboxCheckedIcon"
import { CheckboxUncheckIcon, RadioIcon } from "../../../assets/icons"

type TProps = {
  label?: string
  required?: boolean
  value?: string | number
  isChecked?: boolean
  onChange?: (isChecked: boolean, value: string | number) => void
}

type Ref = HTMLInputElement

const Radio = forwardRef<Ref, TProps>(
  ({ label, value, onChange, isChecked: isPropChecked }, ref) => {
    const [isChecked, setIsChecked] = React.useState(isPropChecked)

    const isCheckedMod = useMemo(() => {
      return isPropChecked ?? isChecked
    }, [isChecked, isPropChecked])

    const handleCheckedValue = useCallback(() => {
      const isCheckedChanged = !isCheckedMod
      setIsChecked(isCheckedChanged)
      onChange?.(isCheckedChanged, value ?? "")
    }, [value, setIsChecked, onChange])

    return (
      <div className="llm-radio-view">
        <label
          onClick={() => {
            handleCheckedValue()
          }}
        >
          <span className="llm-radio-view__checkbox">
            <RadioIcon {...(!isCheckedMod && { fill: "none" })} />
          </span>
          <span className="llm-radio-view__label">{label}</span>
        </label>
        <input key={value} type="radio" value={value} checked={isCheckedMod} />
      </div>
    )
  }
)

export default Radio
