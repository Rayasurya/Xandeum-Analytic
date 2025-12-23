import React from "react";
import { useApi } from "@/providers/ApiProvider";
import { randomString } from "@/utils/random";
import { TViewModel } from "@/models/view";
import { TTaskModel, validateTaskModel } from "@/models/task";
import { validateTasksResponseModel } from "@/dtos/tasks";
import useDebouncedEffect from "../../useDebouncedEffect";

export type TProps = {
  page?: number,
  pageSize?: number,
  view: TViewModel,
}

export type TUseTasksHook = {
  list: TTaskModel[],
  initialized: boolean,
  loading: boolean,
  loadingError: string | null,
  page: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  pageSize: number,
  setPageSize: React.Dispatch<React.SetStateAction<number>>,
  total: number,
  totalAnnotations: number,
  totalPredictions: number,
  refresh: () => void,
  refreshTask: (id: number, cb?: (t: TTaskModel) => void) => void,
  lockTask: (id: number, user_id: number) => void,
  releaseTask: (id: number, user_id: number) => void,
}

/**
 * Get projects list
 *
 * @param {TProps} props
 */
export default function useTasksHook(props: TProps): TUseTasksHook {
  const [list, setList] = React.useState<TTaskModel[]>([]);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingError, setLoadingError] = React.useState<null | string>(null);
  const [page, setPage] = React.useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = React.useState<number>(props.pageSize ?? 30);
  const [total, setTotal] = React.useState<number>(0);
  const [totalAnnotations, setTotalAnnotations] = React.useState<number>(0);
  const [totalPredictions, setTotalPredictions] = React.useState<number>(0);
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const api = useApi();

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  const refreshTask = React.useCallback((id: number, cb?: (t: TTaskModel) => void) => {
    const currentTask = list.find(t => t.id === id);

    if (!currentTask) {
      return;
    }

    const ar = api.call("task", {
      params: {
        id: id.toString(),
        project: currentTask.project.toString(),
      },
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        const vr = validateTaskModel(data);

        if (vr.isValid) {
          setList(currentList => currentList.map(t => {
            if (t.id === id) {
              return vr.data;
            }

            return t;
          }));
          setLoadingError(null);
          cb?.(vr.data);
        } else {
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

        setLoadingError(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }
      });

    return () => {
      ar.controller.abort();
    }
  }, [api, list]);

  const lockTask = React.useCallback((id: number, user_id: number) => {
    setList(l => l.map(t => {
      if (t.id !== id) {
        return t;
      }

      return {...t, locked_by: [user_id]};
    }));
  }, []);

  const releaseTask = React.useCallback((id: number, user_id: number) => {
    setList(l => l.map(t => {
      if (t.id !== id) {
        return t;
      }

      return {...t, locked_by: []};
    }));
  }, []);

  useDebouncedEffect(() => {
    setLoading(true);
    setLoadingError(null);

    const ar = api.call("tasks", {
      query: new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        project: props.view.project.toString(),
        view: props.view.id.toString(),
      })
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        const vr = validateTasksResponseModel(data);

        if (vr.isValid) {
          setList(vr.data.tasks);
          setTotal(vr.data.total);
          setTotalAnnotations(vr.data.total_annotations);
          setTotalPredictions(vr.data.total_predictions);
          setLoadingError(null);
        } else {
          setLoadingError("Invalid tasks list received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading tasks list.";

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
  }, [api, page, pageSize, refreshKey, props.view]);

  return React.useMemo(() => {
    return {
      list,
      initialized,
      loading,
      loadingError,
      page,
      setPage,
      pageSize,
      setPageSize,
      total,
      totalAnnotations,
      totalPredictions,
      refresh,
      refreshTask,
      lockTask,
      releaseTask,
    }
  }, [
    list,
    initialized,
    loading,
    loadingError,
    page,
    pageSize,
    total,
    totalAnnotations,
    totalPredictions,
    refresh,
    refreshTask,
    lockTask,
    releaseTask,
  ]);
}
