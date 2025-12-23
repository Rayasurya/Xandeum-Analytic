import React, { useMemo, useRef, useState } from "react";
import { IconUploadFileLg } from "@/assets/icons/IconUploadFile";
import Button from "@/components/Button/Button";
import { infoDialog } from "@/components/Dialog";
import { TProjectModel } from "@/models/project";
import { useProjectContext } from "@/providers/ProjectProvider";
import LayoutSettings from "../LayoutSettings/Index";
import "./LocalUpload.scss";
import IconCirclePlus from "@/assets/icons/IconCirclePlus";
import { useNavigate } from "react-router-dom";
import { DATATYPE } from "../Index";

type TLocalUploadProps = {
  data?: TProjectModel | null;
  importDataType: DATATYPE;
};

const LocalUpload = (props: TLocalUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragCount = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importFiles, state, setNewValue} = useProjectContext();
  const navigate = useNavigate();

  const supportedFileTypes = useMemo(() => {
    if (!props.data) {
      return [];
    }

    if (props.data.supported_extensions.trim().length > 0) {
      return props.data.supported_extensions
        .trim()
        .split(",")
        .map(e => e.trim());
    }

    const typesBase: string[] = [".json", ".tsv", ".csv", ".txt"];

    let types: string[] = props.importDataType === DATATYPE.RAWDATA ? typesBase : [...typesBase, ".zip"];
    const dataTypes = Object.keys(props.data.data_types);

    dataTypes.forEach(t => {
      switch (t) {
        case "audio":
          types.push(".wav", ".aiff", ".mp3", ".au", ".flac", ".m4a", ".ogg", ".m4b");
          break;
        case "image":
          types.push(".jpg", ".png", ".gif", ".bmp", ".svg", ".webp");
          break;
        case "pcd":
          types.push(".pcd");
          break;
        case "pdf":
          types.push(".pdf");
          break;
        case "text":
          types.push(".pdf", ".jpg", ".png", ".gif", ".bmp", ".svg", ".webp");
          break;
        case "video":
          types.push(".mp4", ".h264", ".webm", ".webm*");
          break;
        default:
          break;
      }
    });

    if (props.importDataType === DATATYPE.DATASET){
      types = [".zip"]
      setNewValue("dataset")
    } else {
      types.push(".zip")
      setNewValue("raw_data")
    }

    return types;
  }, [props.data, props.importDataType, setNewValue]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    dragCount.current++;

    if (dragCount.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    dragCount.current--;

    if (dragCount.current === 0) {
      setIsDragging(false);
    }
  };

  const handleFileUpload = (files: FileList) => {
    const fileExtensions = Array.from(files).map((file) =>
      file.name.split(".").pop()
    );

    const unsupportedFiles = fileExtensions.filter(
      (extension) => !supportedFileTypes.includes(`.${extension}`)
    );

    if (unsupportedFiles.length > 0) {
      const unsupportedFileNames = unsupportedFiles.map(
        (extension) => `.${extension}`
      );
      infoDialog({
        message: `Unsupported file type: ${unsupportedFileNames.join(", ")}`,
      });
    } else {
      const newFiles = Array.from(files);
      importFiles(newFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;

    if (files && files.length > 0) {
      handleFileUpload(files);
    }

    dragCount.current = 0;
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const renderTable = () => {
    return (
      <div className="data-import-list__table">
        <div className="data-import__table-head">
          <div className="data-import__table-head-item">
            <p>File Name</p>
            <p>Status</p>
          </div>
        </div>
        <div className="data-import__table-content">
          {state.importedFiles.map((file, index) => (
            <div
              className="data-import__table-file"
              key={`key-${file.name}-${index}`}
            >
              {file.status === "fail" ? (
                <div className="data-import__table-text fail">
                  <span>{file.name}</span>
                  <span className="fail">{file.detail}</span>
                </div>
              ) : (
                <div className="data-import__table-text success">
                  <span>{file.name}</span>
                </div>
              )}
              <div
                className={`data-import__table-text status ${
                  file.status === "fail" ? "fail" : "success"
                }`}
              >
                <span>{file.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDefault = () => {
    return (
      <div className="c-localupload__text">
        <IconUploadFileLg />
        <div>
          <h2 className="c-localupload__title">Drag & drop files here</h2>
          <h2 className="c-localupload__title">or click to browse</h2>
        </div>
        <div>
          Supported file types: {supportedFileTypes.join(", ")}
        </div>
      </div>
    );
  };

  return (
    <div className="m-335">
      {!state.isImporting && (
        <div
          className={`m-308 c-localupload ${isDragging ? "dragging" : ""} ${
            state.isImporting ? "no-cursor" : ""
          }`}
          onClick={state.isImporting ? undefined : triggerFileInput}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragOver={(e) => {
            let event = e as unknown as Event;
            event.stopPropagation();
            event.preventDefault();
          }}
        >
          <div className="c-localupload__content">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept={supportedFileTypes.join(",")}
            />
            {state.uploadedFiles.length > 0
              ? state.error.length > 0 ? (
                  <div className="c-localupload__error">
                    <p>Error:{state.error}</p>
                  </div>
                ) : "Uploading..."
              : renderDefault()}
          </div>
        </div>
      )}
      {state.isImporting && (
        <div className="c-localupload-wrapper m-303">
          <div className="c-localupload-wrapper__upload-failed">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="d-none"
              accept={supportedFileTypes.join(",")}
            />
            <Button
              icon={<IconCirclePlus />}
              size="small"
              className="c-localupload__import-more data-import-list__upload-button"
              onClick={() => triggerFileInput()}
            >
              Import more files
            </Button>
            {renderTable()}
            <h4 className="c-localupload__file-title">
              {state.uploadedFiles.length !== state.importedFiles.length && (
                <span className="c-localupload__loading-spinner"></span>
              )}
            </h4>
          </div>
        </div>
      )}
      <LayoutSettings.Footer
        prevUrl={"/projects/" + props.data?.id + `/settings/workflow`}
        nextUrl={"/projects/" + props.data?.id + `/import/cloud`}
        onSkip={() => navigate("/projects/" + props.data?.id + `/import/cloud`)}
      />
    </div>
  );
};

export default LocalUpload;
