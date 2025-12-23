import { useCallback, useEffect, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { ListRentCard } from "@/models/computeListCard";

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
  model_desc?: string;
  price?: number;
  compute_gpus?: any[];
};

export type TComputeResponse = {
  count: number;
  next: boolean | null;
  previous: boolean | null;
  results: ListRentCard[];
};

export type TpropsCompute = {
  page?: number,
  pageSize?: number,
  search?: string | null,
  fieldSearch?: string | null,
  sort?: string | null,
  catalogId?: string | null,
  type?: string | null,
  getAll?: boolean,
  status?: string | null;
  min_price?: string | null;
  max_price?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
}

export const useGetListComputeMarket = (
  props: TpropsCompute = {
    page: 1,
    pageSize: 10,
    search: null,
    fieldSearch: null,
    sort: null,
    catalogId: null,
    type: null,
    status: "in_marketplace",
    min_price: null,
    max_price: null,
    startDate: null,
    endDate: null,
    location: null,
  }
) => {
  const { search, fieldSearch, sort, catalogId, type, min_price, max_price, startDate, endDate, status, location } = props;
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(props.pageSize ?? 10);
  const [computes, setComputes] = useState<TComputeResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    let params = {};

    const baseParams = {
      page: page.toString(),
      page_size: pageSize.toString(),
    }

    const query = new URLSearchParams(Object.keys(params).length ? params : baseParams);

    if (search) {
      query.append('search', search);
    }
    if (fieldSearch) {
      query.append('fieldSearch', fieldSearch);
    }
    if (sort) {
      query.append('sort', sort);
    }
    if (catalogId) {
      query.append('catalog_id', catalogId);
    }
    if (type) {
      query.append('type', type);
    }
    if (min_price) {
      query.append('min_price', min_price);
    }
    if (startDate) {
      query.append('startDate', startDate);
    }
    if (max_price) {
      query.append('max_price', max_price);
    }
    if (endDate) {
      query.append('endDate', endDate);
    }

    if (status) {
      query.append('status', status);
    }

    if (location) {
      query.append('location', location);
    }

    const response: TApiCallResult = api.call("getListComputeMarket", {
      query
    });

    try {
      const res = await response.promise;

      if (response.controller.signal.aborted) return;
      const data: TComputeResponse = await res.json();
      setComputes(data);
      
    //   const vr = validateComputeMarketplaceListModel(data.results);

    //   if (vr.isValid) {
    //     setComputes(data);
    //     setError(null);
    //   } else {
    //     setError("Invalid compute marketplace list received from the server. Please try again!");
    //     if (window.APP_SETTINGS.debug) {
    //       console.error(vr);
    //     }
    //   }
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
  }, [api, page, pageSize, catalogId, fieldSearch, search, sort, type, min_price, max_price, startDate, endDate , status, location]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => {
    return {
      loading,
      error,
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
    computes,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchData,
  ]);
};
