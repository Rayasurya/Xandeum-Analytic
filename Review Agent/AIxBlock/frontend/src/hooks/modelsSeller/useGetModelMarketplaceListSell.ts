import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { Status } from "../computes/useGetListComputeMarketplace";
import { TProps } from "../project/useProjectsHook";
import {
  MACHINE_TYPES_LIST,
  TComputeMarketplaceV2ComputeType,
  TComputeMarketplaceV2Status,
  TComputeMarketplaceV2Type
} from "@/pages/ComputesMarketplaceV2/types";
import useDebouncedEffect from "../useDebouncedEffect";
import {TModelTask} from "@/models/modelMarketplace";

export type TModelMarketplaceSell = {
  id: number;
  name: string;
  model_type: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
  author_id: number;
  checkpoint_storage_id: string;
  ml_id: number;
  catalog_id: number;
  order: number;
  config: string;
  dataset_storage_id: number;
  image_dockerhub_id: number;
  infrastructure_id: string;
  model_desc: string;
  type: string;
  ip_address: string;
  port: string;
  price: number;
  status: Status;
  file: string;
  organization_id: number;
  docker_image: string;
  docker_access_token: string;
  model_id?: string;
  model_source?: string;
  model_token?: string;
  checkpoint_id?: string;
  total_user_rent?: number;
  checkpoint_source?: string;
  download_count?: number;
  like_count?: number;
  checkpoint_token?: string;
  related_compute?: {
    id: number;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
    infrastructure_id: string;
    owner_id: number;
    arthor_id: number;
    catalog_id: number;
    organization_id: number;
    order: number;
    ip_address: string;
    port: string;
    docker_port: string;
    kubernetes_port: string;
    config?: string | null;
    is_using_cpu?: boolean | null;
    status: TComputeMarketplaceV2Status;
    file?: string | null;
    type: TComputeMarketplaceV2Type;
    infrastructure_desc: string;
    compute_type?: TComputeMarketplaceV2ComputeType | null;
    location_id?: number | null;
    location_alpha2?: string | null;
    location_name?: string | null;
  } | null;
  related_compute_gpu?: {
    id: number;
    compute_marketplace_id: number;
    infrastructure_id_id: string;
    gpu_name?: string | null;
    power_consumption?: string | null;
    memory_usage?: string | null;
    power_usage?: string | null;
    gpu_index: number;
    gpu_memory?: string | null;
    memory?: string | null;
    gpu_memory_used?: string | null;
    gpu_memory_bandwidth?: string | null;
    disk_bandwidth?: string | null;
    motherboard?: string | null;
    internet_up_speed?: number | null;
    internet_down_speed?: number | null;
    number_of_pcie_per_gpu?: string | null;
    per_gpu_pcie_bandwidth?: string | null;
    eff_out_of_total_nu_of_cpu_virtual_cores?: string | null;
    cores?: string | null;
    cuda_cores?: string | null;
    memory_bus_width?: string | null;
    gpu_clock_mhz?: string | null;
    mem_clock_mhz?: string | null;
    disk?: string | null;
    disk_used?: string | null;
    disk_free?: string | null;
    eff_out_of_total_system_ram?: string | null;
    max_cuda_version?: string | null;
    driver_version?: string | null;
    ubuntu_version?: string | null;
    reliability?: number | null;
    dl_performance_score?: number | null;
    dlp_score?: number | null;
    location_id?: number | null;
    location_alpha2?: string | null;
    location_name?: string | null;
    gpu_tflops?: string | null;
    datacenter?: string | null;
    branch_name?: string | null;
    batch_size?: number | null;
    gpu_id?: string | null;
    serialno?: string | null;
    machine_options?: keyof typeof MACHINE_TYPES_LIST | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
    quantity_used?: number | null;
    user_rented?: number | null;
    max_user_rental?: number | null;
    status: TComputeMarketplaceV2Status;
    owner_id?: number | null;
    gpus_machine?: string | null;
    nvlink_bandwidth?: string | null;
  } | null;
  tasks?: TModelTask[] | null;
};

type TTModelMarketplaceSellResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TModelMarketplaceSell[];
}

export const useGetModelMarketplaceListSell = (props: TProps = {
  page: 1,
  pageSize: 12,
}) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(props.pageSize ?? 12);
  const [listData, setListData] = useState<TTModelMarketplaceSellResponse | null>(null);
  const [count, setCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const response: TApiCallResult = api.call("listSellModelMarketplace", {
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
        data && setCount(data.count)
      } else {
        throw new Error(`Failed to fetch data. Status: ${res.status}`);
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
  }, [api, page, pageSize])

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
