import { useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import {useFlowProvider} from "@/pages/Flow/FlowProvider";
import useDebouncedEffect from "../../useDebouncedEffect";
export type ParamsType = { [key: string]: string };

export const useGetStorageForm = (type: string, target?: string, selectedItem?: any) => {
  const [storageFormFields, setStorageFormFields] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const {project} = useFlowProvider();

  useDebouncedEffect(() => {
    setLoading(true);

    const endpoint = target === "export" || target === "target_edit" ? "storageExportFormData" : "storageFormData";

    const params: ParamsType = target ? { type, target } : { type };

    const response: TApiCallResult = api.call(endpoint, {
      params,
      query: new URLSearchParams({
        project_id: project?.id?.toString() || ""
      }),
    });

    response.promise
      .then(async (res) => {
        if (response.controller.signal.aborted) return;
        let data = await res.json();
        if (data) {
          if (selectedItem && typeof selectedItem === "object") {
            const newData = data.map((section: any) => {
              return {
                ...section,
                fields: (section.fields ?? [])
                  .filter((f: any) => !!f)
                  .map((field: any) => {
                    if (Object.hasOwn(selectedItem, field.name ?? "")) {
                      field.value = selectedItem[field.name];
                    }

                    return {...field};
                  }),
              }
            });
            // console.log(newData)
            setStorageFormFields(newData);
          } else {
            setStorageFormFields(data);
          }
        }
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading Storage form";

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

    return () => {
      response.controller.abort();
    };
  }, [api, type, target, selectedItem]);

  return useMemo(() => {
    return {
      loading,
      error,
      storageFormFields,
    };
  }, [loading, error, storageFormFields]);
};
