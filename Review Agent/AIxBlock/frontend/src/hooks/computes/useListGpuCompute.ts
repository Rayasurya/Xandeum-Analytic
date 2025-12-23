import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import useDebouncedEffect from "../useDebouncedEffect";


export type TGpuPrice = {
  id: number;
  token_symbol: string;
  price: number;
  compute_gpu_id: number;
  unit: string;
}

export type TGpu = {
  id: number;
  prices: TGpuPrice[];
  gpu_name: string;
  power_consumption: any;
  gpu_index: number;
  gpu_memory: any;
  branch_name: any;
  gpu_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  compute_marketplace: number;
  infrastructure_id: string;
  being_rented: boolean;
}


export type TInfrastructure = {
  id: number;
  created_by: any;
  sortField: any;
  compute_gpus: TGpu[];
  name: string;
  created_at: string;
  updated_at: string;
  infrastructure_id: string;
  owner_id: number;
  author_id: number;
  catalog_id: number;
  organization_id: number;
  order: number;
  ip_address: string;
  port: string;
  docker_port: string;
  kubernetes_port: string;
  config: string;
  status: string;
  file: any;
  type: string;
  infrastructure_desc: string;
  callback_url: string;
  client_id: string;
  client_secret: string;
  ssh_key: any;
  card: any;
  price: number;
  compute_type: string;
}

export type TCompute = {
  id: number;
  infrastructure: TInfrastructure;
  gpu_name: string;
  power_consumption: any;
  gpu_index: number;
  gpu_memory: any;
  branch_name: any;
  gpu_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  compute_marketplace: number;
  infrastructure_id: string;
};

type TProps = {
  page?: number;
  pageSize?: number;
  search?: string | null;
  fieldSearch?: string | null;
  sort?: string | null;
  type?: string | null;
  getAll?: boolean;
  status?: string | null;
  infrastructure_id?: string | null;
};


type TComputeGpuResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TCompute[];
};

export const useListGpuCompute = (props: TProps = {
  page: 1,
  pageSize: 9,
  search: null,
  fieldSearch: null,
  sort: null,
  infrastructure_id: null,
  type: null
}) => {
  const api = useApi();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(props.pageSize ?? 9);
  const [listData, setListData] = useState<TComputeGpuResponse | null>(null);

  const fetchData = useCallback(async () => {

    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (props.search) {
      query.append('search', props.search);
    }
    if (props.fieldSearch) {
      query.append('fieldSearch', props.fieldSearch);
    }
    if (props.sort) {
      query.append('sort', props.sort);
    }
    if (props.infrastructure_id) {
      query.append('infrastructure_id', props.infrastructure_id);
    }
    if (props.type) {
      query.append('type', props.type);
    }

    const response: TApiCallResult = api.call("listComputeGpu", {
      query,
    });

    try {
      const res = await response.promise;

      if (response.controller.signal.aborted) return;
      const data: TComputeGpuResponse = await res.json();
      setListData(data);
      setError(null);
    } catch (e) {
      if (response.controller.signal.aborted) return;
      let msg = "An error occurred while loading list sell marketplace model";
      if (e instanceof Error) {
        msg += " Error: " + e.message + ".";
        setError(msg);
      }
    } finally {
      if (response.controller.signal.aborted) return;
      setLoading(false);
    }
  }, [page, pageSize, props.search, props.fieldSearch, props.sort, props.infrastructure_id, props.type, api]);

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
