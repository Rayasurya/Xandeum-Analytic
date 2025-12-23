import { useCallback, useEffect, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TProps } from "../../project/useProjectsHook";
import {
  TCatalogCompute,
  validateCatalogComputeListModel,
} from "@/models/catalogCompute";

type TComputeResponse = {
  count: number;
  next: boolean | null;
  previous: boolean | null;
  results: TCatalogCompute[];
};

export const useGetCataCompute = (
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
  const [catalog, setCatalog] = useState<TComputeResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const response: TApiCallResult = api.call("getListComputeCatalogByPage", {
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
        const vr = validateCatalogComputeListModel(data.results);
        if (vr.isValid) {
          setCatalog(data);
          setError(null);
        } else {
          setError(
            "Invalid catalog compute list received from the server. Please try again!"
          );
          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      } else {
        throw new Error(`Failed to fetch data. Status: ${res.status}`);
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading catalog compute";

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
      page,
      pageSize,
      setPage,
      setPageSize,
      fetchData,
    };
  }, [
    loading,
    error,
    catalog,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchData,
  ]);
};
