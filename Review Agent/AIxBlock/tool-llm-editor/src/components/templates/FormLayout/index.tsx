import React from "react"

import { TFormItemLayoutProps, TFormItemProps } from "../../../common/types"
import FormPreview from "../../organisms/FormPreview"
import "./index.scss"

type LayoutProps = {
  components: TFormItemProps[]
  layout: TFormItemLayoutProps[]
  onFormSubmit?: (formData: any) => void
}

const FormLayout: React.FC<LayoutProps> = ({
  components,
  layout,
  onFormSubmit,
}) => {
  return (
    <div className="llm-preview-layout">
      <FormPreview
        components={components}
        layout={layout}
        onFormSubmit={onFormSubmit}
      />
    </div>
  )
}

export default FormLayout
