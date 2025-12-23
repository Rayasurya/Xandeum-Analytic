import React, { useCallback, useMemo } from "react"
import "./index.scss"
import {
  TFormGroupProps,
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
import Checkbox from "../../../../atoms/Checkbox"

type TProps = {
  currentItem: TFormItemProps
  onUpdateTabs: (newData: TFormItemProps) => void
}
const GroupProperties: React.FC<TProps> = ({ currentItem, onUpdateTabs }) => {
  const groupData = useMemo<TFormGroupProps | undefined>(() => {
    if (currentItem && currentItem.type) {
      return currentItem as TFormGroupProps
    }
    return undefined
  }, [currentItem])

  const onUpdate = useCallback(
    (field: string, value: boolean) => {
      onUpdateTabs({
        ...currentItem,
        ...{
          options: {
            ...currentItem.options,
            [field]: value,
          },
        },
      })
    },
    [groupData]
  )

  return (
    <div className="llm-properties-group">
      <Checkbox
        label={"Initially hidden"}
        isChecked={groupData?.options?.initialHidden}
        onChange={(isChecked) => {
          onUpdate("initialHidden", isChecked)
        }}
      />
      <Checkbox
        label={"Removable"}
        isChecked={groupData?.options?.removeable}
        onChange={(isChecked) => {
          onUpdate("removeable", isChecked)
        }}
      />
    </div>
  )
}

export default GroupProperties
