import { cloneDeep, concat, differenceBy, find, get, keyBy, set } from "lodash"
import React, { useMemo } from "react"
import { resetServerContext } from "react-beautiful-dnd"
import {
  AudioIcon,
  AvatarIcon,
  ButtonOutlineIcon,
  ButtonPrimaryIcon,
  CSVIcon,
  CheckboxIcon,
  CodeIcon,
  DateIcon,
  DividerIcon,
  GridIcon,
  GroupIcon,
  ImageIcon,
  MarkdownIcon,
  NumberIcon,
  PDFIcon,
  ParagraphIcon,
  RadioIcon,
  RatingIcon,
  SelectIcon,
  SliderIcon,
  TabsIcon,
  TextAreaIcon,
  TextInputIcon,
  TimeIcon,
  VotingIcon,
  WebIcon,
} from "../../../assets/icons"
import {
  audioTemplate,
  avatarTemplate,
  buttonTemplate,
  checkboxTemplate,
  codeTemplate,
  commonWithInfoTemplate,
  csvTemplate,
  dateTemplate,
  gridTemplate,
  imageTemplate,
  markdownTemplate,
  numberTemplate,
  paragraphTemplate,
  pdfTemplate,
  radioTemplate,
  ratingTemplate,
  selectTemplate,
  sliderTemplate,
  tabTemplate,
  textAreaTemplate,
  textInputTemplate,
  timeTemplate,
  videoTemplate,
  votingTemplate,
  webTemplate,
} from "../../../common/template"
import {
  TFormItemLayoutProps,
  TFormItemProps,
  TToolbox,
  TToolboxGroup,
} from "../../../common/types"
import { filterChildArray, flattenNestedArray } from "../../../util/array"
import { genShortUID } from "../../../util/uuid"
import ToolBoxItem from "../../atoms/ToolBoxItem"
import ExpandList from "../../molecules/ExpandList"
import PropertiesBox from "../../molecules/PropertiesBox"
import MainBody from "../../organisms/MainBody"
import SideBar from "../../organisms/Sidebar"
import "./index.scss"

type LayoutProps = {
  components: TFormItemProps[]
  layout: TFormItemLayoutProps[]
  updatePageProps: (
    components: TFormItemProps[],
    layout: TFormItemLayoutProps[]
  ) => void
}

const toolItems = [
  {
    groupName: "Layout",
    childItems: [
      {
        name: "Tabs",
        icon: <TabsIcon />,
        type: "tabs",
      },
      {
        name: "Group",
        icon: <GroupIcon />,
        type: "group",
      },
      {
        name: "Grid",
        icon: <GridIcon />,
        type: "grid",
      },
      {
        name: "Divider",
        icon: <DividerIcon />,
        type: "divider",
      },
    ],
  },
  {
    groupName: "Button",
    childItems: [
      {
        name: "Primary",
        icon: <ButtonPrimaryIcon />,
        type: "button_primary",
      },
      {
        name: "Outline",
        icon: <ButtonOutlineIcon />,
        type: "button_outline",
      },
    ],
  },
  {
    groupName: "Input",
    childItems: [
      {
        name: "Text input",
        icon: <TextInputIcon />,
        type: "text_input",
      },
      {
        name: "Text area",
        icon: <TextAreaIcon />,
        type: "text_area",
      },
      {
        name: "Number",
        icon: <NumberIcon />,
        type: "number",
      },
      {
        name: "Code",
        icon: <CodeIcon />,
        type: "code",
      },
      {
        name: "Paragraph",
        icon: <ParagraphIcon />,
        type: "paragraph",
      },
      {
        name: "Markdown",
        icon: <MarkdownIcon />,
        type: "markdown",
      },
    ],
  },
  {
    groupName: "Select",
    childItems: [
      {
        name: "Select",
        icon: <SelectIcon />,
        type: "select",
      },
      {
        name: "Slider",
        icon: <SliderIcon />,
        type: "slider",
      },
      {
        name: "Check box",
        icon: <CheckboxIcon />,
        type: "check_box",
      },
      {
        name: "Radio",
        icon: <RadioIcon />,
        type: "radio",
      },

      {
        name: "Voting",
        icon: <VotingIcon />,
        type: "voting",
      },
      {
        name: "Rating",
        icon: <RatingIcon />,
        type: "rating",
      },
      {
        name: "Date",
        icon: <DateIcon />,
        type: "date",
      },
      {
        name: "Time",
        icon: <TimeIcon />,
        type: "time",
      },
    ],
  },
  {
    groupName: "Media",
    childItems: [
      {
        name: "Image",
        icon: <ImageIcon />,
        type: "image",
      },
      {
        name: "Web",
        icon: <WebIcon />,
        type: "web",
      },
      {
        name: "PDF",
        icon: <PDFIcon />,
        type: "pdf",
      },
      {
        name: "Video",
        icon: <TabsIcon />,
        type: "video",
      },
      {
        name: "Audio",
        icon: <AudioIcon />,
        type: "audio",
      },
      {
        name: "Avatar",
        icon: <AvatarIcon />,
        type: "avatar",
      },
      {
        name: "CSV",
        icon: <CSVIcon />,
        type: "csv",
      },
    ],
  },
] as TToolboxGroup[]

const MainLayout: React.FC<LayoutProps> = ({
  components,
  layout,
  updatePageProps,
}) => {
  const refTree = React.useRef<any>({})
  const [currentItem, setCurrentItem] = React.useState<string>()
  const [forceReload, setForceReload] = React.useState<boolean>(false)
  const [formData, setFormData] = React.useState<TFormItemProps[]>(
    components ?? []
  )
  const [formDataLayout, setFormDataLayout] = React.useState<
    TFormItemLayoutProps[]
  >(layout ?? [])

  React.useEffect(() => {
    refTree.current = keyBy(flattenNestedArray(formDataLayout), "id")
  }, [formDataLayout])

  React.useEffect(() => {
    updatePageProps(formData, formDataLayout)
  }, [formDataLayout, formData])

  const activeFromItem = useMemo(
    () => find(formData, (form) => form.id === currentItem) as TFormItemProps,
    [currentItem, forceReload]
  )

  const handleFormUpdate = (data: TFormItemProps[]) => {
    setFormData(data)
  }

  const handleItemSelected = (item: TToolbox) => {
    const id = "llm_" + genShortUID()
    const newItemData = {
      id,
      type: item.type,
      ...(item.type === "tabs"
        ? { options: { tabs: cloneDeep(tabTemplate) } }
        : {}),
      ...(item.type === "grid"
        ? { options: { columns: cloneDeep(gridTemplate) } }
        : {}),
      ...(item.type === "divider"
        ? { options: cloneDeep(commonWithInfoTemplate) }
        : {}),
      ...(item.type === "button_primary"
        ? { options: cloneDeep(buttonTemplate) }
        : {}),
      ...(item.type === "button_outline"
        ? { options: cloneDeep(buttonTemplate) }
        : {}),
      ...(item.type === "text_input"
        ? { options: cloneDeep(textInputTemplate) }
        : {}),
      ...(item.type === "text_area"
        ? { options: cloneDeep(textAreaTemplate) }
        : {}),
      ...(item.type === "number" ? { options: cloneDeep(numberTemplate) } : {}),
      ...(item.type === "code" ? { options: cloneDeep(codeTemplate) } : {}),
      ...(item.type === "paragraph"
        ? { options: cloneDeep(paragraphTemplate) }
        : {}),
      ...(item.type === "markdown"
        ? { options: cloneDeep(markdownTemplate) }
        : {}),
      ...(item.type === "select" ? { options: cloneDeep(selectTemplate) } : {}),
      ...(item.type === "slider" ? { options: cloneDeep(sliderTemplate) } : {}),
      ...(item.type === "check_box"
        ? { options: cloneDeep(checkboxTemplate) }
        : {}),
      ...(item.type === "radio" ? { options: cloneDeep(radioTemplate) } : {}),
      ...(item.type === "voting" ? { options: cloneDeep(votingTemplate) } : {}),
      ...(item.type === "rating" ? { options: cloneDeep(ratingTemplate) } : {}),
      ...(item.type === "date" ? { options: cloneDeep(dateTemplate) } : {}),
      ...(item.type === "time" ? { options: cloneDeep(timeTemplate) } : {}),
      ...(item.type === "image" ? { options: cloneDeep(imageTemplate) } : {}),
      ...(item.type === "web" ? { options: cloneDeep(webTemplate) } : {}),
      ...(item.type === "pdf" ? { options: cloneDeep(pdfTemplate) } : {}),
      ...(item.type === "video" ? { options: cloneDeep(videoTemplate) } : {}),
      ...(item.type === "audio" ? { options: cloneDeep(audioTemplate) } : {}),
      ...(item.type === "avatar" ? { options: cloneDeep(avatarTemplate) } : {}),
      ...(item.type === "csv" ? { options: cloneDeep(csvTemplate) } : {}),
    } as TFormItemProps
    setFormData((formData) => concat(formData, [newItemData]))
    setFormDataLayout((formData) =>
      concat(formData, [
        {
          id: newItemData.id,
          type: newItemData.type,
          children:
            newItemData.type === "tabs"
              ? (newItemData.options.tabs as unknown as TFormItemLayoutProps[])
              : newItemData.type === "grid"
              ? (newItemData.options
                  .columns as unknown as TFormItemLayoutProps[])
              : [],
        },
      ])
    )
    setCurrentItem(id)
  }

  const handleClickedItem = (id: string) => {
    setCurrentItem(id)
  }

  const handleUpdateItem = (item: TFormItemProps) => {
    setFormData((data) => {
      const updateId = data.findIndex((o) => o.id === item.id)
      if (updateId !== -1) {
        const newObj = Array.from(data)
        newObj[updateId] = item
        return newObj
      }
      return data
    })
    if (item.type === "tabs") {
      const currentLayoutTab = get(
        formDataLayout,
        refTree.current[item.id].path
      )
      if (currentLayoutTab.children.length > (item.options.tabs?.length ?? 0)) {
        const newLayout = cloneDeep(formDataLayout)
        const removeItems = Object.keys(
          keyBy(
            differenceBy(
              currentLayoutTab.children,
              item.options.tabs ?? [],
              "id"
            ),
            "id"
          )
        )
        const newItems = currentLayoutTab.children.filter(
          (i) => removeItems.indexOf(i.id) === -1
        )
        set(newLayout, refTree.current[item.id].path, {
          ...currentLayoutTab,
          children: newItems,
        })
        setFormDataLayout(newLayout)
      }
      if (currentLayoutTab.children.length < (item.options.tabs?.length ?? 0)) {
        const newItems = differenceBy(
          item.options.tabs ?? [],
          currentLayoutTab.children,
          "id"
        )
        if (newItems.length > 0) {
          const newLayout = cloneDeep(formDataLayout)
          set(newLayout, refTree.current[item.id].path, {
            ...currentLayoutTab,
            children: currentLayoutTab.children.concat(
              newItems.map((n) => ({
                id: n.id,
                type: "tab",
                children: [],
              }))
            ),
          })
          setFormDataLayout(newLayout)
        }
      }
    }
    if (item.type === "grid") {
      const currentLayoutTab = get(
        formDataLayout,
        refTree.current[item.id].path
      )
      if (
        currentLayoutTab.children.length > (item.options.columns?.length ?? 0)
      ) {
        const newLayout = cloneDeep(formDataLayout)
        const removeItems = Object.keys(
          keyBy(
            differenceBy(
              currentLayoutTab.children,
              item.options.columns ?? [],
              "id"
            ),
            "id"
          )
        )
        const newItems = currentLayoutTab.children.filter(
          (i) => removeItems.indexOf(i.id) === -1
        )
        set(newLayout, refTree.current[item.id].path, {
          ...currentLayoutTab,
          children: newItems,
        })
        setFormDataLayout(newLayout)
      }
      if (
        currentLayoutTab.children.length < (item.options.columns?.length ?? 0)
      ) {
        const newItems = differenceBy(
          item.options.columns ?? [],
          currentLayoutTab.children,
          "id"
        )
        if (newItems.length > 0) {
          const newLayout = cloneDeep(formDataLayout)
          set(newLayout, refTree.current[item.id].path, {
            ...currentLayoutTab,
            children: currentLayoutTab.children.concat(
              newItems.map((n) => ({
                id: n.id,
                type: "grid",
                children: [],
              }))
            ),
          })
          setFormDataLayout(newLayout)
        }
      }
    }
    setForceReload((f) => !f)
    resetServerContext()
  }

  const handleDuplicateItem = (id: string) => {
    const cloneItem = cloneDeep(find(formData, (d) => d.id === id))
    const newId = "llm_" + genShortUID()
    setFormData((formData) =>
      concat(formData, [{ ...cloneItem, id: newId } as TFormItemProps])
    )
    setFormDataLayout((formLayout) =>
      concat(formLayout, [{ id: newId, type: cloneItem?.type, children: [] }])
    )
    setCurrentItem(newId)
  }

  const handleDeleteItem = (id: string) => {
    const index = formData.findIndex((f) => f.id === id)
    const prevItem = formData[index - 1]?.id
    setFormData((data) => data.filter((d) => d.id != id))
    setFormDataLayout((data) => {
      return filterChildArray(data, id) as TFormItemLayoutProps[]
    })
    if (prevItem) setCurrentItem(prevItem)
    else if (formData.length > 0) setCurrentItem(formData[0].id)
    setForceReload((f) => !f)
    resetServerContext()
  }

  const handleOrderList = (newFormLayout: TFormItemLayoutProps[]) => {
    setFormDataLayout(newFormLayout)
    setForceReload((f) => !f)
    resetServerContext()
  }

  // console.log(JSON.stringify(formData))
  // console.log(JSON.stringify(formDataLayout))
  // console.log({ formDataLayout })

  return (
    <div className="llm-editor-layout">
      <SideBar text="Components">
        {toolItems.map((group) => (
          <ExpandList headerText={group.groupName}>
            {group.childItems.map((item, index) => (
              <ToolBoxItem
                key={`toolbox-${index}`}
                icon={item.icon}
                text={item.name}
                onClick={() => {
                  handleItemSelected(item)
                }}
              />
            ))}
          </ExpandList>
        ))}
      </SideBar>
      <MainBody
        formData={formData}
        formDataLayout={formDataLayout}
        // onUpdate={handleFormUpdate}
        onClickItem={handleClickedItem}
        onUpdateBaseItem={handleUpdateItem}
        onReOrderList={handleOrderList}
        forceReload={forceReload}
      />
      <SideBar text="Properties" iconPosition={"left"}>
        {formData.length > 0 && (
          <PropertiesBox
            currentItem={activeFromItem}
            onDuplicateItem={handleDuplicateItem}
            onDeleteItem={handleDeleteItem}
            onUpdateBaseItem={handleUpdateItem}
          />
        )}
      </SideBar>
    </div>
  )
}

export default MainLayout
