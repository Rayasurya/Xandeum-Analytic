import React from "react"

export type TCellPops = {
  id?: string
  defaultValue?: string
  editable?: boolean
  column?: number
  row?: number
  isLastRow?: boolean
  isLastCellOfRow?: boolean
  isLastCellOfTable?: boolean
  isHeader?: boolean
}

const Cell: React.FC<TCellPops> = ({
  id,
  defaultValue,
  editable = true,
  column,
  row,
  isLastRow,
  isLastCellOfRow,
  isLastCellOfTable,
}) => {
  const [value, setValue] = React.useState(defaultValue)

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <div
      key={id}
      className={`llm-csv-view__cell ${
        editable ? "llm-csv-view__row__editable" : "llm-csv-view__row__readonly"
      } ${row == -1 ? "header" : ""} ${column == -1 ? "first" : ""} ${
        isLastRow ? "last-row" : ""
      } ${isLastCellOfRow ? "last-cell-of-row" : ""} ${
        isLastCellOfTable ? "last-table-cell" : ""
      }`}
    >
      {column == -1 ? (
        <span>{value}</span>
      ) : (
        <input
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          value={value}
          readOnly={!editable}
          disabled={!editable}
        />
      )}
			{row == -1 && column !== -1 && <div className="resize-handle-v"></div>}
			{row !== -1 && column === -1 && <div className="resize-handle-h"></div>}
    </div>
  )
}

export default Cell
