import React, { ReactNode, useCallback, useMemo } from "react"
import { PlusIcon } from "../../../../assets/icons"
import { TFormItemProps } from "../../../../common/types"
import { genShortUID } from "../../../../util/uuid"
import Tab from "./Tab"
import TabPanel from "./TabPanel"
import "./index.scss"
import { resetServerContext } from "react-beautiful-dnd"

export type FormTabChildProps = {
  label: string
  content: ReactNode
}

export type FormTabProps = {
  formItem?: TFormItemProps
  onUpdateTabs: (newData: TFormItemProps) => void
  children?: (tabId: string) => JSX.Element[]
  isPreview?: boolean
}

const FormTabView: React.FC<FormTabProps> = ({
  formItem,
  onUpdateTabs,
  children,
  isPreview = false,
}) => {
  const {
    tabs = [
      {
        id: "tab_1",
        label: "Tab 1",
        children: [],
      },
      {
        id: "tab_2",
        label: "Tab 2",
        children: [],
      },
    ],
  } = formItem?.options ?? { tabs: undefined }

  const [activeTab, setActiveTab] = React.useState<number>(0)

  const handleClick = useCallback(
    (tabIndex: number) => {
      setActiveTab(tabIndex)
      onUpdateTabs({
        ...formItem,
        ...{
          options: {
            ...formItem?.options,
            value: `${tabIndex}`,
          },
        },
      } as TFormItemProps)
    },
    [setActiveTab, formItem]
  )

  const currentActiveTab = useMemo(() => {
		const valueTab = formItem?.options.value
		if (isPreview) return activeTab;
    return Number.isNaN(Number(valueTab)) ? activeTab : Number(valueTab)
	}, [formItem, activeTab, isPreview])
	
  const onAddTab = React.useCallback(() => {
    const id = "llm_" + genShortUID()
    const newList = Array.from(tabs)
    onUpdateTabs({
      ...formItem,
      ...{
        options: {
          ...formItem?.options,
          tabs: newList.concat([
            { id, label: "Tab " + (newList.length + 1), children: [] },
          ]),
        },
      },
    } as TFormItemProps)
  }, [tabs])

  const onDeleteItem = React.useCallback(
    (id: string) => {
      if (!id) return
      if (tabs.length < 2) return
      const newList = Array.from(tabs)
      onUpdateTabs({
        ...formItem,
        ...{
          options: {
            ...formItem?.options,
            tabs: newList.filter((l) => l.id !== id),
          },
        },
      } as TFormItemProps)
    },
    [tabs]
  )

  return (
    <div className="llm-tabs-view">
      <ul className="llm-tabs-view__nav">
        {tabs.map((tab, index) => {
          return (
            <Tab
              key={`tab-${tab.id}`}
              index={index}
              label={tab.label}
              isActive={currentActiveTab === index}
              onClick={handleClick}
              onRemove={() => {
                onDeleteItem(tab.id)
              }}
              isPreview={isPreview}
            />
          )
        })}
        {!isPreview && (
          <li
            className="llm-tabs-view__nav__add"
            onClick={() => {
              onAddTab()
            }}
          >
            <PlusIcon />
          </li>
        )}
      </ul>
      <TabPanel
        id={`${formItem?.id ?? ""}|${tabs[currentActiveTab]?.id ?? ""}`}
        isPreview={isPreview}
      >
        {children?.(tabs[currentActiveTab]?.id)}
      </TabPanel>
    </div>
  )
}
export default FormTabView
