import React from "react";
import { useApi } from "@/providers/ApiProvider";
import { randomString } from "@/utils/random";
import useDebouncedEffect from "../../useDebouncedEffect";

export type TUseMLNetWork = {
  dataNetWork: any,
  loading: boolean,
  loadingError: string | null,
  refresh: () => void,
}

export default function useMLNetWork(projectID: number): TUseMLNetWork {
  const [dataNetWork, setDataNetWork] = React.useState<any>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingError, setLoadingError] = React.useState<null | string>(null);
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const api = useApi();

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  useDebouncedEffect(() => {
    setLoading(true);
    setLoadingError(null);

    const ar = api.call("mlNetWork", {
      query: new URLSearchParams({
        project_id: projectID.toString(),
      })
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }
        const data = await r.json();
        if (r.ok) {
          setDataNetWork(data);
          setLoadingError(null);
        } else {
          throw new Error(`Failed to fetch data. Status: ${r.status}`);
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }
        let msg = "An error occurred while loading ML Network list.";
        if (e instanceof Error) {
          msg += " Error: "  + e.message + ".";
        }
        setLoadingError(msg + " Please try again!");
        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }
        setLoading(false);
      })

    return () => {
      ar.controller.abort();
    }
  }, [api, refreshKey, projectID]);

  return React.useMemo(() => {
    return {
      dataNetWork,
      loading,
      loadingError,
      refresh,
    }
  }, [
    dataNetWork,
    loading,
    loadingError,
    refresh
  ]);
}
