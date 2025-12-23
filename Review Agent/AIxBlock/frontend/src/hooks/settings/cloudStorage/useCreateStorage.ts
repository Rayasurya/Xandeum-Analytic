import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";

export type TCreateStorage = {
  presign?: true;
  title?: string;
  description?: string;
  last_sync?: Date;
  last_sync_count?: number;
  last_sync_job?: string;
  bucket?: string;
  prefix?: string;
  regex_filter?: string;
  use_blob_urls?: true;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_session_token?: string;
  region_name?: string;
  s3_endpoint?: string;
  presign_ttl?: number;
  recursive_scan?: true;
  project?: string;
};

export const useCreateStorage = (idParam: number) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const [storageData, setStorageData] = useState({});
  const api = useApi();
  const [validationErrors, setValidationErrors] = useState<{ [k: string]: string[] }>({});

  const onCreateStorage = useCallback(
    (body: any, type: string, target?: string, selectedItem?: any) => {
      let response: TApiCallResult;
      const endpoint = target === "target_edit" ? "updateExportStorage" : target === "source_edit" ? "updateStorage" : target ? "createExportStorage" : "createStorage";
      const payload = { ...body, project: idParam };
      const params: { [key: string]: string } = target ? { type, target } : { type };
      if (selectedItem) {
        params.pk = selectedItem.id.toString(); // Thêm giá trị của pk vào params
      }
      setError(null);
      setValidationErrors({});

      let endpoint_export: string | null = null;

      // Xác định endpoint_export dựa trên giá trị của target
      if (endpoint === "updateExportStorage") {
        endpoint_export = "target_edit";
      } else if (endpoint === "updateStorage") {
        endpoint_export = "source_edit";
      } else if (endpoint === "createStorage") {
        endpoint_export = "createExportStorage";
      } else {
        endpoint_export = null;
      }
      // console.log(endpoint, endpoint_export)


      response = api.call(endpoint, {
        body: payload,
        params: params,
      });
      
      response.promise
        .then(async (res) => {
          if (response.controller.signal.aborted) {
            return res;
          }

          const data = await res.clone().json();
          setStorageData(data);

          if (res.ok) {
            // console.log(data)
            if(endpoint_export){
              const updatedPayload = {
                ...payload,
                import_id: data.id,
              };

              const exportResponse = api.call(endpoint_export, {
                body: updatedPayload,
                params: params,
              });
              console.log(payload, params)
        
              // Xử lý promise của API thứ hai
              exportResponse.promise
                .then(async (exportRes) => {
                  if (exportResponse.controller.signal.aborted) {
                    return exportRes;
                  }
        
                  const exportData = await exportRes.clone().json();
                  // Xử lý dữ liệu từ API thứ hai tại đây
                  console.log("Export API data:", exportData);
        
                  if (exportRes.ok) {
                    // Làm gì đó khi cả hai API đều thành công
                  } else {
                    // Xử lý lỗi của API thứ hai
                    console.error("Export API failed:", exportData);
                  }
                })
                .catch((exportError) => {
                  console.error("Export API error:", exportError);
                });
            }    
            return res;
          }

          if (Object.hasOwn(data, "message")) {
            setError(data.message);
          } else if (Object.hasOwn(data, "detail")) {
            setError(data.detail);
          }

          if (Object.hasOwn(data, "validation_errors")) {
            setValidationErrors(data.validation_errors);
          }

          return res;
        })
        .catch((e) => {
          if (response.controller.signal.aborted) {
            return;
          }

          let msg = "An error occurred while loading Storage";

          if (e instanceof Error) {
            msg += " Error: " + e.message + ".";
            setError(msg);
          }

          if (window.APP_SETTINGS.debug) {
            console.error(e);
          }
        })
        .finally(() => {
          if (response.controller.signal.aborted) return;
          setLoading(false);
        });

      return response;
    },
    [api, idParam]
  );

  return useMemo(() => {
    return {
      loading,
      error,
      storageData,
      onCreateStorage,
      validationErrors,
    };
  }, [loading, error, storageData, onCreateStorage, validationErrors]);
};
