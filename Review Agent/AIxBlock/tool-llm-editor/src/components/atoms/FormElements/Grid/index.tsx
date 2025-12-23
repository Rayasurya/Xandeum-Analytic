import React from "react"
import "./index.scss"
import { TFormGridProps } from "../../../../common/types"
import { Droppable } from "react-beautiful-dnd"

type TProps = {
  formItem?: TFormGridProps
  onUpdateTabs?: (data: TFormGridProps) => void
  children?: (gridId: string) => JSX.Element[]
  isDragging?: boolean
  isPreview?: boolean
}

const FormGrid: React.FC<TProps> = ({
  formItem,
  children,
  isDragging,
  isPreview = false,
}) => {
  const columns = React.useMemo(
    () => formItem?.options?.columns ?? [],
    [formItem]
  )
  if (isPreview)
    return (
      <div className="llm-grid-view">
        {columns.map((column, index) => {
          return (
            <div
              key={`column-${formItem?.id}-${column.id}`}
              className="llm-grid-view__item"
              style={{
                width: `${100 / (12 / column.size)}%`,
              }}
            >
              {children?.(column.id)}
            </div>
          )
        })}
      </div>
    )
  return (
    <div className="llm-grid-view">
      {columns.map((column, index) => {
        return (
          <Droppable
            droppableId={`grid-${formItem?.id}|${column.id}`}
            key={`grid-${formItem?.id}|${column.id}`}
            {...(isDragging && { isDropDisabled: false })}
          >
            {(p, s) => {
              return (
                <div
                  ref={p.innerRef}
                  {...p.droppableProps}
                  key={`column-${formItem?.id}-${column.id}`}
                  className="llm-grid-view__item"
                  style={{
                    width: `${100 / (12 / column.size)}%`,
                    backgroundColor: s.isDraggingOver ? "#dedeec" : "#fff",
                  }}
                >
                  {children?.(column.id)}
                  {p.placeholder}
                </div>
              )
            }}
          </Droppable>
        )
      })}
    </div>
  )
}
export default FormGrid
