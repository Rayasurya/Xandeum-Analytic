import React, { useCallback, useMemo } from "react"
import "./index.scss"
import {
  TFormItemProps,
  TFormGrids,
  TFormGridProps,
  TGridProps,
} from "../../../../../common/types"
import {
  DragIcon,
  TrashBinIcon,
  PlusIcon,
  AlignTopIcon,
  AlignBottomIcon,
  AlignMidIcon,
} from "../../../../../assets/icons"
import TextInput from "../../../../atoms/TextInput"
import Button from "../../../../atoms/Button"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { genShortUID } from "../../../../../util/uuid"
import { set } from "lodash"
import Checkbox from "../../../../atoms/Checkbox"

type TProps = {
  currentItem: TFormItemProps
  onUpdateTabs: (newData: TFormItemProps) => void
}

const reorder = (list: TFormGrids[], startIndex: number, endIndex: number) => {
  const results = Array.from(list)
  const [removed] = results.splice(startIndex, 1)
  results.splice(endIndex, 0, removed)
  return results
}

const GridProperties: React.FC<TProps> = ({ currentItem, onUpdateTabs }) => {
  const gridData = useMemo<TFormGridProps | undefined>(() => {
    if (currentItem && currentItem.type) {
      return currentItem as TFormGridProps
    }
    return undefined
  }, [currentItem])

  const columns = useMemo(() => gridData?.options?.columns ?? [], [gridData])

  const onAddColumn = useCallback(() => {
    const id = "llm_" + genShortUID()
    const newList = Array.from(columns)
    onUpdateTabs({
      ...currentItem,
      ...{
        options: {
          ...currentItem.options,
          columns: newList.concat([{ id, size: 12, children: [] }]),
        },
      },
    })
  }, [columns, currentItem])

  const handleChangeAlign = useCallback(
    (align: TGridProps["verticalAlignment"]) => {
      onUpdateTabs({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            verticalAlignment: align,
          },
        },
      })
    },
    [ currentItem]
  )

  const handleChangeResizeable = useCallback(
    (isChecked: boolean) => {
      onUpdateTabs({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            resizeable: isChecked,
          },
        },
      })
    },
    [currentItem]
  )

  const handleChangeText = useCallback(
    (id: string, value: string) => {
      if (!id) return
      const newList = Array.from(columns)
      const index = newList.findIndex((l) => l.id === id)
      set(newList, [index, "size"], value)
      onUpdateTabs({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            columns: newList,
          },
        },
      })
    },
    [columns, currentItem]
  )

  const onDeleteItem = useCallback(
    (id: string) => {
      if (!id) return
      if (columns.length < 2) return
      const newList = Array.from(columns)
      onUpdateTabs({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            columns: newList.filter((l) => l.id !== id),
          },
        },
      })
    },
    [columns, currentItem]
  )

  return (
    <div className="llm-properties-grids">
      <div className="llm-properties-grids__label">Vertical alignment</div>
      <div className="llm-properties-grids__align-box">
        <div
          className={`llm-properties-grids__align-box__align-btn ${
            gridData?.options.verticalAlignment === "top" && "active"
          }`}
          onClick={() => handleChangeAlign("top")}
        >
          <AlignTopIcon />
          <span>Top</span>
        </div>
        <div
          className={`llm-properties-grids__align-box__align-btn ${
            gridData?.options.verticalAlignment === "mid" && "active"
          }`}
          onClick={() => handleChangeAlign("mid")}
        >
          <AlignMidIcon />
          <span>Middle</span>
        </div>
        <div
          className={`llm-properties-grids__align-box__align-btn ${
            gridData?.options.verticalAlignment === "bottom" && "active"
          }`}
          onClick={() => handleChangeAlign("bottom")}
        >
          <AlignBottomIcon />
          <span>Bottom</span>
        </div>
      </div>
      <Checkbox
        label="Resizable"
        isChecked={gridData?.options?.resizeable}
        onChange={(isChecked) => {
          handleChangeResizeable(isChecked)
        }}
      />

      <div className="llm-properties-grids__label">Columns</div>
      <DragDropContext
        onDragEnd={({ destination, source, draggableId, type }) => {
          if (!destination) return
          if (destination.droppableId !== source.droppableId) return
          if (destination.index === source.index) return
          const newList = reorder(columns, source.index, destination.index)
          onUpdateTabs({
            ...currentItem,
            ...{
              options: {
                ...currentItem.options,
                columns: newList,
              },
            },
          })
        }}
      >
        <Droppable droppableId="properties-grids" key="properties-grids">
          {(p) => (
            <div
              className="llm-properties-grids__option-list"
              ref={p.innerRef}
              {...p.droppableProps}
            >
              {columns.map(({ id, size }, index) => (
                <Draggable draggableId={id} index={index} key={id}>
                  {(d, s) => (
                    <div
                      className="llm-properties-grids__drag-row"
                      ref={d.innerRef}
                      {...d.draggableProps}
                      {...d.dragHandleProps}
                    >
                      <div className="llm-properties-grids__drag-icon">
                        <DragIcon />
                      </div>
                      <div className="llm-properties-grids__input">
                        <TextInput
                          value={size}
                          type="number"
                          onChange={(e) => {
                            handleChangeText(id, e.target.value)
                          }}
                        />
                      </div>
                      <div
                        className="llm-properties-grids__action"
                        onClick={() => onDeleteItem(id)}
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
        text="Add Column"
        type="outline"
        style={{ width: 124 }}
        onClick={onAddColumn}
      />
    </div>
  )
}

export default GridProperties
