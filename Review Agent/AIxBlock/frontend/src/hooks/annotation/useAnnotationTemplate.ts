import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TProps } from "../project/useProjectsHook";
import useDebouncedEffect from "../useDebouncedEffect";

export type TCompute = {
  id: number;
  title: string;
  token: string;
  team_id: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  status: "actived" | "pending" | "suppend";
  users: number[];
  name?: string;
};

type TComputeResponse = {
  count: number;
  next: boolean | null;
  previous: boolean | null;
  results: TCompute[];
};

export const useAnnotationTemplate = (
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
  const [computes, setComputes] = useState<TComputeResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const response: TApiCallResult = api.call("getListAnnotationTemplateByPage", {
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
        // todo get data catalog
        data && setCatalog(data);
        //todo get data computes
        data && setComputes(data);
      } else {
        throw new Error(`Failed to fetch data. Status: ${res.status}`);
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading compute";

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

  useDebouncedEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => {
    return {
      loading,
      error,
      catalog,
      computes,
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
    computes,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchData,
  ]);
};
