import { Suspense, lazy, useState } from "react";
import { useGetExportData } from "@/hooks/project/export/useGetExportData";
import FormatDataExport from "./FormatDataExport";
import "./Index.scss";
import { useApi } from "@/providers/ApiProvider";
import DownloadSource from "./DownloadSource";
import Button from "@/components/Button/Button";
import { useExportData } from "@/hooks/project/export/useExportData";
import { SelectOption } from "@/components/Select/Select";
import { infoDialog } from "@/components/Dialog";
import CustomFormat from "./CustomFormat";
const Spin = lazy(() => import("@/components/Spin/Spin"));

type TExportDialogProps = {
  pjId: number;
  dataTypes: Record<string, string>;
};

const OPTS_ENUM = {
  1: "opt1",
  2: "opt2",
  3: "opt3",
};

const ExportDialog = (props: TExportDialogProps) => {
  const api = useApi();
  const [optSelected, setOptionSelected] = useState("opt1");
  const { formats } = useGetExportData(props.pjId);
  const { loading, error, proceedExport } = useExportData();
  const [ currentFormat, setCurrentFormat ] = useState<SelectOption | null>({
    label: "JSON",
    value: "JSON"
  });

  const handleExportData = (id: number, exportType: string) => {
    if (!id || !exportType) return;
    infoDialog({message: "Please wait while your dataset is being generated. We will inform you via email once it's done."});
    proceedExport(id, exportType);
  }

  return (
    <div className="c-export-formats">
      <Suspense>
        <Spin loading={loading} />
      </Suspense>
      {error && <span className="msg-error">{error}</span>}
      <div className="c-export-formats__options">
        <button
          className={`c-export-formats__opt-item formats-item ${
            optSelected === OPTS_ENUM[1] ? "selected" : ""
          }`}
          onClick={() => setOptionSelected(OPTS_ENUM[1])}
        >
          <div className="ls-formats__name">Download zip to computer</div>
        </button>
        <button
          className={`c-export-formats__opt-item formats-item ${
            optSelected === OPTS_ENUM[2] ? "selected" : ""
          }`}
          onClick={() => setOptionSelected(OPTS_ENUM[2])}
        >
          <div className="ls-formats__name">Show download code</div>
        </button>
        <button
          className={`c-export-formats__opt-item formats-item ${
            optSelected === OPTS_ENUM[3] ? "selected" : ""
          }`}
          onClick={() => setOptionSelected(OPTS_ENUM[3])}
        >
          <div className="ls-formats__name">Custom format</div>
        </button>
      </div>
      {optSelected === OPTS_ENUM[1] && (
        <div className="c-export-formats__opt1">
          <FormatDataExport
            availableFormats={formats ?? []}
            selected={currentFormat?.value ?? "JSON"}
            onSelectType={(val) => setCurrentFormat({label: val.title , value: val.name})}
          />
          <div className="c-export-formats__opt1-action">
            <Button
              onClick={() => handleExportData(props.pjId, currentFormat?.value ?? "")}
              className="c-export-formats__opt1--export"
            >
              Export
            </Button>
          </div>
        </div>
      )}
      {optSelected === OPTS_ENUM[2] && (
        <DownloadSource
          token={api.getCsrfToken()}
          currentFormat={currentFormat ?? {label: '', value: 'JSON'}}
          pjId={props.pjId.toString()}
          availableFormats={formats ?? []}
          onSelectType={(val) => setCurrentFormat(val)}
        />
      )}
      {optSelected === OPTS_ENUM[3] && (
        <CustomFormat dataTypes={props.dataTypes} />
      )}
    </div>
  );
};

export default ExportDialog;
