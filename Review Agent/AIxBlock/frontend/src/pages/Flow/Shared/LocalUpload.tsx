import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import IconCircleChecked from "@/assets/icons/IconCircleChecked";
import { IconCircleClose, IconUploadFileLg } from "@/assets/icons/Index";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import { TProjectModel } from "@/models/project";
import styles from "./LocalUpload.module.scss";
import PopupWithCollapse from "./Upload/PopoverUpload";
import {TPageFlowProvider} from "../FlowProvider";
import {parseLabels} from "@/utils/labelConfig";
import Button from "@/components/Button/Button";
import {downloadFile} from "@/utils/downloadFile";
import {formatBytes} from "@/utils/customFormat";
import {randomString} from "@/utils/random";
import {useCentrifuge} from "@/providers/CentrifugoProvider";
import useDebouncedEffect from "@/hooks/useDebouncedEffect";

type TLocalUploadProps = {
  project: TProjectModel | null;
  hasFileUpload?: () => void;
  refreshProject?: TPageFlowProvider["refreshProject"],
}

type TUploadFile = {
  name: string;
  id: string;
  status: "success" | "fail" | "uploading" | "new";
  progress: number;
  error?: string;
  detail?: string;
  file: File | null;
};

export default function LocalUpload({project, hasFileUpload, refreshProject}: TLocalUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [filesUpload, setFilesUpload] = useState<TUploadFile[]>([]);
  const dragCount = useRef(0);
  const [isOpenPopover, setOpenPopover] = useState<boolean>(false);
  const uploadingIndexRef = useRef<number[]>([]);
  const currentUploadController = useRef<AbortController | null>(null);
  const refreshProjectTimeout = useRef<NodeJS.Timeout>();
  const publishChannel = useRef(randomString());
  const {onMessage} = useCentrifuge();

  const example = useMemo(() => {
    if (!project?.label_config) {
      return null;
    }

    const {example} = parseLabels(project.label_config);
    return example?.replaceAll("&lt;", "<").replaceAll("&gt;", ">") ?? null;
  }, [project?.label_config]);

  const supportedFileTypes = useMemo(() => {
    if (!project) {
      return [];
    }

    if (project.supported_extensions.trim().length > 0) {
      return project.supported_extensions
        .trim()
        .split(",")
        .map(e => e.trim());
    }

    // let types: string[] = [];
    let types: string[] = [".json"];
    const dataTypes = Object.keys(project.data_types);

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
          // types.push(".pdf", ".jpg", ".png", ".gif", ".bmp", ".svg", ".webp");
          types.push(".tsv", ".csv", ".txt");
          break;
        case "video":
          types.push(".mp4", ".h264", ".webm", ".webm*");
          break;
        default:
          break;
      }
    });

    types = Array.from(new Set(types));

    return types;
  }, [project]);

  const debouncedRefreshProject = useCallback((showLoading: boolean) => {
    clearTimeout(refreshProjectTimeout.current);

    refreshProjectTimeout.current = setTimeout(() => {
      refreshProject?.(showLoading);
    }, 1000);
  }, [refreshProject]);

  const importFiles = useCallback(async (index: number, file: TUploadFile) => {
    if (!file || !file.file) {
      return;
    }

    uploadingIndexRef.current.push(index);

    setFilesUpload(prev => {
      const updatedFiles = [ ...prev ];
      updatedFiles[index] = {
        ...updatedFiles[index],
        status: "uploading",
      };
      return updatedFiles;
    });

    const xhr = new XMLHttpRequest();

    const abortXhr = () => {
      xhr.abort();
    }

    try {
      setIsUploading(uploadingIndexRef.current.length > 0);

      await new Promise((resolve, reject) => {
        if (!file || !file.file) {
          resolve(void 0);
          return;
        }

        xhr.open("POST", `${window.APP_SETTINGS.hostname}api/projects/${project?.id}/import`, true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setFilesUpload(prev => {
              const updatedFiles = [ ...prev ];
              updatedFiles[index] = {
                ...updatedFiles[index],
                progress: (event.loaded / event.total) * 100,
              };
              return updatedFiles;
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status <= 299) {
            if (currentUploadController.current?.signal.aborted) {
              return;
            }

            uploadingIndexRef.current = uploadingIndexRef.current.filter(idx => idx !== index);

            setFilesUpload(prev => {
              const updatedFiles = [ ...prev ];
              updatedFiles[index] = {
                ...updatedFiles[index],
                status: "success",
                file: null,
              };
              return updatedFiles;
            });

            resolve(void 0);
          } else {
            reject(new Error("Failed to upload file. Status code: " + xhr.status));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Failed to upload file"));
        };

        xhr.onabort = () => {
          reject(new Error("Cancelled"));
        };

        currentUploadController.current?.signal.addEventListener('abort', abortXhr);
        const formData = new FormData();
        formData.append("file", file.file);
        formData.append("type_import", "raw_data");
        formData.append("publish_channel", publishChannel.current);
        formData.append("upload_file_id", file.id);
        xhr.send(formData);

        debouncedRefreshProject(false);
      });
    } catch (e) {
      if (currentUploadController.current?.signal.aborted) {
        return;
      }

      if (window.APP_SETTINGS.debug) {
        console.error(e);
      }

      uploadingIndexRef.current = uploadingIndexRef.current.filter(idx => idx !== index);

      setFilesUpload(prev => {
        const updatedFiles = [ ...prev ];
        updatedFiles[index] = {
          ...updatedFiles[index],
          status: "fail",
          error: (e as Error)?.message ?? "(Unknown error)",
        };
        return updatedFiles;
      });
    } finally {
      setIsUploading(uploadingIndexRef.current.length > 0);
      currentUploadController.current?.signal.removeEventListener('abort', abortXhr);
    }
  }, [project?.id, debouncedRefreshProject]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    dragCount.current++;

    if (dragCount.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    dragCount.current--;

    if (dragCount.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleFileUpload = useCallback((files: FileList) => {
    const fileExtensions = Array.from(files).map((file) =>
      file.name.split(".").pop()?.toLowerCase()
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
      const newFiles: TUploadFile[] = Array.from(files).map(file => ({
        id: randomString(),
        name: file.name,
        status: "new",
        progress: 0,
        file,
      }));
      setFilesUpload((prev) => [...prev, ...newFiles]);
    }

    hasFileUpload?.();
  }, [hasFileUpload, /*importFiles,*/ supportedFileTypes]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;

    if (files && files.length > 0) {
      handleFileUpload(files);
    }

    dragCount.current = 0;
  }, [handleFileUpload]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      handleFileUpload(files);
    }

    e.target.value = "";
  }, [handleFileUpload]);

  const filesList = useMemo(() => {
    return (
      <div className={styles.list}>
        <div className={styles.listContent}>
          {filesUpload.map((file, index) => file && (
            <div
              className={`${styles.listFile} ${file.status === "uploading" ? styles.listFileWithProgress : ""}`}
              key={`key-${file.name}-${index}`}
            >
              {file.status === "fail" ? (
                <div className={styles.listTextFail}>
                  <span className={styles.listText}>
                    {file.name}
                  </span>
                  <div className={styles.failReason}>{file.error}</div>
                </div>
              ) : (
                <span className={styles.textLabel}>{file.name}</span>
              )}
              {file.status !== "uploading" && file.status !== "new" &&
                <div
                  className={`
                    ${styles.listText} 
                    ${file.status === "fail" ? styles.listTextStatusFail : styles.listTextStatusSuccess}
                  `}
                >
                  <span style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                    {file.status === "success" && <IconCircleChecked width={24} height={24} />}
                    {file.status === "fail" && (
                      <>
                        <IconCircleClose/>
                        <span
                          className={styles.retry}
                          onClick={() => {
                            setFilesUpload(prev => {
                              const updatedFiles = [...prev];
                              updatedFiles[index] = {
                                ...updatedFiles[index],
                                status: "new",
                                error: undefined,
                              };
                              return updatedFiles;
                            });
                          }}
                        >
                          Retry
                        </span>
                      </>
                    )}
                  </span>
                </div>
              }
              {file.status === "uploading" && (
                <>
                  <div className={styles.spinContent}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#F0F0F6" stroke-width="4"/>
                      <path d="M12 2C17.5228 2 22 6.47715 22 12" stroke="#5050FF" stroke-width="4"/>
                    </svg>
                  </div>
                  <div className={styles.progressBar}>
                    <span>
                      {file.detail ? file.detail + ". " : "Uploading... "}
                      {file.progress.toFixed(0)}% of {formatBytes(file.file?.size ?? 0)}
                    </span>
                    <div style={{width: file.progress + "%"}}/>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }, [filesUpload]);

  const dropzone = useMemo(() => {
    return (
      <div className="c-localupload__text">
        <IconUploadFileLg />
        <div className={styles.uploadTilte}>
          <h2>Drag & drop files here or click to browse</h2>
          <div className={styles.supportFileType}>
            Supported file types: {supportedFileTypes.join(", ")}
          </div>
        </div>
      </div>
    );
  }, [supportedFileTypes]);

  const stats = useMemo(() => {
    let uploading = 0;
    let fail = 0;
    let success = 0;
    let queueing = 0;

    filesUpload.forEach((file) => {
      switch (file.status) {
        case "new":
          queueing++;
          break;
        case "uploading":
          uploading++;
          break;
        case "fail":
          fail++;
          break;
        case "success":
          success++;
          break;
        default:
          break;
      }
    });

    return {queueing, uploading, fail, success};
  }, [filesUpload]);

  const popupTitle = useMemo(() => {
    const result = [];

    if (stats.queueing > 0) {
      result.push("Queueing " + stats.queueing);
    }

    if (stats.uploading > 0) {
      result.push("Uploading " + stats.uploading);
    }

    if (stats.success > 0) {
      result.push("Success " + stats.success);
    }

    if (stats.fail > 0) {
      result.push("Failed " + stats.fail);
    }

    return result.join(", ");
  }, [stats]);

  useEffect(() => {
    if (currentUploadController.current?.signal.aborted) {
      currentUploadController.current = null;
      uploadingIndexRef.current = [];
      setFilesUpload([]);
      return;
    }

    if (filesUpload.length === 0) {
      return;
    } else {
      setOpenPopover(true);
    }

    const fIdx = filesUpload.findIndex(f => f?.status === "new");
    let counter = 4 - uploadingIndexRef.current.length;

    if (fIdx === -1 || counter <= 0) {
      return;
    }

    for (let i = 0; i < filesUpload.length; i++) {
      if (counter <= 0) {
        break;
      }

      if (filesUpload[i].status !== "new") {
        continue;
      }

      if (!currentUploadController.current) {
        currentUploadController.current = new AbortController();
      }

      importFiles(i, filesUpload[i]);
      counter--;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesUpload]);

  useDebouncedEffect(() => {
    const unsub = onMessage(publishChannel.current, (msg: unknown) => {
      let data = {}

      if (typeof msg === "string") {
        try {
          data = JSON.parse(msg);
        } catch (e) {
          return;
        }
      }

      if (!("upload_file_id" in data) || !("message" in data)) {
        return;
      }

      setFilesUpload(l => l.map(f => {
        // @ts-ignore
        if (f.id === data["upload_file_id"]) {
          return {
            ...f,
            // @ts-ignore
            detail: String(data["message"]),
            ..."percent" in data && data["percent"] ? {progress: Number(data["percent"])} : {},
          };
        }

        return f;
      }));
    });

    return () => {
      unsub();
      currentUploadController.current?.abort("Unmounted");
    }
  }, []);

  return (
    <div className={styles.localUpload}>
      <div
        className={`${styles.flex} ${isDragging ? styles.dragging : ""} ${isUploading ? styles.noCursor : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragOver={(e) => {
          let event = e as unknown as Event;
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        <div className={styles.localUploadContent}>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept={supportedFileTypes.join(",")}
            className={styles.dNone}
          />
          {dropzone}
        </div>
      </div>
      {example && (
        <div style={{marginTop: 16}}>
          <Button
            onClick={() => {
              downloadFile(
                new Blob([example], {type: "application/json"}),
                "project-" + project?.id + "-sample.json",
              );
            }}
          >
            Sample JSON format
          </Button>
        </div>
      )}
      <PopupWithCollapse
        isModalVisible={isOpenPopover}
        title={popupTitle}
        onCancel={() => {
          if (stats.uploading === 0) {
            uploadingIndexRef.current = [];
            currentUploadController.current = null;
            setFilesUpload([]);
            setOpenPopover(false);
            return;
          }

          confirmDialog({
            title: "Cancel current upload?",
            message: "Are you sure you want to remove all pending upload files?",
            submitText: "Yes",
            onSubmit: () => {
              currentUploadController.current?.abort("User cancelled");
              setOpenPopover(false);
            },
          })
        }}
      >
        {stats.fail > 0 && (
          <div style={{marginBottom: 16}}>
            <Button
              isBlock={true}
              onClick={() => {
                setFilesUpload(l => l.map(f => ({
                  ...f,
                  ...f.status === "fail"
                    ? {
                      status: "new",
                      error: undefined,
                    }
                    : {},
                })))
              }}
            >
              Retry {stats.fail} failed file{stats.fail > 1 ? "s" : ""}
            </Button>
          </div>
        )}
        {filesList}
      </PopupWithCollapse>
    </div>
  )
}
