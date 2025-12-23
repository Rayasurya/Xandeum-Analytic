import { useCallback, useMemo, useState } from "react";
import { useApi } from "@/providers/ApiProvider";
import { randomString } from "@/utils/random";
import useDebouncedEffect from "../../useDebouncedEffect";

export const useListGlobalStorage = () => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<null | Array<any>>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState(randomString());

  const refresh = useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  useDebouncedEffect(() => {
    setLoading(true);
    const listStorage = api.call("listGlobalStorage");

    listStorage.promise
      .then(async (res) => {
        if (listStorage.controller.signal.aborted) return;
        const data = await res.json();
        if (data) {
          setList(data);
        }
      })
      .catch((e) => {
        if (listStorage.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading global storage";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
          setError(msg);
        }

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (listStorage.controller.signal.aborted) {
          return;
        }

        setLoading(false);
        setInitialized(true);
      });

    return () => {
      listStorage.controller.abort("Unmounted");
    };
  }, [api, error, refreshKey]);

  return useMemo(() => {
    return {
      loading,
      error,
      list,
      refresh,
      initialized,
    };
  }, [loading, error, list, refresh, initialized]);
};
