import { useMemo, useState, useCallback } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TMarketplaceGpuModel } from "@/models/marketplaceGpu";
import {
  TMarketplaceGpuListModel,
  validateMarketplaceGpuListModel,
} from "@/models/marketplaceGpuList";
import { DataSelect } from "@/components/Select/Select";
import useDebouncedEffect from "../../useDebouncedEffect";

export const useGetListMarketplaceGpus = (
  project_id?: string | number | null,
  is_using?: string | null,
  compute_type?: string | null,
  is_deploy?: string | null,
) => {
  const [error, setError] = useState<string | null>(null);
  const [computeGpus, setComputeGpus] = useState<DataSelect[]>([]);
  const [gpusListModel, setGpusListModel] = useState<TMarketplaceGpuListModel>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refreshKey for refreshing
  const api = useApi();

  // Function to refresh the data
  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useDebouncedEffect(() => {
    function handleStorageChange(event: any) {
      if (event.key === "apiCallFinished" && event.newValue === "true") {
        setIsChecking(true);
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useDebouncedEffect(() => {
    setLoading(true);

    const qr = new URLSearchParams();

    if (project_id && !isNaN(parseInt(project_id.toString()))) {
      qr.append("project_id", (project_id ?? "0").toString());
    }

    if (is_using) {
      qr.append("is_using", is_using);
    }

    if (compute_type) {
      qr.append("compute_type", compute_type);
    }

    if (is_deploy){
      qr.append("is_deploy", is_deploy);
    }

    const response: TApiCallResult = api.call("computeGpus", { query: qr });

    response.promise
      .then(async (res) => {
        if (response.controller.signal.aborted) {
          return;
        }

        const data = await res.json();
        const vr = validateMarketplaceGpuListModel(
          data.map((d: any) => ({
            ...d,
            compute_cpu:
              typeof d.compute_cpu === "string"
                ? JSON.parse(d.compute_cpu ?? "")
                : d.compute_cpu,
          }))
        );

        if (vr.isValid) {
          const results: DataSelect[] = vr.data.map((j) => {
            return {
              label: j.compute_name,
              options: j.compute_gpus.map((c: TMarketplaceGpuModel) => ({
                label: c.Kind,
                value: c.Value,
              })),
            };
          });
          setGpusListModel(vr.data);
          setComputeGpus(results);
        } else {
          setError(
            "Invalid GPUs list received from the server. Please try again!"
          );

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading compute gpus.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setError(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (response.controller.signal.aborted) return;
        setLoading(false);
        setIsChecking(false);
        setInitialized(true);
        localStorage.setItem("apiCallFinished", "false");
      });
  }, [api, project_id, refreshKey, isChecking, is_using, compute_type, is_deploy]);

  return useMemo(() => {
    return {
      computeGpus,
      gpusListModel,
      error,
      loading,
      refresh,
      initialized,
    };
  }, [computeGpus, gpusListModel, error, loading, refresh, initialized]);
};
