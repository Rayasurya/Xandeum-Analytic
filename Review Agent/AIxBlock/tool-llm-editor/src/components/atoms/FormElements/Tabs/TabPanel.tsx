import React from "react"
import "./index.scss"
import { TabPanelProps } from "./types" // Import types
import { Droppable } from "react-beautiful-dnd"

const TabPanel: React.FC<TabPanelProps> = ({
  id,
  children,
  isPreview = false,
}) => {
  if (isPreview)
    return <div className="llm-tabs-view__tab-panel">{children}</div>
  return (
    <Droppable droppableId={`tab-panel-${id}`} key={`tab-panel-${id}`}>
      {(p) => (
        <div
          className="llm-tabs-view__tab-panel"
          ref={p.innerRef}
          {...p.droppableProps}
        >
          {children}
          {p.placeholder}
        </div>
      )}
    </Droppable>
  )
}

export default TabPanel
