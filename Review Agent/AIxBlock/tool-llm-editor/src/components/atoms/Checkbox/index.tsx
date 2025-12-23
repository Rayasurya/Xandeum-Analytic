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
import { CheckboxUncheckIcon } from "../../../assets/icons"

type TProps = {
  label?: string
  required?: boolean
  value?: string | number
  isChecked?: boolean
  onChange?: (isChecked: boolean, value: string | number) => void
}

type Ref = HTMLInputElement

const Checkbox = forwardRef<Ref, TProps>(
  ({ label, value, onChange, isChecked: isPropChecked }, ref) => {
    const [isChecked, setIsChecked] = React.useState(isPropChecked)

    const isCheckedMod = useMemo(() => {
      return isPropChecked ?? isChecked
    }, [isChecked, isPropChecked])

    const handleCheckedValue = useCallback(() => {
      const isCheckedChanged = !isCheckedMod
      setIsChecked(isCheckedChanged)
      onChange?.(isCheckedChanged, value ?? "")
    }, [value, setIsChecked, onChange, isCheckedMod])

    return (
      <div className="llm-checkbox__item">
        <label
          onClick={() => {
            handleCheckedValue()
          }}
        >
          <span className="llm-checkbox__item__checkbox">
            {isCheckedMod ? <CheckboxCheckedIcon /> : <CheckboxUncheckIcon />}
          </span>

          <span className="llm-checkbox__item__label">{label}</span>
        </label>
        <input
          key={value}
          type="checkbox"
          value={value}
					checked={isCheckedMod}
					onChange={()=>{}}
        />
      </div>
    )
  }
)

export default Checkbox
