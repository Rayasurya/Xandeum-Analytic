import React from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { TimeIcon } from "../../../../assets/icons"
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
  const { label, showInfo, tooltip, required } = formOptions ?? {}

  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)

  return (
    <div className="llm-timepicker-view">
      <div className="llm-timepicker-view__label__content">
        <div className="llm-timepicker-view__label">
          {label}
          {required ? <span>*</span> : null}
        </div>
        {showInfo && (
          <div className="llm-timepicker-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-timepicker-view__option">
        <DatePicker
          selected={selectedDate}
          placeholderText="--:--"
          onChange={(value) => {
            setSelectedDate(value)
          }}
          showTimeSelect
          showTimeSelectOnly
          timeFormat="HH:mm"
          dateFormat={"HH:mm"}
          className="llm-timepicker-view__input"
        />
        <div className="llm-timepicker-view__icon">
          <TimeIcon color="#40405B" />
        </div>
      </div>
    </div>
  )
}
export default FormDatePicker
