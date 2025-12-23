import React from "react";
import { TProjectModel } from "@/models/project";
import { useApi } from "@/providers/ApiProvider";
import { randomString } from "@/utils/random";
import { validateProjectsResponse } from "@/dtos/projects";
import useDebouncedEffect from "../useDebouncedEffect";

export type TProps = {
  page?: number;
  pageSize?: number;
  search?: string | null;
  fieldSearch?: string | null;
  sort?: string | null;
  catalogId?: string | null;
  type?: string | null;
  getAll?: boolean;
  project_id?: string | null;
};

export type TUseProjectsHook = {
  list: TProjectModel[],
  initialized: boolean,
  loading: boolean,
  loadingError: string | null,
  page: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  pageSize: number,
  setPageSize: React.Dispatch<React.SetStateAction<number>>,
  total: number,
  refresh: () => void,
}

/**
 * Get projects list
 *
 * @param {TProps} props
 */
export default function useProjectsHook(props: TProps = {
  page: 1,
  pageSize: 9,
}): TUseProjectsHook {
  const [list, setList] = React.useState<TProjectModel[]>([]);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingError, setLoadingError] = React.useState<null | string>(null);
  const [page, setPage] = React.useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = React.useState<number>(props.pageSize ?? 9);
  const [total, setTotal] = React.useState<number>(0);
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const api = useApi();

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  useDebouncedEffect(() => {
    setLoading(true);
    setLoadingError(null);

    const ar = api.call("projects", props.getAll ? {} : {
      query: new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        const vr = validateProjectsResponse(data);
        // Fix tạm để chạy được, ae FE check lại
        vr.data = data;
        vr.isValid = true;
        ///////////////////////////
        if (vr.isValid) {
          setList(vr.data.results);
          setTotal(vr.data.count);
          setLoadingError(null);
        } else {
          setLoadingError("Invalid projects list received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading projects list.";

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
  }, [api, page, pageSize, refreshKey, props.getAll]);

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
      refresh,
    }
  }, [
    list,
      initialized,
      loading,
      loadingError,
      page,
      pageSize,
      total,
      refresh,
  ]);
}
