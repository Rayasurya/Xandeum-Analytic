import { ChangeEvent, memo, useEffect, useState } from "react";
import { IconClear, IconUploadFileSm } from "@/assets/icons/Index";
import "./Upload.scss";

type TUploadProps = {
  filePreview?:  string;
  iconUpload?: JSX.Element;
  name?: string;
  accept?: "image/*" | ".csv" | ".pdf" | ".doc" | ".docx" | ".zip,.zar,application/zip,application/x-zip-compressed,application/octet-stream";
  isUploadSuccess?: boolean;
  onUpload?: (data: File, base64: string) => void;
  clearFile?: () => void;
  describe?: string;
  className?: string;
};

const MemoizedUpload = (props: TUploadProps) => {
  const {
    filePreview,
    iconUpload = <IconUploadFileSm />,
    name,
    accept = "image/*",
    isUploadSuccess,
    clearFile,
    onUpload,
    describe,
    className,
  } = props;
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const handleImageChange = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      const fileResult = reader.result as string;
      setPreviewURL(fileResult);
      onUpload && onUpload(selectedFile, fileResult);
    };
    if (accept === "image/*") {
      reader.readAsDataURL(selectedFile);
    } else {
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      handleImageChange(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleImageChange(selectedFile);
    }
  };

  const clearImage = () => {
    clearFile && clearFile();
    setFile(null);
    setPreviewURL(null);
  };

  useEffect(() => {
    if (filePreview) {
      setPreviewURL(filePreview);
    }
    if (isUploadSuccess) {
      setFile(null);
      setPreviewURL(null);
    }
  }, [filePreview, isUploadSuccess]);

  return (
    <div
      className={`c-upload ${className ?? ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
    >
      {file ? (
        <div className="c-upload__list">
          <div className="c-upload__item">
            {accept === "image/*" ? (
              <img src={previewURL || ""} alt="Uploaded Preview" />
            ) : (
              <span> {file.name} </span>
            )}
            <button className="c-upload--clear" onClick={clearImage}>
              <IconClear />
            </button>
          </div>
        </div>
      ) : (
        <div className="c-upload--action">
          <input
            className="c-upload__input"
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            name={name}
          />
          {iconUpload}
          <span className="c-upload__label">
            Drag & Drop or <strong>Choose file</strong> to upload
          </span>
          {describe && <span className="c-upload__describe">{describe}</span>}
        </div>
      )}
    </div>
  );
};

const Upload = memo(MemoizedUpload);

export default Upload;
