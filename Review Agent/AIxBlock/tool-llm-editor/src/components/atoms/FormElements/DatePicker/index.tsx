import React from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { DateIcon } from "../../../../assets/icons"
import { TFormItemProps } from "../../../../common/types"
import ToolTip from "../../Tooltip"
import "./index.scss"

type TProps = {
  formItem: TFormItemProps
  isPreview?: boolean
}

const FormDatePicker: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const { label, showInfo, tooltip, includeTime, required } = formOptions ?? {}
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)

  return (
    <div className="llm-datepicker-view">
      <div className="llm-datepicker-view__label__content">
        <div className="llm-datepicker-view__label">
          {label}
          {required ? <span>*</span> : null}
        </div>
        {showInfo && (
          <div className="llm-datepicker-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-datepicker-view__option">
        <DatePicker
          selected={selectedDate}
          dateFormat={includeTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
          placeholderText={includeTime ? "dd/mm/yyyy HH:mm" : "dd/mm/yyyy"}
          {...(includeTime && { showTimeInput: includeTime ?? false })}
          onChange={(value) => {
            setSelectedDate(value)
          }}
          className="llm-datepicker-view__input"
        />
        <div className="llm-datepicker-view__icon">
          <DateIcon color="#40405B" />
        </div>
      </div>
    </div>
  )
}
export default FormDatePicker
