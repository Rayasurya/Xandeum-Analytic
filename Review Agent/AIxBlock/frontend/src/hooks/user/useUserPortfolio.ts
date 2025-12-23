import React from "react";
import {randomString} from "@/utils/random";
import {useApi} from "@/providers/ApiProvider";
import useDebouncedEffect from "../useDebouncedEffect";

export type TProps = {}

export type TUseUserPortfolioHook = {
  balance: number,
  initialized: boolean,
  loading: boolean,
  error: string | null,
  refresh: () => void,
}

export default function useUserPortfolio(tokenSymbol: string): TUseUserPortfolioHook {
  const [balance, setBalance] = React.useState<number>(0);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<null | string>(null);
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const api = useApi();

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  useDebouncedEffect(() => {
    setLoading(true);
    setError(null);

    const ar = api.call("getUserPortfolioByToken", {
      query: new URLSearchParams({
        token_symbol: tokenSymbol,
      }),
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.clone().json();

        if (typeof data === "object" && Object.hasOwn(data, "amount_holding") && typeof data["amount_holding"] === "number") {
          setBalance(data["amount_holding"]);
        } else {
          setError("Invalid user's portfolio received from the server.");
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while getting user's portfolio.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setError(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }

        setLoading(false);
        setInitialized(true);
      })

    return () => {
      ar.controller.abort("Unmounted");
    }
  }, [api, refreshKey, tokenSymbol]);

  return React.useMemo(() => {
    return {
      balance,
      initialized,
      loading,
      error,
      refresh,
    }
  }, [
    balance,
    initialized,
    loading,
    error,
    refresh,
  ]);
}
