import { useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import useDebouncedEffect from "../../useDebouncedEffect";

type StorageTypes = {
  name: string;
  title: string;
};

export const useGetTypesStorage = (target?: string, type?: boolean) => {
  const [storageTypes, setStorageTypes] = useState<StorageTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  useDebouncedEffect(() => {
    setLoading(true);

    let response: TApiCallResult;

    const endpoint = target ? "storageExportTypes" : "storageTypes";
    const params = target ? { target } : undefined;

    const query = new URLSearchParams({
      is_global: type?.toString() ?? "false",
    });

    if (type){
      response = api.call(endpoint, { params, query });
    }else{
      response = api.call(endpoint, { params});
    }

    response.promise
      .then(async (res) => {
        if (response.controller.signal.aborted) return;
        const data = await res.json();
        if (data) {
          setStorageTypes(data);
        }
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading Storage Types";

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
  }, [api, target]);

  return useMemo(() => {
    return {
      loading,
      error,
      storageTypes,
    };
  }, [loading, error, storageTypes]);
};
