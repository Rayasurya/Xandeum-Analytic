import React, { /*createRef, useImperativeHandle, useMemo,*/ useRef } from "react"
import "./index.scss"
import MainLayout from "../../components/templates/MainLayout"
import { TFormItemLayoutProps, TFormItemProps } from "../../common/types"
import PreviewPage from "../PreviewPage"
import { TEnvVariable } from "../../components/templates/PreviewLayout"
import FormPage from "../FormPage"

export type TComponent = {
  id: string
  type: string
  children: TFormItemLayoutProps[]
}

export type TFromComponent = {
  components: TFormItemProps[]
  layout: TFormItemLayoutProps[]
  environments: TEnvVariable[]
  code: string
}

type PageProps = {
  type: "editor" | "preview" | "form"
  runScript: (props: TFromComponent) => void
  logResponse?: string
  onFormSubmit?: (formData: any) => void
	preloadData: TFromComponent
  onLayoutUpdate?: (props: TFromComponent) => void
}

const EditorPage: React.FC<PageProps> = (props) => {
  const {
    type = "editor",
    runScript,
    logResponse,
    preloadData,
    onFormSubmit,
		onLayoutUpdate
  } = props

  const [page, setPage] = React.useState<"editor" | "preview" | "form">(type)

  const formDataRef = useRef<TFromComponent>(preloadData)

  React.useEffect(() => {
    setPage(page)
    // setPageProps(formDataRef.current)
  }, [page, type])

  // const [pageProps, setPageProps] = React.useState<{
  //   components: TFormItemProps[]
  //   layout: TFormItemLayoutProps[]
  //   environments: TEnvVariable[]
  //   code: string
  // }>(preloadData)

  /*const loadPreview = (
    page: "editor" | "preview",
    components: TFormItemProps[],
    layout: TFormItemLayoutProps[]
  ) => {
    setPage(page)
    // setPageProps({ components, layout })
  }*/

  const updatePageProps = (
    components: TFormItemProps[],
    layout: TFormItemLayoutProps[]
  ) => {
		formDataRef.current = { ...formDataRef.current, components, layout }
		onLayoutUpdate?.(formDataRef.current)
  }
  const updateEnvProps = (environments: TEnvVariable[], code: string) => {
		formDataRef.current = { ...formDataRef.current, environments, code }
		onLayoutUpdate?.(formDataRef.current)
  }

  return (
    <div className="llm-editor-wrapper">
      {/* <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          padding: "12px",
          cursor: "pointer",
        }}
        onClick={() => {
          setPage(page == "editor" ? "preview" : "editor")
          setPageProps(formDataRef.current)
        }}
      >
        {page == "editor" ? "Switch Preview" : "Switch Editor"}
      </div> */}
      {page === "editor" ? (
        <MainLayout
          // {...pageProps}
          components={preloadData.components}
          layout={preloadData.layout}
          {...props}
          updatePageProps={updatePageProps}
        ></MainLayout>
      ) : page === "preview" ? (
        <PreviewPage
          components={preloadData.components}
          layout={preloadData.layout}
          environments={preloadData.environments}
          code={preloadData.code}
          runScript={runScript}
          logResponse={logResponse}
          updateEnvProps={updateEnvProps}
        />
      ) : (
        <FormPage
          components={preloadData.components}
          layout={preloadData.layout}
          onFormSubmit={onFormSubmit}
        />
      )}
    </div>
  )
}

export default EditorPage
