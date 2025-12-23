import React from "react"
import Cell, { TCellPops } from "./Cell"

export type TRowProps = {
  row?: number
  cells: string[]
  isLastRow?: boolean
}

const Row: React.FC<TRowProps> = ({ row, cells, isLastRow }) => {
  return (
    <div className={"llm-csv-view__row"}>
      <Cell
        defaultValue={`${(row ?? 0) + 1}`}
        column={-1}
        row={row}
        key={`${row}-${-1}`}
        isLastRow={isLastRow}
        isLastCellOfRow={false}
        isLastCellOfTable={false}
        editable={false}
      />
      {cells.length
        ? cells.map((cell, j) => (
            <Cell
              defaultValue={cell}
              column={j}
              row={row}
              key={`${row}-${j}`}
              isLastRow={isLastRow}
              isLastCellOfRow={j === cells.length - 1}
              isLastCellOfTable={isLastRow && j === cells.length - 1}
            />
          ))
        : "..."}
    </div>
  )
}

export default Row
