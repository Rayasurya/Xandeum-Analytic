import React from "react"
import "./index.scss"
import { QuestionIcon, RatingIcon, VotingIcon } from "../../../../assets/icons"
import ToolTip from "../../Tooltip"
import { TFormItemProps } from "../../../../common/types"

type TProps = {
  formItem: TFormItemProps
  isPreview?: boolean
}

const FormRating: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const { label, showInfo, tooltip, numberOfStar, required } = formOptions ?? {}

  const [value, setValue] = React.useState(0)
  const handleRatingChange = (star: number) => {
    if (star === value) {
      setValue(0)
    } else {
      setValue(star)
    }
  }

  return (
    <div className="llm-rating-view">
      <div className="llm-rating-view__label__content">
        <div className="llm-rating-view__label">
          {label}
          {required ? <span>*</span> : null}
        </div>
        {showInfo && (
          <div className="llm-rating-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-rating-view__option">
        {Array.from(Array(numberOfStar).keys()).map((star) => (
          <div
            key={`star-${star}`}
            className="llm-rating-view__star"
            onClick={() => {
              handleRatingChange(star + 1)
            }}
          >
            <RatingIcon
              color={"#FFBF0F"}
              fill={star < value ? "#FFBF0F" : "none"}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
export default FormRating
