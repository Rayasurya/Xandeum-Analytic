import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TProps } from "../project/useProjectsHook";
import { TGpu, TGpuPrice } from "./useListGpuCompute";
import useDebouncedEffect from "../useDebouncedEffect";

export type Status = "created" | "in_marketplace" | "rented_bought" | "completed" | "pending" | "suppend" | "expired";
export type Type = "MODEL-SYSTEM" | "MODEL-CUSTOMER";

export type created_by = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;
}

export type TComputeSupply = {
  id: number;
  created_by: created_by;
  sortField: string;
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
  status: Status;
  file: string;
  type: Type;
  infrastructure_desc: string;
  callback_url: string;
  client_id: string;
  client_secret: string;
  ssh_key: string;
  card: number;
  price: number;
	compute_type: string;
	is_using_cpu: boolean;
	compute_gpus: TGpu[];
	cpu_price: TGpuPrice;
  remaining: string;
}

type TComputeSupplyResponse = {
  count: number;
  next: boolean | null;
  previous: boolean | null;
  results: TComputeSupply[];
}

type Props = TProps & {
  type?: "supply" | "rented"
}

export const useGetListComputeMarketplace = (props: Props = {
  page: 1,
  pageSize: 10,
  type: "supply"
}) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(props.pageSize ?? 10);
  const [listData, setListData] = useState<TComputeSupplyResponse | null>(null);
  const [count, setCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const endpoint = props.type === "supply" ? "listComputeSupply" : "listComputeRented";

    const response: TApiCallResult = api.call(endpoint, {
      query: new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      }),
    });

    try {
      const res = await response.promise;

      if (response.controller.signal.aborted) return;

      if (res.ok) {
        const data = await res.json();
        data && setListData(data);
        data && setCount(data.count);
      } else {
        throw new Error(`Failed to fetch data. Status: ${res.status}`);
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading compute supply";

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
  }, [api, page, pageSize, props.type])

  useDebouncedEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => {
    return {
      loading,
      error,
      listData,
      count,
      page,
      pageSize,
      setPage,
      setPageSize,
      fetchData,
    };
  }, [loading, error, listData, count, page, pageSize, setPage, setPageSize, fetchData]);
};
