import React from "react";
import {useApi} from "@/providers/ApiProvider";
import {randomString} from "@/utils/random";
import {validateColumnsResponse} from "@/dtos/columns";
import {TColumnModel} from "@/models/column";
import useDebouncedEffect from "../../useDebouncedEffect";

export type TUseColumnsHook = {
  list: TColumnModel[],
  initialized: boolean,
  loading: boolean,
  loadingError: string | null,
  refresh: () => void,
}

/**
 * Get columns list
 *
 * @param {number} projectID
 */
export default function useColumnsHook(projectID: number): TUseColumnsHook {
  const [list, setList] = React.useState<TColumnModel[]>([]);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingError, setLoadingError] = React.useState<null | string>(null);
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const api = useApi();

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  useDebouncedEffect(() => {
    if (!projectID) {
      return;
    }

    setLoading(true);
    setLoadingError(null);

    const ar = api.call("columns", {
      params: {id: projectID.toString()},
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        const vr = validateColumnsResponse(data);

        if (vr.isValid) {
          setList(vr.data.columns.filter(c => !c.children));
          setLoadingError(null);
        } else {
          setLoadingError("Invalid columns list received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading columns list.";

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
        setInitialized(true);
      })

    return () => {
      ar.controller.abort();
    }
  }, [api, refreshKey, projectID]);

  return React.useMemo(() => {
    return {
      list,
      initialized,
      loading,
      loadingError,
      refresh,
    }
  }, [
    list,
    initialized,
    loading,
    loadingError,
    refresh,
  ]);
}
