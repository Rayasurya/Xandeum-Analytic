import React from "react"
import { TFormItemLayoutProps, TFormItemProps } from "../../common/types"
import FormLayout from "../../components/templates/FormLayout"
import "./index.scss"

type PageProps = {
  components: TFormItemProps[]
  layout: TFormItemLayoutProps[]
  onFormSubmit?: (formData: any) => void
}

const FormPage: React.FC<PageProps> = (props) => {
  const { components, layout, onFormSubmit } = props
  return (
    <FormLayout
      components={components as TFormItemProps[]}
      layout={layout as unknown as TFormItemLayoutProps[]}
      onFormSubmit={onFormSubmit}
    />
  )
}

export default FormPage
