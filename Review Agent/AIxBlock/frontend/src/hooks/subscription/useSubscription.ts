import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TProps } from "../project/useProjectsHook";
import { TOrganizationsAdmin } from "@/models/organization";
import useDebouncedEffect from "../useDebouncedEffect";

type TSubscriptionResponse = {
  count: number;
  next: boolean | null;
  previous: boolean | null;
  results: TOrganizationsAdmin[];
};

export const useGetSubscription = (
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
  const [plan, setPlan] = useState<TSubscriptionResponse | null>(null);
  const [subscription, setSubscription] =
    useState<TSubscriptionResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const response: TApiCallResult = api.call("organizationList", {
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
        // todo get data plan
        data && setPlan(data);
        //todo get data subscription
        data && setSubscription(data);
      } else {
        throw new Error(`Failed to fetch data. Status: ${res.status}`);
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading subscription";

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
      plan,
      subscription,
      page,
      pageSize,
      setPage,
      setPageSize,
      fetchData,
    };
  }, [
    loading,
    error,
    plan,
    subscription,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchData,
  ]);
};
