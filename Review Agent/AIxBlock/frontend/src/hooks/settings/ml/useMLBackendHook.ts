import React from "react";
import {TApiCallResult, useApi} from "@/providers/ApiProvider";
import { TMLBackendList, validateMLBackendListModel } from "@/models/mlBackend";
import useDebouncedEffect from "../../useDebouncedEffect";

export type TUseMLBackendHook = {
  list: TMLBackendList,
  initialized: boolean,
  loading: boolean,
  loadingError: string | null,
  refresh: (onCompleted?: () => void) => TApiCallResult,
}

/**
 * Get projects list
 */
export default function useMLBackendHook(projectID: number, mlNetWork?: number, is_deploy?: Boolean): TUseMLBackendHook {
  const [list, setList] = React.useState<TMLBackendList>([]);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingError, setLoadingError] = React.useState<null | string>(null);
  const api = useApi();

  const refresh = React.useCallback((onCompleted?: () => void) => {
    setLoading(true);
    setLoadingError(null);

    const ar = api.call("mlBackends", {
      query: new URLSearchParams({
        project: projectID.toString(),
        ml_network: mlNetWork?.toString() ?? "",
        is_deploy: is_deploy?.toString() ?? ""
      })
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.clone().json();
        const vr = validateMLBackendListModel(data);

        if (vr.isValid) {
          setList(vr.data);
          setLoadingError(null);
        } else {
          setLoadingError("Invalid ML backends list received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }

        return r;
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading ML backends list.";

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
        onCompleted?.();
      });

    return ar;
  }, [api, mlNetWork, projectID, is_deploy]);

  useDebouncedEffect(() => {
    const ar = refresh();

    return () => {
      ar.controller.abort();
    }
  }, [refresh]);

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
