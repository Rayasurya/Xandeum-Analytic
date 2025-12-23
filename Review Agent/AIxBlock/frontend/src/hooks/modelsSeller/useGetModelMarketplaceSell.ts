import React from "react";
import { useApi } from "@/providers/ApiProvider";
import { TModelMarketplaceSell } from "./useGetModelMarketplaceListSell";
import useDebouncedEffect from "../useDebouncedEffect";

export type TModelHook = {
  loading: boolean;
  errorLoading: string | null;
  detail: TModelMarketplaceSell | null;
};

/**
 * Fetch model information.
 *
 * @param {number | undefined} id
 */
export default function useGetModelMarketplaceSell(id?: string): TModelHook {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorLoading, setErrorLoading] = React.useState<null | string>(null);
  const [detail, setDetail] = React.useState<TModelMarketplaceSell | null>(null);
  const api = useApi();

  useDebouncedEffect(() => {
    if (!id || isNaN(Number(id))) {
      return;
    }

    setLoading(true);
    setErrorLoading(null);

    const ar = api.call("getModel", {
      params: { id },
    });

    ar.promise
      .then(async (r) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        setDetail(data);
      })
      .catch((e) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading model information.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setErrorLoading(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }

        setLoading(false);
      });

    return () => {
      ar.controller.abort();
    };
  }, [api, id]);

  return React.useMemo(() => {
    return {
      loading,
      errorLoading,
      detail,
    };
  }, [loading, errorLoading, detail]);
}
