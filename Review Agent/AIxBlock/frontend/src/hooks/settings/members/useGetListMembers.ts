import React, { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import useDebouncedEffect from "../../useDebouncedEffect";

export type TOrganizationUser = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  last_activity: Date;
  avatar: string;
  initials: string;
  phone: string;
  active_organization: string;
  allow_newsletters: boolean;
  is_compute_supplier: boolean;
  is_model_seller: boolean;
  is_labeler: boolean;
  is_organization_admin: boolean;
  is_freelancer: boolean;
  is_qa: boolean;
  is_qc: boolean;
  is_superuser: boolean;
  is_active: boolean;
  created_projects: string;
  contributed_to_projects: string;
  date_joined: Date;
};

export type TOrganizationMember = {
  id: number;
  organization: number;
  user: TOrganizationUser;
}

type TDataOrganizationMembers = {
  count: number;
  next: string;
  previous: string;
  results: TOrganizationMember[];
}

export const useGetListMembers = (id: number | null, pageCurrent?: number, page_size?: number, project_id?: number) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(pageCurrent ?? 1);
  const [dataMembers, setDataMembers] = useState<TDataOrganizationMembers | null>(null);
  const [search, setSearch] = React.useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);

    if (id === null) {
      return
    }

    const response: TApiCallResult = api.call("memberLists", {
      params: {
        id: id.toString(),
      },
      query: new URLSearchParams({
        page: (page ?? 1).toString(),
        page_size: (page_size ?? 9).toString(),
        project_id: project_id?.toString() || "",
        search,
      }),
    });

    try {
      const res = await response.promise;

      if (response.controller.signal.aborted) return;

      if (res.ok) {
        const data = await res.json();
        setDataMembers(data);
      } else {
        throw new Error(`Failed to fetch data. Status: ${res.status}`);
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading list members";

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
  }, [api, id, page, page_size, project_id, search])

  useDebouncedEffect(() => {
    fetchData();
  }, [fetchData, search]);

  return useMemo(() => {
    return {
      loading,
      error,
      dataMembers,
      page,
      setPage,
      fetchData,
      search,
      setSearch,
    };
  }, [loading, error, dataMembers, page, setPage, fetchData, search, setSearch]);
};
