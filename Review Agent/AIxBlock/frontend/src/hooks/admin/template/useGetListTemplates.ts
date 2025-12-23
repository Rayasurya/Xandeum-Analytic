import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { randomString } from "@/utils/random";
import { TProps } from "../../project/useProjectsHook";
import { TAnnotationTemplate, validateAnnotationTemplateListModel } from "@/models/annotationTemplateList";

type TAnnotationTemplateResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TAnnotationTemplate[];
}

export const useGetTemplates = (
  props: TProps = {
    page: 1,
  }
) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TAnnotationTemplateResponse | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const [page, setPage] = useState<number>(props.page ?? 1);
  
  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);
  const fetchData = useCallback(async () => {
    setLoading(true);

    const response: TApiCallResult = api.call("templatesList", {
      query: new URLSearchParams({
        page: page.toString(),
        page_size: '10',
      }),
    });

    try {
      const res = await response.promise;

      if (response.controller.signal.aborted) return;
      const data = await res.json();
      
      const vr = validateAnnotationTemplateListModel(data?.results);
      
      if (vr.isValid) {
        setTemplates(data);
        setError(null);
      } else {
        setError("Invalid annotation template list received from the server. Please try again!");
        if (window.APP_SETTINGS.debug) {
          console.error(vr);
        }
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
  }, [api, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => {
    return {
      loading,
      templates,
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
    templates,
    refreshKey,
    fetchData,
    refresh,
    page,
    setPage
  ]);
};
