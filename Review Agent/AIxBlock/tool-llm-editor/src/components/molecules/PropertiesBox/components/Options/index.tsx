import { concat, find, keyBy, set, uniq, uniqBy } from "lodash"
import React, { useCallback, useMemo } from "react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { DragIcon, PlusIcon, TrashBinIcon } from "../../../../../assets/icons"
import { OptionType, TFormItemProps } from "../../../../../common/types"
import { genShortUID } from "../../../../../util/uuid"
import Button from "../../../../atoms/Button"
import TextInput from "../../../../atoms/TextInput"
import "./index.scss"
import Checkbox from "../../../../atoms/Checkbox"
import Radio from "../../../../atoms/Radio"

type TProps = {
  currentItem: TFormItemProps
  onUpdateOptions: (newData: TFormItemProps) => void
}

const reorder = (list: OptionType[], startIndex: number, endIndex: number) => {
  const results = Array.from(list)
  const [removed] = results.splice(startIndex, 1)
  results.splice(endIndex, 0, removed)
  return results
}

const OptionProperties: React.FC<TProps> = ({
  currentItem,
  onUpdateOptions,
}) => {
  const optionData = useMemo<TFormItemProps | undefined>(() => {
    if (currentItem && currentItem.type) {
      return currentItem as TFormItemProps
    }
    return undefined
  }, [currentItem])

  const options = useMemo(
    () => optionData?.options?.options ?? [],
    [optionData]
  )
  const defaultOptions = useMemo(
    () =>
      Object.keys(keyBy(optionData?.options?.defaultOptions ?? [], "value")),
    [optionData]
  )

  const onAddItem = useCallback(() => {
    const value = "llm_" + genShortUID()
    const newList = Array.from(options)
    onUpdateOptions({
      ...currentItem,
      ...{
        options: {
          ...currentItem.options,
          options: newList.concat([
            { value, label: "Option " + (newList.length + 1) },
          ]),
        },
      },
    })
  }, [options, currentItem])

  const handleChangeText = useCallback(
    (value: string, label: string) => {
      if (!value) return
      const newList = Array.from(options)
      const index = newList.findIndex((l) => l.value === value)
      set(newList, [index, "label"], label)
      onUpdateOptions({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            options: newList,
          },
        },
      })
    },
    [options, currentItem]
  )

  const handleChangeDefaultOptions = useCallback(
    (value: string, isChecked: boolean) => {
      if (!value) return
      const {
        optionType = "single",
        defaultOptions = [],
        options,
      } = currentItem?.options
      const item = find(options, (i) => i.value == value)
      const filteredOptions = defaultOptions.filter((i) => i.value !== value)
      const newOptions = isChecked && item ? [item] : []
      onUpdateOptions({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            defaultOptions:
              optionType === "single"
                ? newOptions
                : uniqBy(concat(filteredOptions, newOptions), "value"),
          },
        },
      })
    },
    [options, currentItem]
  )
  const handleChangeOptionType = useCallback(
    (type: "single" | "multiple") => {
      const optionType = type
      onUpdateOptions({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            optionType: optionType,
            defaultOptions: [],
          },
        },
      })
    },
    [options, currentItem]
  )

  const onDeleteItem = useCallback(
    (value: string) => {
      if (!value) return
      if (options.length < 2) return
      const newList = Array.from(options)
      onUpdateOptions({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            options: newList.filter((l) => l.value !== value),
          },
        },
      })
    },
    [options, currentItem]
  )
  return (
    <div className="llm-properties-options">
      <div className="llm-properties-options__label">Select type</div>
      {currentItem.type === "select" && (
        <div
          className="llm-properties-options__option-list"
          style={{ minHeight: "auto" }}
        >
          <Radio
            label="Single-select"
            isChecked={optionData?.options.optionType === "single"}
            onChange={(isChecked) =>
              handleChangeOptionType(isChecked ? "single" : "multiple")
            }
          />
          <Radio
            label="Multi-select"
            isChecked={optionData?.options.optionType === "multiple"}
            onChange={(isChecked) =>
              handleChangeOptionType(isChecked ? "multiple" : "single")
            }
          />
        </div>
      )}

      <div className="llm-properties-options__label">Options</div>
      <DragDropContext
        onDragEnd={({ destination, source, draggableId, type }) => {
          if (!destination) return
          if (destination.droppableId !== source.droppableId) return
          if (destination.index === source.index) return
          const newList = reorder(options, source.index, destination.index)
          onUpdateOptions({
            ...currentItem,
            ...{
              options: {
                ...currentItem.options,
                options: newList,
              },
            },
          })
        }}
      >
        <Droppable droppableId="properties"  key="properties">
          {(p) => (
            <div
              className="llm-properties-options__option-list"
              ref={p.innerRef}
							{...p.droppableProps}
            >
              {options.map(({ value, label }, index) => (
                <Draggable draggableId={value} index={index} key={value}>
                  {(d, s) => (
                    <div
                      className="llm-properties-options__drag-row"
                      ref={d.innerRef}
                      {...d.draggableProps}
                      {...d.dragHandleProps}
                    >
                      <div className="llm-properties-options__drag-icon">
                        <DragIcon />
                      </div>
                      {optionData?.options.optionType === "single" ? (
                        <Radio
                          isChecked={defaultOptions.indexOf(value) !== -1}
                          onChange={(isChecked) =>
                            handleChangeDefaultOptions(value, isChecked)
                          }
                        />
                      ) : (
                        <Checkbox
                          isChecked={defaultOptions.indexOf(value) !== -1}
                          onChange={(isChecked) =>
                            handleChangeDefaultOptions(value, isChecked)
                          }
                        />
                      )}
                      <div className="llm-properties-options__input">
                        <TextInput
                          value={label}
                          onChange={(e) => {
                            handleChangeText(value, e.target.value)
                          }}
                        />
                      </div>
                      <div
                        className="llm-properties-options__action"
                        onClick={() => onDeleteItem(value)}
                      >
                        <TrashBinIcon />
                      </div>
                    </div>
                  )}
                </Draggable>
							))}
							{p.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        icon={<PlusIcon />}
        text="Add Option"
        type="outline"
        style={{ width: 124 }}
        onClick={onAddItem}
      />
    </div>
  )
}

export default OptionProperties
