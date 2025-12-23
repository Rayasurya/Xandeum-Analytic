import React, { useCallback, useMemo } from "react"
import { TFormItemProps } from "../../../../../common/types"
import Switch from "../../../../atoms/Switch"
import TextInput from "../../../../atoms/TextInput"
import "./index.scss"
import Checkbox from "../../../../atoms/Checkbox"
import Radio from "../../../../atoms/Radio"
import { RatingIcon } from "../../../../../assets/icons"

type TProps = {
  currentItem: TFormItemProps
  onUpdateProps: (newData: TFormItemProps) => void
}
const CommonProperties: React.FC<TProps> = ({ currentItem, onUpdateProps }) => {
  const commonData = useMemo<TFormItemProps | undefined>(() => {
    if (currentItem && currentItem.type) {
      return currentItem
    }
    return undefined
  }, [currentItem])

  const onUpdate = useCallback(
    (field: string, value: string | boolean | number) => {
      onUpdateProps({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            [field]: value,
          },
        },
      })
    },
    [commonData, currentItem]
  )

  return (
    <div className="llm-properties-common">
      <TextInput
        label="Label"
        required={commonData?.options?.idLabelRequired}
        value={commonData?.options?.label}
        onChange={(e) => {
          onUpdate("label", e.target.value)
        }}
      />
      <Switch
        label={"Add info icon"}
        isChecked={commonData?.options?.showInfo}
        onChange={(isChecked) => {
          onUpdate("showInfo", isChecked)
        }}
      />
      {commonData?.options?.showInfo && (
        <TextInput
          label="Info text"
          required={true}
          multipleLine={true}
          value={commonData?.options?.tooltip}
          onChange={(e) => {
            onUpdate("tooltip", e.target.value)
          }}
        />
      )}
      {(commonData?.type === "text_input" ||
        commonData?.type === "text_area") && (
        <TextInput
          label="Placelholder"
          value={commonData?.options?.placeholder}
          onChange={(e) => {
            onUpdate("placeholder", e.target.value)
          }}
        />
      )}
      {commonData?.type === "paragraph" && (
        <TextInput
          label="Text"
          value={commonData?.options?.text}
          onChange={(e) => {
            onUpdate("text", e.target.value)
          }}
        />
      )}
      {(commonData?.type === "text_input" ||
        commonData?.type === "text_area") && (
        <div className="llm-properties-common__input-group">
          <TextInput
            label="Min Length"
            type="number"
            value={commonData?.options?.minLength}
            onChange={(e) => {
              onUpdate("minLength", e.target.value)
            }}
          />
          <TextInput
            label="Max Length"
            type="number"
            value={commonData?.options?.maxLength}
            onChange={(e) => {
              onUpdate("maxLength", e.target.value)
            }}
          />
        </div>
      )}
      {(commonData?.type === "number" || commonData?.type === "slider") && (
        <div className="llm-properties-common__input-group">
          <TextInput
            label="Min"
            type="number"
            value={commonData?.options?.min}
            onChange={(e) => {
              onUpdate("min", e.target.value)
            }}
          />
          <TextInput
            label="Max"
            type="number"
            value={commonData?.options?.max}
            onChange={(e) => {
              onUpdate("max", e.target.value)
            }}
          />
        </div>
      )}
      {(commonData?.type === "number" || commonData?.type === "slider") && (
        <div className="llm-properties-common__input-group">
          <TextInput
            label="Step"
            type="number"
            required={true}
            value={commonData?.options?.step}
            onChange={(e) => {
              onUpdate("step", e.target.value == "" ? 1 : e.target.value)
            }}
          />
          {commonData?.type === "slider" ? (
            <div className="llm-properties-common__item">
              <div className="llm-properties-common__item__label">Suffix</div>
              <div className="llm-properties-common__suffix-box">
                <div
                  className={`llm-properties-common__suffix-box__btn ${
                    commonData?.options.suffix === "-" && "active"
                  }`}
                  onClick={() => onUpdate("suffix", "-")}
                >
                  <span>-</span>
                </div>
                <div
                  className={`llm-properties-common__suffix-box__btn ${
                    commonData?.options.suffix === "#" && "active"
                  }`}
                  onClick={() => onUpdate("suffix", "#")}
                >
                  <span>#</span>
                </div>
                <div
                  className={`llm-properties-common__suffix-box__btn ${
                    commonData?.options.suffix === "%" && "active"
                  }`}
                  onClick={() => onUpdate("suffix", "%")}
                >
                  <span>%</span>
                </div>
                <div
                  className={`llm-properties-common__suffix-box__btn ${
                    commonData?.options.suffix === "$" && "active"
                  }`}
                  onClick={() => onUpdate("suffix", "$")}
                >
                  <span>$</span>
                </div>
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      )}
      {commonData?.type === "rating" && (
        <div className="llm-properties-common__item">
          <div className="llm-properties-common__item__label">
            Number of stars
          </div>
          <div className="llm-properties-common__suffix-box">
            {Array.from(Array(8).keys()).map((star) => (
              <div
                className={`llm-properties-common__suffix-box__btn ${
                  commonData?.options.numberOfStar === star + 3 && "active"
                }`}
                onClick={() => onUpdate("numberOfStar", star + 3)}
              >
                <span>{star + 3}</span>
              </div>
            ))}
          </div>
          <div className="llm-properties-common__suffix-box">
            {Array.from(Array(commonData?.options.numberOfStar).keys()).map(
              () => (
                <RatingIcon color={"#FFBF0F"} fill={"#FFBF0F"} />
              )
            )}
          </div>
        </div>
      )}
      {commonData?.type === "date" && (
        <Checkbox
          label="Include time"
          isChecked={commonData?.options?.includeTime}
          onChange={(isChecked) => {
            onUpdate("includeTime", isChecked)
          }}
        />
      )}
      {commonData?.type === "web" && (
        <div className="llm-properties-common__item">
          <div className="llm-properties-common__item__label">Source</div>
          <div className="llm-properties-common__suffix-box">
            <div
              className={`llm-properties-common__suffix-box__btn ${
                commonData?.options.sourceType === "url" && "active"
              }`}
              onClick={() => onUpdate("sourceType", "url")}
            >
              <span>URL</span>
            </div>
            <div
              className={`llm-properties-common__suffix-box__btn ${
                commonData?.options.sourceType === "code" && "active"
              }`}
              onClick={() => onUpdate("sourceType", "code")}
            >
              <span>Code</span>
            </div>
          </div>
        </div>
      )}
      {(commonData?.type === "image" ||
        commonData?.type === "video" ||
        commonData?.type === "audio" ||
        commonData?.type === "avatar" ||
        (commonData?.type === "web" &&
          commonData?.options.sourceType !== "code") ||
        commonData?.type === "pdf") && (
        <TextInput
          label="Source URL"
          value={commonData?.options?.url}
          onChange={(e) => {
            onUpdate("url", e.target.value)
          }}
        />
      )}
      {(commonData?.type === "image" || commonData?.type === "avatar") && (
        <TextInput
          label="Alt text"
          value={commonData?.options?.alt}
          onChange={(e) => {
            onUpdate("alt", e.target.value)
          }}
        />
      )}
      {(commonData?.type === "web" || commonData?.type === "pdf") && (
        <TextInput
          label="Height"
          required={true}
          type="number"
          value={commonData?.options?.height}
          onChange={(e) => {
            onUpdate("height", e.target.value)
          }}
        />
      )}
      {commonData?.type === "csv" && (
        <TextInput
          label="Value"
          multipleLine={true}
          value={commonData?.options?.value}
          onChange={(e) => {
            onUpdate("value", e.target.value)
          }}
        />
      )}
      {commonData?.type === "csv" && (
        <div className="llm-properties-common__item">
          <div className="llm-properties-common__item__label">Delimiter</div>
          <div className="llm-properties-common__suffix-box">
            <div
              className={`llm-properties-common__suffix-box__btn ${
                commonData?.options.delimiter === "," && "active"
              }`}
              onClick={() => onUpdate("delimiter", ",")}
            >
              <span>,</span>
            </div>
            <div
              className={`llm-properties-common__suffix-box__btn ${
                commonData?.options.delimiter === ";" && "active"
              }`}
              onClick={() => onUpdate("delimiter", ";")}
            >
              <span>;</span>
            </div>
            <div
              className={`llm-properties-common__suffix-box__btn ${
                commonData?.options.delimiter === "|" && "active"
              }`}
              onClick={() => onUpdate("delimiter", "|")}
            >
              <span>|</span>
            </div>
          </div>
        </div>
      )}
      {(commonData?.type === "text_input" ||
        commonData?.type === "text_area" ||
        commonData?.type === "number" ||
        commonData?.type === "code" ||
        commonData?.type === "voting" ||
        commonData?.type === "rating" ||
        commonData?.type === "date" ||
        commonData?.type === "time" ||
        commonData?.type === "markdown") && (
        <Checkbox
          label="Required"
          isChecked={commonData?.options?.required}
          onChange={(isChecked) => {
            onUpdate("required", isChecked)
          }}
        />
      )}
      {(commonData?.type === "text_input" ||
        commonData?.type === "text_area" ||
        commonData?.type === "paragraph" ||
        commonData?.type === "code" ||
        commonData?.type === "voting" ||
        commonData?.type === "markdown" ||
        commonData?.type === "rating" ||
        commonData?.type === "date" ||
        commonData?.type === "time" ||
        commonData?.type === "image" ||
        commonData?.type === "web" ||
        commonData?.type === "pdf" ||
        commonData?.type === "video" ||
        commonData?.type === "audio" ||
        commonData?.type === "avatar" ||
        commonData?.type === "csv" ||
        commonData?.type === "number") && (
        <Checkbox
          label="Exclude from export"
          isChecked={commonData?.options?.excludeFormExport}
          onChange={(isChecked) => {
            onUpdate("excludeFormExport", isChecked)
          }}
        />
      )}
      {commonData?.type === "slider" && (
        <div className="llm-properties-common__item">
          <div className="llm-properties-common__item__label">Slider Type</div>
          <div className="llm-properties-common__item__radio-group">
            <Radio
              value={"regular"}
              isChecked={commonData?.options?.sliderType === "regular"}
              label="Regular slider"
              onChange={() => onUpdate("sliderType", "regular")}
            />
            <Radio
              value={"range"}
              isChecked={commonData?.options?.sliderType === "range"}
              label="Range slider"
              onChange={() => onUpdate("sliderType", "range")}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CommonProperties
