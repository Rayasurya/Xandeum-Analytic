import { cloneDeep, get, keyBy, set } from "lodash"
import React, { useMemo } from "react"
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd"
import EditorPlaceholder from "../../../assets/images/EditorPlaceholder"
import {
  TFormGridProps,
  TFormGroupProps,
  TFormItemLayoutProps,
  TFormItemProps,
  TFormTabsProps,
} from "../../../common/types"
import { flattenNestedArray } from "../../../util/array"
import {
  AudioPlayer,
  CSVViewer,
  FormAvatar,
  FormCheckBox,
  FormCodeViewer,
  FormDatePicker,
  FormDivider,
  FormGrid,
  FormGroup,
  FormImage,
  FormInput,
  FormMarkDown,
  FormNumber,
  FormOutlineButton,
  FormParagraph,
  FormPrimaryButton,
  FormRadio,
  FormRating,
  FormSelect,
  FormSlider,
  FormTabView,
  FormTextArea,
  FormTimePicker,
  FormVoting,
  PDFViewer,
  VideoPlayer,
  WebView,
} from "../../atoms/FormElements"
import DragableItem from "../../molecules/DragableItem"
import "./index.scss"

type LayoutProps = {
  formData: TFormItemProps[]
  formDataLayout: TFormItemLayoutProps[]
  onUpdateBaseItem: (data: TFormItemProps) => void
  onClickItem?: (id: string) => void
  onReOrderList?: (data: TFormItemLayoutProps[]) => void
  forceReload?: boolean
}

const reorderMainComponent = (
  list: TFormItemLayoutProps[],
  startIndex: number,
  endIndex: number
) => {
  const results = Array.from(list)
  const [removed] = results.splice(startIndex, 1)
  results.splice(endIndex, 0, removed)
  return results
}

const moveById = (
  list: TFormItemLayoutProps[],
  sourcePath: string | undefined,
  sourceIndex: number,
  destinationPath: string | undefined,
  destinationIndex: number
) => {
  if (sourcePath && destinationPath) {
    let results = Array.from(list)
    if (sourcePath === "main-body" || destinationPath === "main-body") {
      if (sourcePath === destinationPath) {
        if (sourceIndex === destinationIndex) return
        const newFormDataList = reorderMainComponent(
          results,
          sourceIndex,
          destinationIndex
        )
        return newFormDataList
      }
      if (sourcePath === "main-body") {
        const destinationData = cloneDeep(get(results, destinationPath))
        const [moveItem] = cloneDeep(results).splice(sourceIndex, 1)
        destinationData.children.splice(destinationIndex, 0, moveItem)
        results = set(results, destinationPath, destinationData)
        results.splice(sourceIndex, 1)
      }
      if (destinationPath === "main-body") {
        const sourceData = get(results, sourcePath)
        const [moveItem] = sourceData.children.splice(sourceIndex, 1)
        results = set(results, sourcePath, sourceData)
        results.splice(destinationIndex, 0, moveItem)
      }
    } else {
      const destinationData = get(results, destinationPath)
      const currentGroup = get(results, sourcePath)
      const [moveItem] = currentGroup.children.splice(sourceIndex, 1)
      destinationData.children.splice(destinationIndex, 0, moveItem)
      //add item to tab
      results = set(results, destinationPath, destinationData)
      //remove old item from group
      results = set(results, sourcePath, currentGroup)
    }
    return results
  }
}

const MainBody: React.FC<LayoutProps> = ({
  formData,
  formDataLayout,
  onUpdateBaseItem,
  onClickItem,
  onReOrderList,
  forceReload,
}) => {
  const currentFormData = useMemo(() => formData, [formData])
  const [activeFromItem, setActiveFromItem] = React.useState<
    string | undefined
  >(undefined)
  const refTree = React.useRef<any>({})

  React.useEffect(() => {
    refTree.current = keyBy(flattenNestedArray(formDataLayout), "id")
  }, [formDataLayout])

  const onDragFormDataEnd: OnDragEndResponder = ({
    destination,
    source,
    draggableId,
    type,
  }) => {
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return
    if (destination.droppableId.indexOf(draggableId) !== -1) return
    let sourcePath = source.droppableId,
      destinationPath = destination.droppableId
    if (destination.droppableId.indexOf("tab-panel-") !== -1) {
      const ids = destination.droppableId.replace("tab-panel-", "").split("|")
      if (ids.length !== 2) return
      destinationPath = refTree.current[ids[1]].path
    }
    if (destination.droppableId.indexOf("group-panel-") !== -1) {
      const id = destination.droppableId.replace("group-panel-", "")
      destinationPath = refTree.current[id].path
    }
    if (destination.droppableId.indexOf("grid-") !== -1) {
      const ids = destination.droppableId.replace("grid-", "").split("|")
      if (ids.length !== 2) return
      destinationPath = refTree.current[ids[1]].path
    }

    if (source.droppableId.indexOf("tab-panel-") !== -1) {
      const ids = source.droppableId.replace("tab-panel-", "").split("|")
      if (ids.length !== 2) return
      sourcePath = refTree.current[ids[1]].path
    }
    if (source.droppableId.indexOf("group-panel-") !== -1) {
      const id = source.droppableId.replace("group-panel-", "")
      sourcePath = refTree.current[id].path
    }
    if (source.droppableId.indexOf("grid-") !== -1) {
      const ids = source.droppableId.replace("grid-", "").split("|")
      if (ids.length !== 2) return
      sourcePath = refTree.current[ids[1]].path
    }
    const newFormDataList = moveById(
      formDataLayout,
      sourcePath,
      source.index,
      destinationPath,
      destination.index
    )
    onReOrderList?.(newFormDataList as TFormItemLayoutProps[])
  }

  const renderItem = (formItemLayout: TFormItemLayoutProps, index: number) => {
    const renderChildList = (
      parentId: string | null,
      childLayouts: TFormItemLayoutProps[]
    ) => {
      if (!parentId)
        return childLayouts.map((layoutItem, index) =>
          renderItem(layoutItem, index)
        )
      const childIndex = childLayouts.findIndex((ch) => ch.id == parentId)
      if (childIndex !== -1) {
        return childLayouts[childIndex].children.map((layoutItem, index) =>
          renderItem(layoutItem, index)
        )
      } else {
        return [<></>]
      }
    }
    const renderChild = (
      formData: TFormItemProps[],
      item: TFormItemLayoutProps,
      isDragging?: boolean
    ) => {
      const formItem = formData.find((formItem) => formItem.id === item.id)
      if (formItem) {
        switch (formItem.type) {
          case "tabs":
            return (
              <FormTabView
                formItem={formItem as TFormTabsProps}
                onUpdateTabs={(newData) => {
                  onUpdateBaseItem(newData)
                }}
                children={(tabId) => {
                  return renderChildList(tabId, item.children)
                }}
              />
            )

          case "group":
            return (
              <FormGroup
                formItem={formItem as TFormGroupProps}
                onUpdateTabs={(newData) => {
                  onUpdateBaseItem(newData as TFormItemProps)
                }}
                children={() => {
                  return renderChildList(null, item.children)
                }}
              />
            )
          case "grid":
            return (
              <FormGrid
                formItem={formItem as TFormGridProps}
                isDragging={isDragging}
                onUpdateTabs={(newData) => {
                  onUpdateBaseItem(newData as TFormItemProps)
                }}
                children={(tabId) => {
                  return renderChildList(tabId, item.children)
                }}
              />
            )
          case "divider":
            return <FormDivider formItem={formItem} />
          case "button_primary":
            return <FormPrimaryButton formItem={formItem} />
          case "button_outline":
            return <FormOutlineButton formItem={formItem} />
          case "text_input":
            return <FormInput formItem={formItem} />
          case "text_area":
            return <FormTextArea formItem={formItem} />
          case "number":
            return <FormNumber formItem={formItem} />
          case "code":
            return <FormCodeViewer formItem={formItem} />
          case "paragraph":
            return <FormParagraph formItem={formItem} />
          case "markdown":
            return <FormMarkDown formItem={formItem} />
          case "select":
            return <FormSelect formItem={formItem} />
          case "slider":
            return <FormSlider formItem={formItem} />
          case "check_box":
            return <FormCheckBox formItem={formItem} />
          case "radio":
            return <FormRadio formItem={formItem} />
          case "voting":
            return <FormVoting formItem={formItem} />
          case "rating":
            return <FormRating formItem={formItem} />
          case "date":
            return <FormDatePicker formItem={formItem} />
          case "time":
            return <FormTimePicker formItem={formItem} />
          case "image":
            return <FormImage formItem={formItem} />
          case "web":
            return (
              <WebView
                formItem={formItem}
                onUpdateData={(newData) => {
                  onUpdateBaseItem(newData)
                }}
              />
            )
          case "pdf":
            return <PDFViewer formItem={formItem} />
          case "video":
            return <VideoPlayer formItem={formItem} />
          case "audio":
            return <AudioPlayer formItem={formItem} />
          case "avatar":
            return <FormAvatar formItem={formItem} />
          case "csv":
            return <CSVViewer formItem={formItem} />
          default:
            return null
        }
      } else {
        return <></>
      }
    }

    return (
      <DragableItem
        id={formItemLayout.id}
        isActive={formItemLayout.id === activeFromItem}
        index={index}
        renderChild={(isDragging) => {
          return (
            <div
              onClick={(e) => {
                setActiveFromItem(formItemLayout.id)
                onClickItem?.(formItemLayout.id)
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {renderChild(formData, formItemLayout, isDragging)}
            </div>
          )
        }}
      ></DragableItem>
    )
  }

  if (currentFormData.length === 0)
    return (
      <div className="llm-main-body center">
        <EditorPlaceholder />
      </div>
    )

  return (
    <DragDropContext
      onDragEnd={onDragFormDataEnd}
      onDragUpdate={(e) => console.log(e)}
      key={`dragMain-${forceReload}`}
    >
      <Droppable droppableId="main-body" key="main-body">
        {(p, s) => (
          <div className="llm-main-body" ref={p.innerRef} {...p.droppableProps}>
            {formDataLayout.map((layoutItem, index) =>
              renderItem(layoutItem, index)
            )}
            {p.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default MainBody
