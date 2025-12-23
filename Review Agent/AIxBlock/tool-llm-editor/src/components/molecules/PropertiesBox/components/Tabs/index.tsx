import React, { useCallback, useMemo } from "react"
import "./index.scss"
import {
  TFormItemProps,
  TFormTabs,
  TFormTabsProps,
} from "../../../../../common/types"
import { DragIcon, TrashBinIcon, PlusIcon } from "../../../../../assets/icons"
import TextInput from "../../../../atoms/TextInput"
import Button from "../../../../atoms/Button"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { genShortUID } from "../../../../../util/uuid"
import { set } from "lodash"

type TProps = {
  currentItem: TFormItemProps
  onUpdateTabs: (newData: TFormItemProps) => void
}

const reorder = (list: TFormTabs[], startIndex: number, endIndex: number) => {
  const results = Array.from(list)
  const [removed] = results.splice(startIndex, 1)
  results.splice(endIndex, 0, removed)
  return results
}

const TabProperties: React.FC<TProps> = ({ currentItem, onUpdateTabs }) => {
  const tabData = useMemo<TFormTabsProps | undefined>(() => {
    if (currentItem && currentItem.type) {
      return currentItem as TFormTabsProps
    }
    return undefined
  }, [currentItem])

  const tabs = useMemo(() => tabData?.options?.tabs ?? [], [tabData])

  const onAddTab = useCallback(() => {
    const id = "llm_" + genShortUID()
    const newList = Array.from(tabs)
    onUpdateTabs({
      ...currentItem,
      ...{
        options: {
          ...currentItem.options,
          tabs: newList.concat([
            { id, label: "Tab " + (newList.length + 1), children: [] },
          ]),
        },
      },
    })
  }, [tabs])

  const handleChangeText = useCallback(
    (id: string, value: string) => {
      if (!id) return
      const newList = Array.from(tabs)
      const index = newList.findIndex((l) => l.id === id)
			set(newList, [index, "label"], value)
			onUpdateTabs({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            tabs: newList,
          },
        },
      })
    },
    [tabs]
  )

  const onDeleteItem = useCallback(
    (id: string) => {
      if (!id) return
      if (tabs.length < 2) return
      const newList = Array.from(tabs)
      onUpdateTabs({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            tabs: newList.filter((l) => l.id !== id),
          },
        },
      })
    },
    [tabs]
  )

  return (
    <div className="llm-properties-tabs">
      <div className="llm-properties-tabs__label">Tabs</div>
      <DragDropContext
        onDragEnd={({ destination, source, draggableId, type }) => {
          if (!destination) return
          if (destination.droppableId !== source.droppableId) return
          if (destination.index === source.index) return
          const newList = reorder(tabs, source.index, destination.index)
          onUpdateTabs({
            ...currentItem,
            ...{
              options: {
                ...currentItem.options,
                tabs: newList,
              },
            },
          })
        }}
      >
        <Droppable droppableId="properties" key="properties">
          {(p) => (
            <div
              className="llm-properties-tabs__option-list"
              ref={p.innerRef}
              {...p.droppableProps}
            >
              {tabs.map(({ id, label }, index) => (
                <Draggable draggableId={id} index={index} key={id}>
                  {(d, s) => (
                    <div
                      className="llm-properties-tabs__drag-row"
                      ref={d.innerRef}
                      {...d.draggableProps}
                      {...d.dragHandleProps}
                    >
                      <div className="llm-properties-tabs__drag-icon">
                        <DragIcon />
                      </div>
                      <div className="llm-properties-tabs__input">
                        <TextInput
                          value={label}
                          onChange={(e) => {
                            handleChangeText(id, e.target.value)
                          }}
                        />
                      </div>
                      <div
                        className="llm-properties-tabs__action"
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
        text="Add tab"
        type="outline"
        style={{ width: 124 }}
        onClick={onAddTab}
      />
    </div>
  )
}

export default TabProperties
