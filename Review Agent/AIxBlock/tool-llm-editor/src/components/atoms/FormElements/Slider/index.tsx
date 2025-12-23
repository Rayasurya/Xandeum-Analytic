import React, { SetStateAction, useMemo } from "react"
import { Handles, Rail, Slider, Ticks, Tracks } from "react-compound-slider"
import ToolTip from "../../Tooltip"
import { Handle, SliderRail, Tick, Track } from "./RangeSliderComponents"
import "./index.scss"
import { TFormItemProps } from "../../../../common/types"

type TProps = {
  formItem: TFormItemProps
  id?: string
  label?: string
  min?: number
  max?: number
  defaultValues?: [number, number]
  isMulti?: boolean
  step?: number
  suffix?: "-" | "#" | "%" | "$" | ""
  onChangeValue?: (value: any) => void
  showInfo?: boolean
  tooltip?: string
	isPreview?: boolean
}

const sliderStyle = {
  position: "relative" as "relative",
  width: "100%",
  touchAction: "none",
}

const FormSlider: React.FC<TProps> = ({
  formItem: { options },
  onChangeValue,
}) => {
  const {
    label,
    showInfo,
    tooltip,
    min = 0,
    max = 100,
    sliderType = "regular",
    suffix = "-",
    step = 1,
    defaultRange = [0],
  } = options ?? {}

  const [values, setValues] = React.useState(defaultRange.slice())
  const isMulti = useMemo(() => sliderType === "range", [sliderType])
  const sliderValue = useMemo(() => {
    if (sliderType === "range" && values.length == 1) {
      return [0, values[0]]
    }
    if (sliderType === "regular" && values.length == 2) {
      return [values[1]]
    }
    return values
  }, [defaultRange, sliderType, values])

  const displayValue = useMemo(() => {
    return values.length > 1 ? `${values[0]}-${values[1]}` : values[0] ?? ""
  }, [values])

  const handleChange = (value: ReadonlyArray<number>) => {
    if (Number.isNaN(value[0])) return
    setValues(value as SetStateAction<number[]>)
    // onChangeValue?.(value)
  }
  return (
    <div className="llm-slider-view">
      <div className="llm-slider-view__label__content">
        <div className="llm-slider-view__label">{label}</div>
        <div className="llm-slider-view__value">
          {displayValue}
          {showInfo && (
            <div className="llm-slider-view__info">
              <ToolTip text={tooltip ?? ""} />
            </div>
          )}
        </div>
      </div>
      <div className="llm-slider-view__slide_content">
        <Slider
          mode={1}
          step={step ?? 1}
          domain={[min, max]}
          rootStyle={sliderStyle}
          onChange={handleChange}
          values={sliderValue}
        >
          <Rail>
            {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
          </Rail>
          <Handles>
            {({ handles, activeHandleID, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map((handle) => (
                  <Handle
                    key={handle.id}
                    handle={handle}
                    domain={[min, max]}
                    isActive={handle.id === activeHandleID}
                    getHandleProps={getHandleProps}
                    suffix={suffix === "-" ? "" : suffix}
                  />
                ))}
              </div>
            )}
          </Handles>
          <Tracks {...(isMulti && { left: false })} right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <Track
                    key={id}
                    source={source}
                    target={target}
                    getTrackProps={getTrackProps}
                  />
                ))}
              </div>
            )}
          </Tracks>
          <Ticks count={1}>
            {({ ticks }) => (
              <div className="slider-ticks">
                {ticks.map((tick) => (
                  <Tick key={tick.id} tick={tick} count={ticks.length} />
                ))}
              </div>
            )}
          </Ticks>
        </Slider>
      </div>
    </div>
  )
}
export default FormSlider
