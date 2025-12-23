import React from "react"
import {
  TFormGridProps,
  TFormGroupProps,
  TFormItemLayoutProps,
  TFormItemProps,
  TFormTabsProps,
} from "../../../common/types"
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
import "./index.scss"

type TProps = {
  components: TFormItemProps[]
	layout: TFormItemLayoutProps[]
  onFormSubmit?: (formData: any) => void
}

const FormPreview: React.FC<TProps> = ({ components, layout }) => {
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
                onUpdateTabs={() => {}}
                children={(tabId) => {
                  return renderChildList(tabId, item.children)
                }}
                isPreview={true}
              />
            )

          case "group":
            return (
              <FormGroup
                formItem={formItem as TFormGroupProps}
                onUpdateTabs={(newData) => {}}
                children={() => {
                  return renderChildList(null, item.children)
                }}
                isPreview={true}
              />
            )
          case "grid":
            return (
              <FormGrid
                formItem={formItem as TFormGridProps}
                isDragging={isDragging}
                onUpdateTabs={(newData) => {}}
                children={(tabId) => {
                  return renderChildList(tabId, item.children)
                }}
                isPreview={true}
              />
            )
          case "divider":
            return <FormDivider formItem={formItem} isPreview={true} />
          case "button_primary":
            return <FormPrimaryButton formItem={formItem} isPreview={true} />
          case "button_outline":
            return <FormOutlineButton formItem={formItem} isPreview={true} />
          case "text_input":
            return <FormInput formItem={formItem} isPreview={true} />
          case "text_area":
            return <FormTextArea formItem={formItem} isPreview={true} />
          case "number":
            return <FormNumber formItem={formItem} isPreview={true} />
          case "code":
            return <FormCodeViewer formItem={formItem} isPreview={true} />
          case "paragraph":
            return <FormParagraph formItem={formItem} isPreview={true} />
          case "markdown":
            return <FormMarkDown formItem={formItem} isPreview={true} />
          case "select":
            return <FormSelect formItem={formItem} isPreview={true} />
          case "slider":
            return <FormSlider formItem={formItem} isPreview={true} />
          case "check_box":
            return <FormCheckBox formItem={formItem} isPreview={true} />
          case "radio":
            return <FormRadio formItem={formItem} isPreview={true} />
          case "voting":
            return <FormVoting formItem={formItem} isPreview={true} />
          case "rating":
            return <FormRating formItem={formItem} isPreview={true} />
          case "date":
            return <FormDatePicker formItem={formItem} isPreview={true} />
          case "time":
            return <FormTimePicker formItem={formItem} isPreview={true} />
          case "image":
            return <FormImage formItem={formItem} isPreview={true} />
          case "web":
            return (
              <WebView
                formItem={formItem}
                onUpdateData={(newData) => {}}
                isPreview={true}
              />
            )
          case "pdf":
            return <PDFViewer formItem={formItem} isPreview={true} />
          case "video":
            return <VideoPlayer formItem={formItem} isPreview={true} />
          case "audio":
            return <AudioPlayer formItem={formItem} isPreview={true} />
          case "avatar":
            return <FormAvatar formItem={formItem} isPreview={true} />
          case "csv":
            return <CSVViewer formItem={formItem} isPreview={true} />
          default:
            return null
        }
      } else {
        return <></>
      }
    }

    return (
      <div onClick={(e) => {}}>{renderChild(components, formItemLayout)}</div>
    )
  }
  return (
    <div className={"llm-form-preview"}>
      {layout.map((layoutItem, index) => renderItem(layoutItem, index))}
    </div>
  )
}

export default FormPreview
