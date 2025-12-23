import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import useDebouncedEffect from "../useDebouncedEffect";

export type TNotification = {

}
type UserNotification = TNotification & {
  key: string;
};

export const useGetListNotification = (props: { history_id?: number }) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [listData, setListData] = useState<UserNotification[] | null>(null);

  const fetchData = useCallback(
    async (params?: { page: string; page_size: string, history_id: string }) => {
      setLoading(true);
      const fetchParams = { ...params };
      if (props.history_id) {
        fetchParams.history_id = props.history_id.toString();
      }
      const response: TApiCallResult = api.call("userNotification", {
        params: fetchParams,
      });

      try {
        const res = await response.promise;

        if (response.controller.signal.aborted) return;
        const data = await res.json();
        setListData(data);

      } catch (e) {
        if (response.controller.signal.aborted) return;

        let msg = "An error occurred while loading list model catalog";

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
    },
    [api, props.history_id]
  );

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
