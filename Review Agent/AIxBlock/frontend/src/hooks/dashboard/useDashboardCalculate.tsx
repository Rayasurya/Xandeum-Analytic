import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import useDebouncedEffect from "../useDebouncedEffect";

type TDashboardCaculate = {
  lease_computes_count: number;
  rented_models_count: number;
  rented_compute_count: number;
}

export const useDashboardCalculate = () => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TDashboardCaculate | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: TApiCallResult = api.call("dashboardCalculate");

    try {
      const res = await response.promise;
      if (response.controller.signal.aborted) return;
      if (res.ok) {
        const data = await res.json();
        setData(data);
      } else {
        throw new Error(`Failed to fetch data. Status: ${res.status}`);
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading dashboard calculate";

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
  }, [api]);

  useDebouncedEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => {
    return {
      loading,
      error,
      data,
      fetchData,
    };
  }, [
    loading,
    error,
    data,
    fetchData,
  ]);
};
