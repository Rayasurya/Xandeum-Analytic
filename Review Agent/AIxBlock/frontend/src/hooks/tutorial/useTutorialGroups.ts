import React from "react";
import {randomString} from "@/utils/random";
import {TApiCallResult, useApi} from "@/providers/ApiProvider";
import {TTutorialGroup, validateTutorialGroupListModel} from "@/models/tutorialGroup";

export type TProps = {}

export type TUseTutorialGroupsHook = {
  list: TTutorialGroup[],
  initialized: boolean,
  loading: boolean,
  saving: boolean,
  error: string | null,
  refresh: () => void,
  save: (obj: Partial<TTutorialGroup>) => TApiCallResult,
}

export default function useTutorialGroups(): TUseTutorialGroupsHook {
  const [list, setList] = React.useState<TTutorialGroup[]>([]);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<null | string>(null);
  const [refreshKey, setRefreshKey] = React.useState(randomString());
  const api = useApi();

  const refresh = React.useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    const ar = api.call("listTutorialGroup");

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.clone().json();
        const vr = validateTutorialGroupListModel(data);

        if (vr.isValid) {
          setList(vr.data);
        } else {
          setError("Invalid tutorial groups list received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading tutorial groups list.";

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
      ar.controller.abort();
    }
  }, [api, refreshKey]);

  const save = React.useCallback((obj: Partial<TTutorialGroup>) => {
    setSaving(true);

    const ar = api.call(obj.id && obj.id > 0 ? "updateTutorialGroup" : "createTutorialGroup", {
      body: {
        name: obj?.name ?? "",
        order: obj?.order ?? 0,
      },
      params: obj?.id && obj?.id > 0 ? {id: obj.id?.toString()} : {},
    });

    ar.promise
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while saving tutorial group.";

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

        setSaving(false);
      });

    return ar;
  }, [api]);

  return React.useMemo(() => {
    return {
      list,
      initialized,
      loading,
      saving,
      error,
      refresh,
      save,
    }
  }, [
    list,
    initialized,
    loading,
    saving,
    error,
    refresh,
    save,
  ]);
}
