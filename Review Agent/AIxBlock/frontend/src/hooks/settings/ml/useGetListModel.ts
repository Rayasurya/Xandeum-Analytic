import { useCallback, useMemo, useRef, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TProps } from "../../project/useProjectsHook";
import { TModelMarketplace, validateMarketplaceListModel } from "@/models/modelMarketplace";
import useDebouncedEffect from "../../useDebouncedEffect";

type TModelMarketplaceResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TModelMarketplace[];
}

export const useGetListModel = (props: TProps & {name?: string | null, task_names?: string[]} = {
  page: 1,
  pageSize: 9,
  search: null,
  fieldSearch: null,
  sort: null,
  catalogId: null,
  type: null,
  project_id:null,
  name: null,
  task_names: [],
}) => {
  const api = useApi();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(props.pageSize ?? 9);

  const [listData, setListData] = useState<TModelMarketplaceResponse | null>(null);
  const lastSearchParam = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
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
    if (props.fieldSearch) {
      query.append('fieldSearch', props.fieldSearch);
    }
    if (props.sort) {
      query.append('sort', props.sort);
    }
    if( props.catalogId){
      query.append('catalog_id', props.catalogId);

    }
    if( props.type){
      query.append('type', props.type);
    }
    if( props.name){
      query.append('name', props.name);
    }
    query.append('status', "in_marketplace");

    if (props.task_names && props.task_names.length > 0) {
      query.append("task_names", props.task_names.join(","));
    }

    if(query.toString() === lastSearchParam.current) {
      return
    }

    setLoading(true);
    lastSearchParam.current = query.toString();

    const response: TApiCallResult = api.call("getListModel", {
      query,
    });

    try {
      const res = await response.promise;

      if (response.controller.signal.aborted) return;
      const data = await res.json();
      const vr = validateMarketplaceListModel(data?.results);

      if (vr.isValid) {
        setListData(data);
        setError(null);
      } else {
        setError("Invalid model marketplace list received from the server. Please try again!");
        if (window.APP_SETTINGS.debug) {
          console.error(vr);
        }
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading list sell marketplace model";

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
  }, [page, pageSize, props.project_id, props.search, props.fieldSearch, props.sort, props.catalogId, props.type, props.name, api, props.task_names])


  useDebouncedEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => {
    return {
      loading,
      error,
      listData,
      page,
      pageSize,
      setPage,
      setPageSize,

      fetchData,
    };
  }, [loading, error, listData, page, pageSize, setPage, setPageSize, fetchData]);
};
