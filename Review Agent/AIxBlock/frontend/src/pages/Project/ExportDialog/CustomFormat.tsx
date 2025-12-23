import React from "react";
import {JsonEditor} from "json-edit-react";
import "./CustomFormat.scss";
import Button from "@/components/Button/Button";
import { useApi } from "@/providers/ApiProvider";

export type TProps = {
  dataTypes: Record<string, any>;
  pjId: number;
}

const TASK_FIELDS = [
  "id",
  "created_at",
  "updated_at",
  "reviewed_by",
  "reviewed_result",
  "is_in_review",
  "qualified_by",
  "qualified_result",
  "id_in_qc",
]

export default function CustomFormat({ dataTypes, pjId }: TProps) {
  const [format, setFormat] = React.useState<object>({});
  const api = useApi();

  const addDataType = React.useCallback((dt: string) => {
    setFormat(f => ({...f, [dt]: "{{$" + dt + "}}"}))
  }, []);

  React.useEffect(() => {
    const list: Record<string, string> = {};

    Object.keys(dataTypes).forEach(dt => {
      list[dt] = "{{$" + dt + "}}";
    });

    setFormat({
      id: "{{$id}}",
      created_at: "{{$created_at}}",
      data: list,
      annotations: ["{{$annotations}}"],
    });
  }, [dataTypes]);
  const handleExport = async () => {
    try {
      const response = await api.call("exportCustomFormat", {
        params: {
          id: pjId.toString(),
        },
        body: {
          custom_format: format
        }
      });
      // Handle response, e.g., show a success message or handle data
      console.log("Export successful:", response);
    } catch (error) {
      // Handle error, e.g., show an error message
      console.error("Export failed:", error);
    }
  };
  
  return (
    <div className="c-custom-export-format">
      <div className="data-group">Task fields</div>
      {TASK_FIELDS.map(f => {
        return (
          <span key={"task-field-" + f} className="data-type" onClick={() => addDataType(f)}>+ ${f}</span>
        );
      })}
      <div className="data-group">Data fields</div>
      {Object.keys(dataTypes).map(dt => {
        return (
          <span key={"data-key-" + dt} className="data-type" onClick={() => addDataType(dt)}>
            + ${dt} <em>[{dataTypes[dt]}]</em>
          </span>
        );
      })}
      <span key={"data-key-annotations"} className="data-type" onClick={() => addDataType("annotations")}>
        + $annotations <em>[Array]</em>
      </span>
      <div className="data-group">JSON structure editor</div>
      <JsonEditor
        data={format}
        setData={d => setFormat(d as object)}
        restrictDrag={false}
        maxWidth="100%"

      />
      <div className="custom-export-button">
        <Button type="gradient" onClick={handleExport} >
          Export
        </Button>
        {/* {error && <div className="error-message">{error}</div>} */}
      </div>
    </div>
  );
}
