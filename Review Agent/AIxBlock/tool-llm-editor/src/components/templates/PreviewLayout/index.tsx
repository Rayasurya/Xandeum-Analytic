import CodeEditor from "@uiw/react-textarea-code-editor"
import React, { useCallback, useMemo } from "react"
import Split from "@uiw/react-split"

import { TFormItemLayoutProps, TFormItemProps } from "../../../common/types"
import Button from "../../atoms/Button"
import "./index.scss"
import {
  CloseIcon,
  PlayIcon,
  PlusIcon,
  ReloadIcon,
  TrashBinIcon,
} from "../../../assets/icons"
import { genShortUID } from "../../../util/uuid"
import TextInput from "../../atoms/TextInput"
import Checkbox from "../../atoms/Checkbox"
import { cloneDeep, set } from "lodash"
import { renderPythonTemplate } from "../../../util/code"
import FormPreview from "../../organisms/FormPreview"
import { TFromComponent } from "../../../features/EditorPage"

type LayoutProps = {
  components: TFormItemProps[]
  layout: TFormItemLayoutProps[]
  environments: TEnvVariable[]
  code: string
  logResponse?: string
  runScript: (props: TFromComponent) => void
  updateEnvProps: (environments: TEnvVariable[], code: string) => void
}

export type TEnvVariable = {
  id: string
  name: string
  value: string
  isSecured: boolean
}

const PreviewLayout: React.FC<LayoutProps> = ({
  components,
  layout,
  logResponse = ``,
  runScript,
  environments,
  code: codebase,
  updateEnvProps,
}) => {
  const [code, setCode] = React.useState(renderPythonTemplate(components))
  const [logConsole, setLogConsole] = React.useState(logResponse)
  const [tab, setTab] = React.useState(0)
  const [envVariables, setEnvVariables] = React.useState<TEnvVariable[]>(
    environments ?? []
  )
  const [modalShow, setModalShow] = React.useState(false)

  React.useEffect(() => {
    updateEnvProps(envVariables, code)
  }, [envVariables, code])

  const codeRebuild = useMemo(() => {
    let envsText = ""
    if (envVariables.length > 0) {
      envsText = "from environments import "
      envVariables.map((e) => {
        envsText = envsText + " " + e.name
      })
    }

    return code.replace("<ENV>", envsText)
  }, [code, envVariables])

  const handleRegenerate = () => {
    setModalShow(false)
    setLogConsole("")
  }
  const handleRunCode = () => {
    setLogConsole("")
    runScript({
      components: components,
      layout: layout,
      environments: envVariables,
      code: code,
    })
  }

  const handleOnChange = useCallback(
    (field: string, value: string | boolean, index: number) => {
      const newValue = {
        ...envVariables[index],
        ...{
          [field]: value,
        },
      }
      setEnvVariables((values) => {
        const newEnvValues = cloneDeep(values)
        newEnvValues[index] = newValue
        return newEnvValues
      })
    },
    [envVariables, setEnvVariables]
  )
  const handleRemoveItem = useCallback(
    (id: string) => {
      setEnvVariables((envs) => envs.filter((e) => e.id !== id))
    },
    [setEnvVariables]
  )

  const renderItem = (item: TEnvVariable, index: number) => {
    return (
      <div className="llm-preview-layout__variable-item" key={item.id}>
        <div className="llm-preview-layout__variable-row">
          <div
            className="llm-preview-layout__variable-item__remove"
            onClick={() => {
              handleRemoveItem(item.id)
            }}
          >
            <TrashBinIcon />
          </div>
        </div>
        <div className="llm-preview-layout__variable-row">
          <div className="llm-preview-layout__variable-column">
            <TextInput
              label="Name"
              value={item.name}
              required={true}
              onChange={(e) => {
                handleOnChange("name", e.target.value, index)
              }}
            />
          </div>
          <div className="llm-preview-layout__variable-column">
            <TextInput
              label="Value"
              value={item.value}
              type={item.isSecured ? "password" : "text"}
              onChange={(e) => {
                handleOnChange("value", e.target.value, index)
              }}
            />
            <Checkbox
              label="Secure"
              isChecked={item.isSecured}
              onChange={(isChecked) => {
                handleOnChange("isSecured", isChecked, index)
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  const handleAddNewVariable = useCallback(() => {
    const id = "llm_" + genShortUID()
    setEnvVariables((envVariables) =>
      envVariables.concat([
        {
          id,
          name: "",
          value: "",
          isSecured: false,
        },
      ])
    )
  }, [envVariables, setEnvVariables])
  return (
    <div className="llm-preview-layout">
      <Split
        renderBar={({ onMouseDown, ...props }) => {
          return (
            <div
              {...props}
              style={{ boxShadow: "none", backgroundColor: "transparent" }}
            >
              <div
                onMouseDown={onMouseDown}
                style={{
                  backgroundColor: "#dedeec",
                  boxShadow: "none",
                  width: "2px",
                }}
              >
                <div className="llm-preview-layout__split-indicator"></div>
              </div>
            </div>
          )
        }}
      >
        <div className="llm-preview-layout__form">
          <div className="llm-preview-layout__form__header">
            <div className="llm-preview-layout__form__action">
              <Button
                type="outline"
                className={tab === 0 ? "active" : ""}
                text="Preview"
                onClick={() => {
                  setTab(0)
                }}
              />
              <Button
                type="outline"
                className={tab === 1 ? "active" : ""}
                text="Variables"
                onClick={() => {
                  setTab(1)
                }}
              />
            </div>
          </div>
          <div className="llm-preview-layout__form__content">
            {tab === 0 ? (
              <FormPreview components={components} layout={layout} />
            ) : (
              <div className="llm-preview-layout__form__variables-box">
                {envVariables?.length === 0 ? (
                  <div className="llm-preview-layout__form__variables-box__placeholder">
                    <span>
                      There are no variables. Create a variable to view it here
                      and use it in your code
                    </span>
                  </div>
                ) : (
                  <div className="llm-preview-layout__form__variables-box">
                    {envVariables.map((item, index) => renderItem(item, index))}
                  </div>
                )}
                <div>
                  <Button
                    type={"outline"}
                    text={"Add Variables"}
                    icon={<PlusIcon />}
                    onClick={handleAddNewVariable}
                  ></Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="llm-preview-layout__code-view">
          <div className="llm-preview-layout__code-view__header">
            <div className="llm-preview-layout__code-view__title">
              Multimodal Custom Code Editor
            </div>
            <div className="llm-preview-layout__code-view__action">
              <Button
                type="outline"
                text="Regenerate"
                icon={<ReloadIcon />}
                onClick={() => {
                  setModalShow(true)
                }}
              />
              <Button
                type="primary"
                text="Run"
                icon={<PlayIcon />}
                onClick={handleRunCode}
              />
            </div>
          </div>
          <div className="llm-preview-layout__code-view__content">
            <CodeEditor
              value={codeRebuild}
              language={"python"}
              {...{ "data-color-mode": "light" }}
              onChange={(e) => {
                setCode(e.target.value)
              }}
            />
          </div>
          {logConsole && (
            <div className="llm-preview-layout__code-view__console">
              <div className="llm-preview-layout__code-view__console__header">
                <span>Console</span>
                <div
                  className="llm-preview-layout__code-view__console__close"
                  onClick={() => {
                    setLogConsole("")
                  }}
                >
                  <CloseIcon />
                </div>
              </div>
              <div className="llm-preview-layout__code-view__console__content">
                {logConsole}
              </div>
            </div>
          )}
        </div>
      </Split>
      {modalShow && (
        <div className="llm-preview-layout__modal-overlay">
          <div className="llm-preview-layout__modal-view">
            <div className="llm-preview-layout__modal-header">
              Regenerate Code
            </div>
            <div className="llm-preview-layout__modal-content">
              If you regenerate the code, it will replace your changes with a
              newly generated code based on your current UI components.
            </div>
            <div className="llm-preview-layout__modal-action">
              <Button
                type="outline"
                text="Cancel"
                onClick={() => {
                  setModalShow(false)
                }}
              />
              <Button
                type="primary"
                text="Regenerate"
                onClick={handleRegenerate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PreviewLayout
