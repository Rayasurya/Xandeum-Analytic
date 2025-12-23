import React from "react";
import {TTaskModel, validateTaskModel} from "@/models/task";
import {useApi} from "@/providers/ApiProvider";
import {randomString} from "@/utils/random";
import useDebouncedEffect from "../../useDebouncedEffect";

export type TUseTaskHook = {
  initialized: boolean,
  loading: boolean,
  loadingError: string | null,
  task: TTaskModel | null,
  refresh: () => void,
  setTask: React.Dispatch<React.SetStateAction<TTaskModel | null>>,
}


/**
 * Fetch a task information.
 *
 * @param {number} id
 * @param {number} projectID
 */
export default function useTaskHook(id: number, projectID: number): TUseTaskHook {
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingError, setLoadingError] = React.useState<null | string>(null);
  const [task, setTask] = React.useState<TTaskModel | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const api = useApi();

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  useDebouncedEffect(() => {
    setTask(null);

    if (id <= 0) {
      return;
    }

    setLoading(true);
    setLoadingError(null);

    const ar = api.call("task", {
      params: {id: id.toString(), project: projectID.toString()}
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        const vr = validateTaskModel(data);

        if (vr.isValid) {
          setTask(vr.data);
          setLoadingError(null);
        } else {
          setTask(null);
          setLoadingError("Invalid task data received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading task information.";

        if (e instanceof Error) {
          msg += " Error: "  + e.message + ".";
        }

        setTask(null);
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
  }, [api, id, projectID, refreshKey]);

  return React.useMemo(() => {
    return {
      initialized,
      loading,
      loadingError,
      task,
      refresh,
      setTask,
    }
  }, [
    initialized,
    loading,
    loadingError,
    task,
    refresh,
    setTask,
  ]);
}
