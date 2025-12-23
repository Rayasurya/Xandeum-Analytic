import styles from "./ModelsList.module.scss";
import {useFlowProvider} from "../../FlowProvider";
import ModelItem from "@/components/Model/Item";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import { useCallback, useEffect, useRef, useState } from "react";
import Pagination from "@/components/Pagination/Pagination";
import useDeleteModel from "@/hooks/settings/ml/useDeleteModel";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import { confirmDialog } from "@/components/Dialog";
import InputBase from "@/components/InputBase/InputBase";
import { THistoryRentedModel } from "@/models/historyRentedModel";
import { useApi } from "@/providers/ApiProvider";
import Upload from "@/components/Upload/Upload";
import {toastError} from "@/utils/toast";

export type TProps = {
  canConfigure?: boolean;
}

export default function ModelsList({canConfigure}: TProps) {
  const {computes, models} = useFlowProvider();
  const [page, setPage] = useState(1);
  const {deleteModel, status} = useDeleteModel();
  const {call} = useApi();
  const [saving, setSaving] = useState(false);
  const unmounted = useRef(false);
  interface Config {
    TrainingArguments?: string;
    [key: string]: any; // Cho phép các key bổ sung khác nếu cần
}
  useBooleanLoader(!!status || saving, status ?? "");

  const onConfigure = useCallback((modelHistory: THistoryRentedModel) => {
    let newConfig = modelHistory.model_marketplace?.config;
    let source: File;
    let parsedConfig: Config = {};
    let trainingArgumentsValue = "";
    if (newConfig) {
      try {
          parsedConfig = JSON.parse(newConfig);
          trainingArgumentsValue = parsedConfig?.TrainingArguments ? JSON.stringify(parsedConfig.TrainingArguments) : "";
          console.log(trainingArgumentsValue)
      } catch (error) {
          console.error("Invalid JSON in newConfig:", error);
      }
    } else {
        parsedConfig = {};
    }
    
    confirmDialog({
      title: "Model Config",
      className: styles.modal,
      message: (<>
        <div style={ { margin: 8 } }>Hyperparameter</div>
        <InputBase
          isMultipleLine={ true }
          allowClear={ false }
          value={ trainingArgumentsValue } // Hiển thị chỉ TrainingArguments
          onChange={(e) => {
              trainingArgumentsValue = e.target.value.trim();

              // Đảm bảo giá trị là JSON hợp lệ và nằm trong {}
              // if ((!trainingArgumentsValue.startsWith("{") || !trainingArgumentsValue.endsWith("}"))) {
              //     trainingArgumentsValue = `{${trainingArgumentsValue}}`;
              // }

              if (parsedConfig) {
                  parsedConfig.TrainingArguments = trainingArgumentsValue;
                  newConfig = JSON.stringify(parsedConfig); // Cập nhật newConfig với giá trị mới
              }
          }}
          style={ {
            width: "100%",
            maxWidth: 720,
            maxHeight: "max(calc(100vh - 700px), 48px)",
            minHeight: 100,
            height: 400,
            resize: "none",
          } }
        />
        {/* <div style={ { margin: 8 } }>Upload source code (.zip, .zar format)</div> */}
        <Upload
          accept=".zip,.zar,application/zip,application/x-zip-compressed,application/octet-stream"
          onUpload={ f => source = f }
          className={styles.upload}
        />
      </>),
      submitText: "Update",
      onSubmit: () => {
        if (unmounted.current) return;

        setSaving(true);

        if (source) {
          // @TODO: Call API to upload source file
          console.log(source);
        }

        const ar = call("updateModel", {
          params: {id: modelHistory.model_marketplace?.id.toString()},
          body: {
            ...(modelHistory.model_marketplace ?? {}),
            config: newConfig,
          }
        });

        ar.promise
          .then(async r => {
            if (unmounted.current) return;

            if (r.ok) {
              await models.refresh();
              return;
            } else {
              if (r.status === 400) {
                const errorData = await r.json(); // Get error details from the response body
                console.error("Bad request:", errorData);
                // Assuming `toastError` is a function to show error messages
                toastError(`${errorData.messages || "Unknown error"}`);
              } else {
                toastError("An unexpected error occurred. Please try again later.");
              }
            }
          })
          .finally(() => {
            if (unmounted.current) return;
            setSaving(false);
          });
      },
    });
  }, [call, models]);

  useEffect(() => {
    unmounted.current = false;

    return () => {
      unmounted.current = true;
    }
  }, []);

  return (
    <div className={styles.container}>
      {(models.listData?.results.length ?? 0) === 0 && (
        <EmptyContent message="(Empty list)" hideIcon={true} />
      )}
      {models.listData?.results.map((h, idx) => {
        if (idx < (page - 1) * 3 || idx >= (page * 3)) {
          return null;
        }

        return (
          <ModelItem
            model={h.model_marketplace}
            noPrice={true}
            onDelete={() => {
              deleteModel(h.id, h.model_marketplace.ml_id ?? undefined, async () => {
                await computes.refresh()
                await new Promise(resolve => {
                  setTimeout(async () => {
                    await models.refresh();
                    resolve(void 0);
                  }, 250);
                });
              });
            }}
            onConfigure={canConfigure ? () => onConfigure(h) : undefined}
            version={h.version}
          />
        );
      })}
      {models.listData?.results && models.listData.results.length > 3 && (
        <Pagination page={page} pageSize={3} setPage={setPage} total={models.listData.results.length} />
      )}
    </div>
  );
}
