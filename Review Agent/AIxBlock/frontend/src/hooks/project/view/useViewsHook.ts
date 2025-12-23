import React from "react";
import { validateViewsResponse } from "@/dtos/views";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TViewModel, validateViewModel } from "@/models/view";
import { randomString } from "@/utils/random";
import { TColumnModel } from "@/models/column";
import { nextName } from "@/utils/nextName";
import { columnKey } from "@/utils/column";
import useDebouncedEffect from "../../useDebouncedEffect";

export type TUseViewsHook = {
  list: TViewModel[],
  initialized: boolean,
  loading: boolean,
  loadingError: string | null,
  refresh: () => void,
  create: (columns?: TColumnModel[]) => TApiCallResult,
  close: (viewID: number) => TApiCallResult,
  update: (viewID: number, body: TViewModel, interaction?: string) => {
    controller: AbortController,
    result: Promise<TViewModel>,
  },
  duplicate: (view: TViewModel) => TApiCallResult,
  makePublic: (view: TViewModel) => {
    controller: AbortController,
    result: Promise<TViewModel>,
  },
  makePrivate: (view: TViewModel) => {
    controller: AbortController,
    result: Promise<TViewModel>,
  },
}

/**
 * Get views list
 *
 * @param {number} projectID
 */
export default function useViewsHook(projectID: number): TUseViewsHook {
  const [list, setList] = React.useState<TViewModel[]>([]);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingError, setLoadingError] = React.useState<null | string>(null);
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const api = useApi();

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  const create = React.useCallback((columns?: TColumnModel[]) => {
    const hiddenExploreColumns = [];
    const hiddenLabelingColumns = [];

    if (columns) {
      for (let i = 0; i < columns.length; i++) {
        const _columnKey = columnKey(columns[i]);

        if (!columns[i].visibility_defaults?.explore) {
          hiddenExploreColumns.push(_columnKey);
        }

        if (!columns[i].visibility_defaults?.labeling) {
          hiddenLabelingColumns.push(_columnKey);
        }
      }
    } else {
      hiddenExploreColumns.push(
        "tasks:inner_id",
        "tasks:annotations_results",
        "tasks:annotations_ids",
        "tasks:predictions_score",
        "tasks:predictions_model_versions",
        "tasks:predictions_results",
        "tasks:file_upload",
        "tasks:storage_filename",
        "tasks:created_at",
        "tasks:updated_at",
        "tasks:updated_by",
        "tasks:avg_lead_time",
      );

      hiddenLabelingColumns.push(
        "tasks:data.duration",
        "tasks:id",
        "tasks:inner_id",
        "tasks:completed_at",
        "tasks:cancelled_annotations",
        "tasks:total_predictions",
        "tasks:annotators",
        "tasks:annotations_results",
        "tasks:annotations_ids",
        "tasks:predictions_score",
        "tasks:predictions_model_versions",
        "tasks:predictions_results",
        "tasks:file_upload",
        "tasks:storage_filename",
        "tasks:created_at",
        "tasks:updated_at",
        "tasks:updated_by",
        "tasks:avg_lead_time",
      );
    }

    const ar = api.call("createView", {
      body: {
        project: projectID,
        data: {
          title: nextName(list.map(v => v.data.title), "New Tab"),
          type: "list",
          target: "tasks",
          hiddenColumns: {
            explore: hiddenExploreColumns,
            labeling: hiddenLabelingColumns,
          },
          columnsWidth: {},
          columnsDisplayType: {},
          gridWidth: 4,
          filters: {
            conjunction: "and",
            items: [],
          }
        },
      },
    });

    ar.promise.then(async r => {
      if (ar.controller.signal.aborted) {
        return;
      }

      const data = await r.clone().json();
      const vr = validateViewModel(data);

      if (vr.isValid) {
        refresh();
      }

      return r;
    });

    return ar;
  }, [api, list, projectID, refresh]);

  const duplicate = React.useCallback((view: TViewModel) => {
    const ar = api.call("createView", {
      body: {...view},
    });

    ar.promise.then(async r => {
      if (ar.controller.signal.aborted) {
        return;
      }

      const data = await r.clone().json();
      const vr = validateViewModel(data);

      if (vr.isValid) {
        refresh();
      }

      return r;
    });

    return ar;
  }, [api, refresh]);

  const update = React.useCallback((viewID: number, body: TViewModel, interaction?: string) => {
    const controller = new AbortController();

    const result = new Promise<TViewModel>((resolve, reject) => {
      const ar = api.call("updateView", {
        abortController: controller,
        params: {
          id: viewID.toString(),
          project: projectID.toString(),
          interaction: interaction ?? "",
        },
        body,
      });

      ar.promise
        .then(r => {
          if (r.status === 404) {
            refresh();
          }

          return r;
        })
        .then(r => r.json())
        .then(async r => {
          const vr = validateViewModel(r);

          if (vr.isValid) {
            resolve(r);
            return;
          }

          reject(new Error("Invalid view response data."))
        })
        .catch(e => {
          reject(e);
        });
    });

    return {
      controller: controller,
      result,
    }
  }, [api, projectID, refresh]);

  const close = React.useCallback((viewID: number) => {
    if (list.length <= 1) {
      throw new Error("Can not delete this view.");
    }

    const ar = api.call("closeView", {
      params: {
        id: viewID.toString(),
        project: projectID.toString(),
      },
    });

    ar.promise.then(r => {
      if (r.ok) {
        refresh();
      }

      return r;
    });

    return ar;
  }, [api, list, projectID, refresh]);

  const setVisibility = React.useCallback((view: TViewModel, isPrivate: boolean) => {
    const ar = update(view.id, {...view, is_private: isPrivate});

    ar.result.then(r => {
      setList(l => l.map(v => {
        if (v.id === r.id) {
          return {...r};
        }

        return v;
      }));

      return r;
    });

    return ar;
  }, [update]);

  const makePublic = React.useCallback((view: TViewModel) => {
    return setVisibility(view, false);
  }, [setVisibility]);

  const makePrivate = React.useCallback((view: TViewModel) => {
    return setVisibility(view, true);
  }, [setVisibility]);

  useDebouncedEffect(() => {
    if (!projectID) {
      return;
    }

    setLoading(true);
    setLoadingError(null);

    const ar = api.call("views", {
      params: {id: projectID.toString()},
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const respData = await r.json();
        const data: TViewModel[] = []

        if (Array.isArray(respData)) {
          respData.forEach(v => {
            const _vr = validateViewModel(v);

            if (!_vr.isValid) {
              if (window.APP_SETTINGS.debug) {
                console.error(_vr);
              }

              return;
            }

            data.push(_vr.data);
          });
        }

        const vr = validateViewsResponse(data);

        if (vr.isValid) {
          setList(vr.data);
          setLoadingError(null);
        } else {
          setLoadingError("Invalid views list received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading views list.";

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
      create,
      close,
      update,
      duplicate,
      makePublic,
      makePrivate,
    }
  }, [
    list,
    initialized,
    loading,
    loadingError,
    refresh,
    create,
    close,
    update,
    duplicate,
    makePublic,
    makePrivate,
  ]);
}
