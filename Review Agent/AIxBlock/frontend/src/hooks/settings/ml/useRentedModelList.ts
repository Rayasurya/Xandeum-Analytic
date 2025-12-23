import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import {THistoryRentedModel} from "@/models/historyRentedModel";
import useDebouncedEffect from "../../useDebouncedEffect";

type TRentedModelListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: THistoryRentedModel[];
}

export type TProps = {
  page?: number;
  page_size?: number;
  project_id?: string | null;
  search?: string | null;
  fieldSearch?: string[] | null;
  sort?: string[] | null;
  type?: THistoryRentedModel["type"] | null;
  fieldQuery?: string[] | null;
  valueQuery?: string[] | null;
};

export const useRentedModelList = (props: TProps = {
  page: 1,
  page_size: 100,
  project_id: null,
  search: null,
  fieldSearch: null,
  sort: null,
  type: null,
  fieldQuery: null,
  valueQuery: null,
}) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(props.page_size ?? 100);
  const [listData, setListData] = useState<TRentedModelListResponse | null>(null);

  const refresh = useCallback(async () => {
    const query = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (props.project_id) {
      query.append("project_id", props.project_id);
    }

    if (props.search) {
      query.append('search', props.search);
    }

    if (props.fieldSearch && Array.isArray(props.fieldSearch)) {
      query.append('fieldSearch', props.fieldSearch.join(","));
    }

    if (props.sort && Array.isArray(props.sort)) {
      query.append('sort', props.sort.join(","));
    }

    if (props.type){
      query.append('type', props.type);
    }

    if (props.fieldQuery){
      query.append('fieldQuery', props.fieldQuery.join(","));
    }

    if (props.valueQuery){
      query.append('valueQuery', props.valueQuery.join(","));
    }

    setLoading(true);
    setError(null);
    const response: TApiCallResult = api.call("historybuildModels", {query});

    try {
      if (response.controller.signal.aborted) return;
      const res = await response.promise;
      const data = await res.json();

      if (res.ok) {
        setListData(data);
      } else {
        if ("detail" in data) {
          setError(data["detail"]);
        } else {
          setError("An error has been occurred. Code: " + res.status + " " + res.statusText);
        }
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;
      let msg = "An error occurred while loading rented models list.";

      if (e instanceof Error) {
        msg += " Error: " + e.message + ".";
        setError(msg);
      }

      if (window.APP_SETTINGS.debug) {
        console.error(e);
      }
    } finally {
      if (response.controller.signal.aborted) return;
      setLoading(false);
    }
  }, [api, page, pageSize, props.fieldQuery, props.fieldSearch, props.project_id, props.search, props.sort, props.type, props.valueQuery]);

  useDebouncedEffect(() => {
    refresh()
      .finally(() => {
        setInitialized(true)
      });
  }, [refresh]);

  return useMemo(() => {
    return {
      loading,
      initialized,
      error,
      listData,
      page,
      pageSize,
      setPage,
      setPageSize,
      refresh,
    };
  }, [loading, initialized, error, listData, page, pageSize, refresh]);
};
