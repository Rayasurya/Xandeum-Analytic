import React, { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { randomString } from "@/utils/random";
import useDebouncedEffect from "../useDebouncedEffect";
import { TModelMarketplace } from "@/models/modelMarketplace";

export type TModel = {
  id: number;
  name: string;
  type: string;
  price: number;
  port: string;
  model_desc: string;
  ml_id: number;
  config: string;
  catalog_id: number;
  order: number;
  file: string;
  infrastructure_id: string;
  image_dockerhub_id: string;
  ip_address: string;
  checkpoint_storage_id: string;
  docker_image: string;
  docker_access_token: string;
  dataset_storage_id: number;
  created_at: string;
  updated_at: string;
  author_id: number;
  status: "created" | "in_marketplace" | "rented_bought" | "completed" | "pending" | "suspend" | "expired" | "failed";
  tasks?: TModelMarketplace["tasks"];
};

type TModelResponse = {
  count: number;
  next: boolean | null;
  previous: boolean | null;
  results: TModel[];
};

export type TProps = {
  name?: string;
  page?: number;
  pageSize?: number;
  sort?: string | null;
  type?: "MODEL-SYSTEM" | "MODEL-CUSTOMER";
  project_id?: string | null;
  tasks?: string[];
};

export const useGetModel = (
  props: TProps = {
    page: 1,
    pageSize: 10,
    sort: "id-desc",
  }
) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(props.pageSize ?? 10);
  const [catalog, setCatalog] = useState<TModelResponse | null>(null);
  const [models, setModels] = useState<TModelResponse | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(randomString());

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);
  const fetchData = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      sort: props.sort ?? "id-desc",
    });

    if (props.name && props.name.trim().length > 0) query.set("name", props.name);
    if (props.type) query.set("type", props.type);
    if (props.tasks) query.set("task_names", props.tasks.join(","));

    const response: TApiCallResult = api.call("getListModel", {query});

    try {
      const res = await response.promise;

      if (response.controller.signal.aborted) return;

      if (res.ok) {
        const data = await res.json();
        // todo get data catalog
        data && setCatalog(data);
        //todo get data models
        data && setModels(data);
      } else {
        throw new Error(`Failed to fetch data. Status: ${res.status}`);
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading model";

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
  }, [api, page, pageSize, props.name, props.sort, props.tasks, props.type]);

  useDebouncedEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => {
    return {
      loading,
      error,
      catalog,
      models,
      page,
      pageSize,
      refreshKey,
      setPage,
      setPageSize,
      fetchData,
      refresh
    };
  }, [
    loading,
    error,
    catalog,
    models,
    page,
    pageSize,
    refreshKey,
    setPage,
    setPageSize,
    fetchData,
    refresh
  ]);
};
