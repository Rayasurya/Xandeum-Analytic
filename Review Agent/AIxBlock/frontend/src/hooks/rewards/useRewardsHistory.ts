import React, {useState} from "react";
import {TApiCallResult, useApi} from "@/providers/ApiProvider";
import { randomString } from "@/utils/random";
import {validateUserRewardsResponse} from "@/dtos/rewards";
import {TRewardHistory} from "@/models/rewards";
import {Optional} from "react-date-range/_util";
import useDebouncedEffect from "../useDebouncedEffect";

export type TProps = {
  page?: number,
  pageSize?: number,
  user?: number,
  action?: number,
  order?: number,
  status?: number,
}

export type TCreateRewardHistory = Optional<TRewardHistory, "id">;

export type TUseRewardsHistoryHook = {
  list: TRewardHistory[],
  initialized: boolean,
  loading: boolean,
  loadingError: string | null,
  page: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  pageSize: number,
  setPageSize: React.Dispatch<React.SetStateAction<number>>,
  total: number,
  refresh: () => void,
  create: (item: TCreateRewardHistory) => TApiCallResult,
  creating: boolean,
  creatingError: string | null,
  validationErrors: { [k: string]: string[] },
}

/**
 * Get projects list
 *
 * @param {TProps} props
 */
export default function useRewardsHistoryHook(props?: TProps): TUseRewardsHistoryHook {
  const [list, setList] = React.useState<TRewardHistory[]>([]);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingError, setLoadingError] = React.useState<null | string>(null);
  const [page, setPage] = React.useState<number>(props?.page ?? 1);
  const [pageSize, setPageSize] = React.useState<number>(props?.pageSize ?? 15);
  const [total, setTotal] = React.useState<number>(0);
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const [creating, setCreating] = React.useState<boolean>(false);
  const [creatingError, setCreatingError] = React.useState<null | string>(null);
  const [validationErrors, setValidationErrors] = useState<{ [k: string]: string[] }>({});
  const api = useApi();

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  const queries = React.useMemo(() => new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  }), [page, pageSize]);

  useDebouncedEffect(() => {
    setLoading(true);
    setLoadingError(null);

    const ar = api.call("userRewards", {
      query: queries,
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        const vr = validateUserRewardsResponse(data);

        if (vr.isValid) {
          setList(vr.data.results);
          setTotal(vr.data.count);
          setLoadingError(null);
        } else {
          setLoadingError("Invalid rewards history received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading rewards history list.";

        if (e instanceof Error) {
          msg += " Error: "  + e.message + ".";
        }

        setLoadingError(msg + " Please try again!");

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
      ar.controller.abort();
    }
  }, [api, page, pageSize, queries, refreshKey]);

  const create = React.useCallback((item: TCreateRewardHistory) => {
    setCreating(true);
    setCreatingError(null);
    setValidationErrors({});

    const ar = api.call("createUserReward", {
      body: item,
    });

    ar.promise
      .then(async r => {
        if (r.ok) {
          refresh();
        }

        const errorData = await r.clone().json();

        if (Object.hasOwn(errorData, "message")) {
          setCreatingError(errorData.message);
        } else if (Object.hasOwn(errorData, "detail")) {
          setCreatingError(errorData.detail);
        }

        if (Object.hasOwn(errorData, "validation_errors")) {
          setValidationErrors(errorData.validation_errors);
        }

        return r;
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while saving reward action";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
          setCreatingError(msg);
        }

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }

        setCreating(false);
      });

    return ar;
  }, [api, refresh]);

  return React.useMemo(() => {
    return {
      list,
      initialized,
      loading,
      loadingError,
      page,
      setPage,
      pageSize,
      setPageSize,
      total,
      refresh,
      create,
      creating,
      creatingError,
      validationErrors,
    }
  }, [
    list,
      initialized,
      loading,
      loadingError,
      page,
      pageSize,
      total,
      refresh,
      create,
      creating,
      creatingError,
      validationErrors,
  ]);
}
