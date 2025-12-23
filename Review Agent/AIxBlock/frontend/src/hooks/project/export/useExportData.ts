import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";

export const useExportData = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const api = useApi();

  const proceedExport = useCallback(
    async (id: number, exportType: string) => {
      let response: TApiCallResult;

      response = await api.call("export", {
        params: {
          id: id.toString(),
          exportType: exportType ?? "",
        },
      });

      response.promise
        .then(async (res) => {
          if (response.controller.signal.aborted) return;
          // const blob = await res.blob();
          // if (blob) {
          //   downloadFile(blob, res.headers.get('filename') ?? "");
          // };
        })
        .catch((e) => {
          if (response.controller.signal.aborted) {
            return;
          }

          let msg = "An error occurred while get data export";

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
    },
    [api]
  );

  return useMemo(() => {
    return {
      loading,
      error,
      proceedExport
    };
  }, [loading, error, proceedExport]);
};
