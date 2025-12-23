import React, { useCallback, useMemo } from "react"
import { TFormGroupProps, TFormItemProps } from "../../../../../common/types"
import Checkbox from "../../../../atoms/Checkbox"
import "./index.scss"
import TextInput from "../../../../atoms/TextInput"
import Switch from "../../../../atoms/Switch"
import { FormSelect } from "../../../../atoms/FormElements"
import { selectList } from "../../../../../assets/icons"
import { TSelectOption } from "../../../../atoms/FormElements/Select"
import Select from "../../../../atoms/Select"

type TProps = {
  currentItem: TFormItemProps
  onUpdateProps: (newData: TFormItemProps) => void
}
const ButtonProperties: React.FC<TProps> = ({ currentItem, onUpdateProps }) => {
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
    <div className="llm-properties-button">
      <Switch
        label={"Label"}
        isChecked={commonData?.options?.showLabel}
        onChange={(isChecked) => {
          onUpdate("showLabel", isChecked)
        }}
      />
      <Switch
        label={"Icon"}
        isChecked={commonData?.options?.showIcon}
        onChange={(isChecked) => {
          onUpdate("showIcon", isChecked)
        }}
      />
      {commonData?.options?.showIcon && (
        <Select
          label="Icon"
          options={selectList}
          hasIcon={true}
          onChange={(data) => {
						const { value } = data as TSelectOption
            value && onUpdate("icon", value as string)
          }}
        />
      )}

      {commonData?.options?.showLabel && (
        <TextInput
          label="Label"
          value={commonData?.options?.label}
          onChange={(e) => {
            onUpdate("label", e.target.value)
          }}
        />
      )}

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
    </div>
  )
}

export default ButtonProperties
