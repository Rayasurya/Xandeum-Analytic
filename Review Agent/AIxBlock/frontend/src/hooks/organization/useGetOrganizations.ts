import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TProps } from "../project/useProjectsHook";
import { TOrganizationsAdmin, validateOrganizationAdminModel } from "@/models/organization";
import useDebouncedEffect from "../useDebouncedEffect";

type TOrganizationResponse = {
  count: number;
  next: boolean | null;
  previous: boolean | null;
  results: TOrganizationsAdmin[];
}

export const useGetOrganizations = (props: TProps = {
  page: 1,
  pageSize: 10,
}) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(props.pageSize ?? 10);
  const [organizations, setOrganizations] = useState<TOrganizationResponse | null>(null);

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

      const data = await res.json();
      const vr = validateOrganizationAdminModel(data?.results);

      if (res.ok) {
        if (vr.isValid) {
          setOrganizations(data);
          setError(null);
        } else {
          setError("Invalid organizations list received from the server. Detail: " + (vr.errors ?? ""));

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading organizations";

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
      organizations,
      page,
      pageSize,
      setPage,
      setPageSize,
      fetchData,
    };
  }, [loading, error, organizations, page, pageSize, setPage, setPageSize, fetchData]);
};
