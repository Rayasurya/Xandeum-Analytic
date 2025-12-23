import CodeEditor from "@uiw/react-textarea-code-editor"
import React, { useCallback } from "react"
import Button from "../../Button"
import ToolTip from "../../Tooltip"
import "./index.scss"
import { TFormItemProps } from "../../../../common/types"
import { EditIcon } from "../../../../assets/icons"

type TProps = {
  formItem: TFormItemProps
  onUpdateData: (newData: TFormItemProps) => void
	isPreview?: boolean
}

const WebView: React.FC<TProps> = ({ formItem, onUpdateData }) => {
  const { options: formOptions } = formItem ?? {}
  const { label, showInfo, tooltip, url, sourceType, height, value } =
    formOptions ?? {}
  const [showModal, setShowModal] = React.useState(false)
  const [scrDocEditor, setScrDocEditor] = React.useState("")
  // React.useEffect(() => {
  //   if (sourceType === "code") {
  //     setShowModal(true)
  //   }
  // }, [sourceType])
  const handleUpdate = useCallback(() => {
    setShowModal(false)
    onUpdateData({
      ...formItem,
      ...{
        options: {
          ...formItem?.options,
          value: scrDocEditor,
        },
      },
    })
	}, [formItem, scrDocEditor])
	
  return (
    <div className="llm-webview-view">
      <div className="llm-webview-view__label__content">
        <div className="llm-webview-view__label">{label}</div>
        {showInfo && (
          <div className="llm-webview-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-webview-view__content">
        {sourceType === "url" ? (
          <>
            {!url ? (
              <span className="llm-webview-view__content__placeholder">
                Provide a Source URL in the component’s properties to see the
                website here
              </span>
            ) : (
              <iframe src={url} style={{ height: `${height}px` }} />
            )}
          </>
        ) : (
          <>
            <div
              className="llm-webview-view__content__edit-btn"
              onClick={() => {
                setShowModal(true)
                setScrDocEditor(value ?? "")
              }}
            >
              <EditIcon />
            </div>
            {value ? (
              <iframe srcDoc={value ?? ""} style={{ height: `${height}px` }} />
            ) : (
              <span className="llm-webview-view__content__placeholder">
                Enter your code to see its preview here
              </span>
            )}
          </>
        )}
      </div>
      {showModal && (
        <div className="llm-webview-view__modal__overlay">
          <div className="llm-webview-view__modal__wrapper">
            <div className="llm-webview-view__modal__header">Edit Code</div>
            <div className="llm-webview-view__modal__content">
              <CodeEditor
                value={scrDocEditor}
                language={"html"}
                {...{ "data-color-mode": "light" }}
                onChange={(e) => {
                  setScrDocEditor(e.target.value)
                }}
              ></CodeEditor>
            </div>
            <div className="llm-webview-view__modal__footer">
              <Button
                type="outline"
                text="Cancel"
                onClick={() => {
                  setScrDocEditor("")
                  setShowModal(false)
                }}
              />
              <Button type="primary" text="Save" onClick={handleUpdate} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default WebView
