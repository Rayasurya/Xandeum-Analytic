import React, { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { randomString } from "@/utils/random";
import { TProps } from "./useProjectsHook";
import useDebouncedEffect from "../useDebouncedEffect";

export interface Label {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  approved: boolean;
  created_by: number;
  approved_by: number | null;
  organization: number;
  projects: number[];
}

export interface LabelsData {
  count: number;
  next: string | null;
  previous: string | null;
  results: Label[];
}

export const useGetLabels = (
  props: TProps = {
    page: 1,
  }
) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [labels, setLabels] = useState<LabelsData>({
    count: 0,
    next: null,
    previous: null,
    results: []
  });
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const [page, setPage] = useState<number>(props.page ?? 1);

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);
  const fetchData = useCallback(async () => {
    setLoading(true);

    const response: TApiCallResult = api.call("getLabels", {
      query: new URLSearchParams({
        page: page.toString(),
      }),
    });

    try {
      const res = await response.promise;

      if (response.controller.signal.aborted) return;
      const data = await res.json();
      setLabels(data);

      // const vr = validateAnnotationTemplateListModel(data?.results);

      // if (vr.isValid) {
      //   setLabels(data);
      //   setError(null);
      // } else {
      //   setError("Invalid annotation template list received from the server. Please try again!");
      //   if (window.APP_SETTINGS.debug) {
      //     console.error(vr);
      //   }
      // }
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
  }, [api, page]);

  useDebouncedEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => {
    return {
      loading,
      labels,
      error,
      refreshKey,
      fetchData,
      refresh,
      page,
      setPage
    };
  }, [
    loading,
    error,
    labels,
    refreshKey,
    fetchData,
    refresh,
    page,
    setPage
  ]);
};
