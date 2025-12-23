import validateProjectModel, {TProjectModel} from "@/models/project";
import React, {useCallback} from "react";
import {TApiCallResult, useApi} from "@/providers/ApiProvider";
import useDebouncedEffect from "../useDebouncedEffect";

export type TUseProjectHook = {
  initialized: boolean,
  loading: boolean,
  loadingError: string | null,
  detail: TProjectModel | null,
  refresh: (showLoading?: boolean) => void,
  fetchData: (showLoading?: boolean) => TApiCallResult | undefined,
  setDetail: React.Dispatch<React.SetStateAction<TProjectModel | null>>,
  patchProject: (data: Partial<TProjectModel>, dryRun?: boolean, onCompleted?: () => void, onError?: (e: string | Error) => void) => void,
}

/**
 * Fetch a project information.
 *
 * @param {number} id
 */
export default function useProjectHook(id: number): TUseProjectHook {
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingError, setLoadingError] = React.useState<null | string>(null);
  const [detail, setDetail] = React.useState<TProjectModel | null>(null);
  const api = useApi();

  const fetchData = React.useCallback((showLoading?: boolean) => {
    if (!id) {
      return;
    }

    showLoading && setLoading(true);
    setLoadingError(null);

    const ar = api.call("projectDetail", {
      params: {id: id.toString()}
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        if (!r.ok) {
          const data = r.clone().json();

          if ("detail" in data) {
            // @ts-ignore
            setLoadingError(data["detail"]);
          } else {
            setLoadingError("Error: " + r.statusText + ". Code: " + r.status);
          }

          return;
        }

        const data = await r.json();
        const vr = validateProjectModel(data);

        if (vr.isValid) {
          setDetail(vr.data);
          setLoadingError(null);
        } else {
          setLoadingError("Invalid project data received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading project information.";

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

        showLoading && setLoading(false);
        setInitialized(true);
      });

    return ar;
  }, [api, id])

  const patchProject = useCallback((data: Partial<TProjectModel>, dryRun: boolean = false, onCompleted?: () => void, onError?: (e: string | Error) => void) => {
    if (dryRun) {
      setDetail(d => {
        if (!d) {
          return d;
        }

        return {...d, ...data};
      });

      onCompleted?.();
      return;
    }

    const ar = api.call("updateProject", {
      params: {id: id.toString()},
      body: data,
    });

    ar.promise
      .then(r => {
        if (!r.ok) {
          onError?.("Error: " + r.status + " / " + r.statusText);
          return;
        }

        setDetail(d => {
          if (!d) {
            return d;
          }

          return {...d, ...data};
        });

        onCompleted?.();
      })
      .catch(e => {
        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }

        if (e instanceof Error) {
          onError?.(e);
        } else {
          onError?.(e.toString());
        }
      });
  }, [api, id]);

  useDebouncedEffect(() => {
    const ar = fetchData();
    ar?.promise.catch(() => {});

    return () => {
      ar?.controller.abort("Unmounted");
    }
  }, [fetchData]);

  return React.useMemo(() => {
    return {
      initialized,
      loading,
      loadingError,
      detail,
      refresh: fetchData,
      fetchData,
      setDetail,
      patchProject,
    }
  }, [
    initialized,
    loading,
    loadingError,
    detail,
    fetchData,
    setDetail,
    patchProject,
  ]);
}
