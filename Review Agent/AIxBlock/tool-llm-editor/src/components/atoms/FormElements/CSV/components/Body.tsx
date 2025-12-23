import React from "react"
import Row, { TRowProps } from "./Row"

type CellValueType = {}

type TBodyProps = {
  rows?: string[][]
}

const Body: React.FC<TBodyProps> = ({ rows = [] }) => {
  return (
    <>
      {rows.length &&
        rows.map((row, i) => (
          <Row
            cells={row}
            row={i}
            key={"row-" + i}
            isLastRow={i === rows.length - 1}
          />
        ))}
    </>
  )
}

export default Body
