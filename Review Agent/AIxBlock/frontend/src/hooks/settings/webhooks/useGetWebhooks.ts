import { useCallback, useMemo, useState } from "react";
import { TWebhookResponse } from "@/pages/Project/Settings/Webhooks/WebhookItem/WebhookItem";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { validateWebhooksListModel } from "@/models/webhooksList";
import useDebouncedEffect from "../../useDebouncedEffect";


export const useGetWebhooks = () => {
  const api = useApi();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [listData, setListData] = useState<TWebhookResponse[] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const response: TApiCallResult = api.call("getWebhooks");

    try {
      const res = await response.promise;
      if (response.controller.signal.aborted) return;
      const data = await res.json();
      const vr = validateWebhooksListModel(data);

      if (vr.isValid) {
        setListData(data);
        setError(null);
      } else {
        setError("Invalid webhooks list received from the server. Please try again!");
        if (window.APP_SETTINGS.debug) {
          console.error(vr);
        }
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading list webhooks";

      if (e instanceof Error) {
        msg += " Error: " + e.message + ".";
        setError(msg);
      }

      if (window.APP_SETTINGS.debug) {
        console.error(e);
      }
    } finally {
      if (response.controller.signal.aborted) return;
      setLoading(false);
    }
  }, [api])


  useDebouncedEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => {
    return {
      loading,
      error,
      listData,
      fetchData,
    };
  }, [loading, error, listData, fetchData]);
};
