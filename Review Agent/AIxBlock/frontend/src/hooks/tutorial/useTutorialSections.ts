import React from "react";
import {randomString} from "@/utils/random";
import {TApiCallResult, useApi} from "@/providers/ApiProvider";
import {TTutorialSection, validateTutorialSectionListModel} from "@/models/tutorialSection";

export type TUseTutorialSectionsHook = {
  list: TTutorialSection[],
  initialized: boolean,
  loading: boolean,
  saving: boolean,
  error: string | null,
  refresh: () => void,
  save: (obj: Partial<TTutorialSection>) => TApiCallResult,
}

export default function useTutorialSections(): TUseTutorialSectionsHook {
  const [list, setList] = React.useState<TTutorialSection[]>([]);
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

    const ar = api.call("listTutorialSection");

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.clone().json();
        const vr = validateTutorialSectionListModel(data);

        if (vr.isValid) {
          setList(vr.data);
        } else {
          setError("Invalid tutorial sections list received from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading tutorial sections list.";

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

  const save = React.useCallback((obj: Partial<TTutorialSection>) => {
    setSaving(true);

    const ar = api.call(obj.id && obj.id > 0 ? "updateTutorialSection" : "createTutorialSection", {
      body: obj,
      params: obj?.id && obj?.id > 0 ? {id: obj.id?.toString()} : {},
    });

    ar.promise
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while saving tutorial section.";

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
