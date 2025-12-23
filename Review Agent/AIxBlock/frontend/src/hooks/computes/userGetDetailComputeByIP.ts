import {useCallback, useState} from "react";
import { useApi } from "@/providers/ApiProvider";

type Props = {
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
};

type TPrice = {
  id: number;
  token_symbol: string;
  price: number;
  unit: string;
  type: string;
  compute_gpu_id: number;
  compute_marketplace_id: number;
  model_marketplace_id: number | null;
};

type TComputeGPU = {
  id: number;
  prices: TPrice[];
  gpu_name: string;
  power_consumption: number | null;
  gpu_index: number;
  gpu_memory: string;
  branch_name: string | null;
  gpu_id: string;
  serialno: string;
  created_at: string;
  updated_at: string;
  status: string;
  compute_marketplace: number;
  infrastructure_id: string;
};

type TComputeDetail = {
  id: number;
  created_by: number | null;
  sortField: string | null;
  compute_gpus: TComputeGPU[];
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
  config: {
    cpu: string;
    ram: string;
    disk: string;
    diskType: string;
    os: string;
  };
  status: string;
  file: string | null;
  type: string;
  infrastructure_desc: string;
  callback_url: string;
  client_id: string;
  client_secret: string;
  ssh_key: string | null;
  card: string | null;
  price: number;
  compute_type: string | null;
};

export const useDetailComputeByIP = ({ onSuccess, onError }: Props) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [compute, setCompute] = useState<TComputeDetail | null>(null);

  const mutate = useCallback(async ({ ip_address }: { ip_address: string }) => {
    setLoading(true);
    const ar = api.call("getDetailComputeByIP", {
      params: { ip_address: ip_address },
    });

    try {
      const res = await ar.promise;
      if (ar.controller.signal.aborted) return;

      if (res.status === 404) {
        setError(null);
        return;
      }

      const data = await res.json();

      setCompute(data);
      return data;
    } catch (e) {
      if (ar.controller.signal.aborted) return;
      let msg = "An error occurred while loading time working";

      if (e instanceof Error) {
        msg += " Error: " + e.message + ".";
      }

      setError(`${msg} - Please try again!`);
      onError?.(msg);

      if (window.APP_SETTINGS.debug) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }, [api, onError]);

  return {
    loading,
    error,
    compute,
    onSuccess,
    onError,
    mutate,
  };
};
