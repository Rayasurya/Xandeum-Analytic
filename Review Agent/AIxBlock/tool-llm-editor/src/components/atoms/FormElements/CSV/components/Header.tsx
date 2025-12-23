import React from "react"
import Cell, { TCellPops } from "./Cell"
import { numberToLetters } from "../helper"

type THeaderProps = {
  size?: number
}

const Headers: React.FC<THeaderProps> = ({ size = 1 }) => {
  return (
    <div className={"llm-csv-view__header"}>
      <Cell
        defaultValue={""}
        column={-1}
        row={-1}
        key={`${-1}-${-1}`}
        isLastCellOfRow={false}
        isLastCellOfTable={false}
        editable={false}
      />
      {Array.from(Array(size).keys()).map((_cell, j) => (
        <Cell
          defaultValue={numberToLetters(j + 1)}
          row={-1}
          isHeader={true}
          key={``}
          column={j}
          isLastCellOfRow={j === size - 1}
          isLastCellOfTable={false}
          editable={false}
        />
      ))}
    </div>
  )
}

export default Headers
