import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TMarketplaceCatalog } from "@/models/modelMarketplaceCatalog";
import useDebouncedEffect from "../useDebouncedEffect";

type TType = "model" | "compute";

type MarketplaceCatalog = TMarketplaceCatalog & {
  key: string;
}

export const useGetListCatalog = (props: {
  type: TType
}) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [listData, setListData] = useState<MarketplaceCatalog[] | null>(null);

  const fetchData = useCallback(async (params?: {
    filter: string;
    value: string;
  }) => {
    setLoading(true);

    const endpoint = props.type === "model" ? "getListModelCatalog" : "getListComputeCatalog";

    const response: TApiCallResult = api.call(endpoint, params ? { params: params } : {});

    try {
      const res = await response.promise;

      if (response.controller.signal.aborted) return;
      const data = await res.json();
      setListData(data);

      // const vr = validateMarketplaceCatalogListModel(data);

      // console.log('cvcccc', vr)
      // if (vr.isValid) {
      //   setListData(vr.data);
      //   setError(null);
      // } else {
      //   setError("Invalid marketplace catalog list received from the server. Please try again!sss");
      //   if (window.APP_SETTINGS.debug) {
      //     console.error(vr);
      //   }
      // }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading list model catalog";

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
  }, [api, props.type])

  useDebouncedEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => {
    return {
      loading,
      error,
      listData,
      fetchData,
    };
  }, [loading, error, listData, fetchData]);
};
