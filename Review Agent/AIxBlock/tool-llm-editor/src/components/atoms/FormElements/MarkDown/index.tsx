import React from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import MarkdownEditor from "@uiw/react-markdown-editor"
import "./index.scss"
import { TFormItemProps } from "../../../../common/types"
import ToolTip from "../../Tooltip"

type TProps = {
  formItem: TFormItemProps
  isPreview?: boolean
}

const modules = {
  toolbar: [
    [{ header: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["code", "code-block"],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
}
const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "code",
  "code-block",
]

const FormMarkDown: React.FC<TProps> = ({ formItem: { options } }) => {
  const { label, showInfo, tooltip, text, required } = options ?? {}
  const [value, setValue] = React.useState("")
  return (
    <div className="llm-markdown-view">
      <div className="llm-markdown-view__label__content">
        <div className="llm-markdown-view__label">
          {label ?? ""}
          {required ? <span>*</span> : null}
        </div>
        {showInfo && (
          <div className="llm-markdown-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-markdown-view__content" data-color-mode="light">
        <MarkdownEditor
          value={value}
          onChange={(value) => {
            setValue(value)
          }}
        />
        {/* <ReactQuill
          theme="snow"
          value={value}
          onChange={setValue}
          modules={modules}
          formats={formats}
        /> */}
      </div>
    </div>
  )
}
export default FormMarkDown
