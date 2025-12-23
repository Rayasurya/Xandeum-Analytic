import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TProps } from "../../project/useProjectsHook";
import { randomString } from "@/utils/random";
import { validateMarketplaceCatalogListModel } from "@/models/modelMarketplaceCatalog";

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
  status: "created" | "updated" | "deleted";
};
 
type TModelResponse = {
  count: number;
  next: boolean | null;
  previous: boolean | null;
  results: TModel[];
};

export const useGetCataModel = (
  props: TProps = {
    page: 1,
    pageSize: 10,
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

    const response: TApiCallResult = api.call("getListModelCatalogByPage", {
      query: new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      }),
    });

    try {
      const res = await response.promise;

      if (response.controller.signal.aborted) return;
      const data = await res.json();

      const vr = validateMarketplaceCatalogListModel(data.results);

      if (res.ok) {
        if (vr.isValid) {
          setCatalog(data);
          setModels(data);
        } else {
          setError("Invalid model catalog received from the server. Please try again!");
          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
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
  }, [api, page, pageSize]);

  useEffect(() => {
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
