import React from "react"
import Headers from "./Header"
import Body from "./Body"

export type TTableProps = {
  data: string[][]
}

const Table: React.FC<TTableProps> = ({ data = [] }) => {
  return (
    <div className={"llm-csv-view__table"}>
      <Headers size={data[0].length || 0} />
      <Body rows={data} />
    </div>
  )
}
export default Table
