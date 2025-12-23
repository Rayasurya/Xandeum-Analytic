import { useMemo, useState, useCallback } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";


export const useModelMarketplaceDownload = (model_id: number) => {
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);

  const downloadModel = useCallback(() => {
    setLoading(true);
    const response: TApiCallResult = api.call("downloadModel", {
      params: {
        model_id: model_id.toString()
      }
    });

    response.promise
      .then(async (res) => {

        if (response.controller.signal.aborted) return;
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while downloading model.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setError(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (response.controller.signal.aborted) return;
        setLoading(false);
      });

    return response;
  }, [api, model_id]);

  return useMemo(() => {
    return {
      downloadModel,
      error,
      loading,
    };
  }, [downloadModel, error, loading]);
};
