import React from "react"
import { TFormItemLayoutProps, TFormItemProps } from "../../common/types"
import PreviewLayout, {
  TEnvVariable,
} from "../../components/templates/PreviewLayout"
import { TFromComponent } from "../EditorPage"
import "./index.scss"

type PageProps = {
  components: TFormItemProps[]
  layout: TFormItemLayoutProps[]
  environments: TEnvVariable[]
  code: string
  logResponse?: string
  runScript: (props: TFromComponent) => void
  updateEnvProps: (environments: TEnvVariable[], code: string) => void
}

const PreviewPage: React.FC<PageProps> = (props) => {
  const {
    logResponse,
    runScript,
    environments,
    code,
    updateEnvProps,
    components,
    layout,
  } = props
  return (
    <PreviewLayout
      components={components as TFormItemProps[]}
      layout={layout as unknown as TFormItemLayoutProps[]}
      environments={environments}
      code={code}
      logResponse={logResponse}
      runScript={runScript}
      updateEnvProps={updateEnvProps}
    />
  )
}

export default PreviewPage
