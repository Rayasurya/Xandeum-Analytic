import React from "react"
import ToolTip from "../../Tooltip"
import Table from "./components/Table"
import { CSVToArray2 } from "./helper"
import "./index.scss"
import { TFormItemProps } from "../../../../common/types"

type TProps = {
  formItem: TFormItemProps
	isPreview?: boolean
}

const CSVViewer: React.FC<TProps> = ({
  formItem: { options: formOptions },
}) => {
  const { label, showInfo, tooltip, delimiter, value } = formOptions ?? {}

  // csvData = `,a,a,a\na,a,a,a\na,a,a,a\na,a,a,a`,
  const data = React.useMemo(() => {
    return CSVToArray2(value ?? "", delimiter)
  }, [value, delimiter])

  return (
    <div className="llm-csv-view">
      <div className="llm-csv-view__label__content">
        <div className="llm-csv-view__label">{label}</div>
        {showInfo && (
          <div className="llm-csv-view__info">
            <ToolTip text={tooltip ?? ""} />
          </div>
        )}
      </div>
      <div className="llm-csv-view__content">
        <Table data={data}></Table>
      </div>
    </div>
  )
}
export default CSVViewer
