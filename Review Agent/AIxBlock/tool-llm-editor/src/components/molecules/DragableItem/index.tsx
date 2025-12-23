import React, { ReactNode } from "react"
import "./index.scss"
import { DragIcon } from "../../../assets/icons"
import { Draggable } from "react-beautiful-dnd"

type TProps = {
  renderChild: (isDragging: boolean) => ReactNode
  id?: string
  isActive?: boolean
  index: number
}

const DragableItem: React.FC<TProps> = ({ renderChild, id, isActive, index }) => {
  const [isDragDisabled, setIsDragDisabled] = React.useState(true)
  const onMouseIn = () => {
    setIsDragDisabled(false)
  }
  const onMouseOut = () => {
    setIsDragDisabled(true)
  }

  return (
    <Draggable
      draggableId={id ?? ""}
      index={index}
      key={id ?? ""}
			isDragDisabled={isDragDisabled}
    >
			{(provided, snapshot) => {
        return (
          <div
            className={`llm-dragable-item ${
              (snapshot.isDragging || isActive) && "active"
            }`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
						
          >
            <div
              className="llm-dragable-item__dragger"
              onMouseOver={onMouseIn}
              onMouseLeave={onMouseOut}
            >
              <DragIcon />
            </div>
            <div className="llm-dragable-item__drag-content">{renderChild(snapshot.isDragging)}</div>
          </div>
        )
      }}
    </Draggable>
  )
}

export default DragableItem
