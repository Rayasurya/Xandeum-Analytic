import React from "react";
import {useApi} from "@/providers/ApiProvider";
import {randomString} from "@/utils/random";
import {TActionModel} from "@/models/action";
import {validateActionsResponse} from "@/dtos/actions";
import useDebouncedEffect from "../../useDebouncedEffect";

export type TUseActionsHook = {
  list: TActionModel[],
  initialized: boolean,
  loading: boolean,
  loadingError: string | null,
  refresh: () => void,
}

/**
 * Get actions list
 *
 * @param {number} projectID
 */
export default function useActionsHook(projectID: number): TUseActionsHook {
  const [list, setList] = React.useState<TActionModel[]>([]);
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

    const ar = api.call("actions", {
      params: {id: projectID.toString()},
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        const vr = validateActionsResponse(data);

        if (vr.isValid) {
          setList(vr.data);
          setLoadingError(null);
        } else {
          setLoadingError("Invalid actions list received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading actions list.";

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
