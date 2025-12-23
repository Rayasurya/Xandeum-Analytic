import { useCallback, useMemo, useState } from "react";
import { useApi } from "@/providers/ApiProvider";
import { randomString } from "@/utils/random";
import useDebouncedEffect from "../../useDebouncedEffect";

export const useAllListDataStorage = (idParam?: number) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<null | Array<any>>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [exportList, setExportList] = useState<null | Array<any>>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState(randomString());

  const refresh = useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  useDebouncedEffect(() => {
    setLoading(true);

    const listStorage = api.call("listStorage", {
      params: { project: idParam?.toString() ?? ""},
    });
    // const listExportStorage = api.call("listExportStorage", {
    //   params: { project: idParam?.toString() ?? "" },
    // });

    Promise.all([
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

          let msg = "An error occurred while loading storage";

          if (e instanceof Error) {
            msg += " Error: " + e.message + ".";
            setError(msg);
          }

          if (window.APP_SETTINGS.debug) {
            console.error(e);
          }
        }),
      // listExportStorage.promise
      //   .then(async (res) => {
      //     if (listExportStorage.controller.signal.aborted) return;
      //     const data = await res.json();
      //     if (data) {
      //       setExportList(data);
      //     }
      //   })
      //   .catch((e) => {
      //     if (listExportStorage.controller.signal.aborted) {
      //       return;
      //     }

      //     let msg = "An error occurred while loading storage export";

      //     if (e instanceof Error) {
      //       msg += " Error: " + e.message + ".";
      //       setError(msg);
      //     }

      //     if (window.APP_SETTINGS.debug) {
      //       console.error(e);
      //     }
      //   }),
    ]).finally(() => {
      if (
        listStorage.controller.signal.aborted
        // listExportStorage.controller.signal.aborted
      ) {
        return;
      }

      setLoading(false);
      setInitialized(true);
    });

    return () => {
      listStorage.controller.abort();
      // listExportStorage.controller.abort();
    };
  }, [api, error, idParam, refreshKey]);

  return useMemo(() => {
    return {
      loading,
      error,
      list,
      exportList,
      refresh,
      initialized,
    };
  }, [loading, error, list, exportList, refresh, initialized]);
};
