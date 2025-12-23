import React, { useMemo } from "react"
import { CopyIcon, TrashBinIcon } from "../../../assets/icons"
import { IconsMapping } from "../../../common/template"
import { TFormItemProps } from "../../../common/types"
import TextInput from "../../atoms/TextInput"
import TabProperties from "./components/Tabs"
import "./index.scss"
import GroupProperties from "./components/Group"
import GridProperties from "./components/Grid"
import CommonProperties from "./components/Common"
import ButtonProperties from "./components/Button"
import OptionProperties from "./components/Options"

type TProps = {
  currentItem: TFormItemProps
  onDeleteItem: (id: string) => void
  onDuplicateItem: (id: string) => void
  onUpdateBaseItem: (item: TFormItemProps) => void
}

const PropertiesBox: React.FC<TProps> = ({
  currentItem,
  onDeleteItem,
  onDuplicateItem,
  onUpdateBaseItem,
}) => {
  const headerItem = useMemo(
    () =>
      currentItem && currentItem.type
        ? IconsMapping[currentItem.type]
        : undefined,
    [currentItem]
  )
  const handleDeletedItem = () => {
    onDeleteItem(currentItem.id)
  }

  const handleDuplidateItem = () => {
    onDuplicateItem(currentItem.id)
  }

  const onUpdateItem = (newData: TFormItemProps) => {
    onUpdateBaseItem(newData)
  }

  const handleChangeId = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onUpdateItem({ ...currentItem, id: e.target.value })
  }

  return !headerItem ? (
    <></>
  ) : (
    <div className="llm-properties-box">
      <div className="llm-properties-box__header">
        <div className="llm-properties-box__title">
          <headerItem.icon />
          {headerItem.name}
        </div>
        <div className="llm-properties-box__action">
          <div
            className="llm-properties-box__action__button"
            onClick={handleDeletedItem}
          >
            <TrashBinIcon />
          </div>
          <div
            className="llm-properties-box__action__button"
            onClick={handleDuplidateItem}
          >
            <CopyIcon />
          </div>
        </div>
      </div>
      <div className="llm-properties-box__content">
        <TextInput
          label="ID"
          required={true}
          value={currentItem.id}
          onChange={handleChangeId}
        />
        {currentItem.type === "tabs" ? (
          <TabProperties
            currentItem={currentItem}
            onUpdateTabs={onUpdateItem}
          />
        ) : currentItem.type === "group" ? (
          <GroupProperties
            currentItem={currentItem}
            onUpdateTabs={onUpdateItem}
          />
        ) : currentItem.type === "grid" ? (
          <GridProperties
            currentItem={currentItem}
            onUpdateTabs={onUpdateItem}
          />
        ) : currentItem.type === "button_primary" ||
          currentItem.type === "button_outline" ? (
          <ButtonProperties
            currentItem={currentItem}
            onUpdateProps={onUpdateItem}
          />
        ) : (
          <CommonProperties
            currentItem={currentItem}
            onUpdateProps={onUpdateItem}
          />
        )}
        {(currentItem.type === "select" ||
          currentItem.type === "check_box" ||
          currentItem.type === "radio") && (
          <OptionProperties
            currentItem={currentItem}
            onUpdateOptions={onUpdateItem}
          />
        )}
      </div>
    </div>
  )
}

export default PropertiesBox
