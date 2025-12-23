import React, {useState} from "react";
import {TApiCallResult, useApi} from "@/providers/ApiProvider";
import {randomString} from "@/utils/random";
import {validateRewardActionsResponse} from "@/dtos/rewards";
import {TRewardAction} from "@/models/rewards";
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

export type TSaveRewardAction = Optional<TRewardAction, "id">;

export type TUseRewardActionsHook = {
  list: TRewardAction[],
  initialized: boolean,
  loading: boolean,
  loadingError: string | null,
  page: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  pageSize: number,
  setPageSize: React.Dispatch<React.SetStateAction<number>>,
  total: number,
  refresh: () => void,
  save: (item: TSaveRewardAction) => TApiCallResult,
  saving: boolean,
  savingError: string | null,
  validationErrors: { [k: string]: string[] },
}

export default function useRewardActionsHook(props?: TProps): TUseRewardActionsHook {
  const [list, setList] = React.useState<TRewardAction[]>([]);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingError, setLoadingError] = React.useState<null | string>(null);
  const [page, setPage] = React.useState<number>(props?.page ?? 1);
  const [pageSize, setPageSize] = React.useState<number>(props?.pageSize ?? 1000);
  const [total, setTotal] = React.useState<number>(0);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [savingError, setSavingError] = React.useState<null | string>(null);
  const [validationErrors, setValidationErrors] = useState<{ [k: string]: string[] }>({});
  const [refreshKey, setRefreshKey] = React.useState(randomString());
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

    const ar = api.call("rewardActions", {
      query: queries,
    });

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        const vr = validateRewardActionsResponse(data);

        if (vr.isValid) {
          setList(vr.data.results);
          setTotal(vr.data.count);
          setLoadingError(null);
        } else {
          setLoadingError("Invalid reward actions received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading reward actions list.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
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

  const save = React.useCallback((item: TSaveRewardAction): TApiCallResult => {
    const isUpdate = item.id && item.id > 0;
    setSaving(true);
    setSavingError(null);
    setValidationErrors({});

    const ar = api.call(isUpdate ? "updateRewardAction" : "createRewardAction", {
      body: item,
      params: isUpdate ? {action_id: (item.id ?? 0).toString()} : {},
    });

    ar.promise
      .then(async r => {
        if (r.ok) {
          refresh();
        }

        const errorData = await r.clone().json();

        if (Object.hasOwn(errorData, "message")) {
          setSavingError(errorData.message);
        } else if (Object.hasOwn(errorData, "detail")) {
          setSavingError(errorData.detail);
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
          setSavingError(msg);
        }

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }

        setSaving(false);
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
      save,
      saving,
      savingError,
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
    save,
    saving,
    savingError,
    validationErrors,
  ]);
}
