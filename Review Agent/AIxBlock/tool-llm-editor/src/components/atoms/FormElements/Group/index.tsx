import React, { ReactNode } from "react"
import "./index.scss"
import { TFormGroupProps } from "../../../../common/types"
import { Droppable } from "react-beautiful-dnd"

type TProps = {
  formItem?: TFormGroupProps
  onUpdateTabs?: (data: TFormGroupProps) => void
  children?: () => JSX.Element[]
  isPreview?: boolean
}

const FormGroup: React.FC<TProps> = ({
  formItem,
  children,
  isPreview = false,
}) => {
  if (isPreview)
    return (
      <div className="llm-group-view">
        {children?.()}
      </div>
    )
  return (
    <Droppable
      droppableId={`group-panel-${formItem?.id}`}
      key={`group-panel-${formItem?.id}`}
    >
      {(p) => (
        <div className="llm-group-view" ref={p.innerRef} {...p.droppableProps}>
          {children?.()}
          {p.placeholder}
        </div>
      )}
    </Droppable>
  )
}
export default FormGroup
