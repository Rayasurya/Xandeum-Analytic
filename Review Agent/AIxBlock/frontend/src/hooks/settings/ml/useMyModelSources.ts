import {useCallback, useMemo, useState} from "react";
import {useApi} from "@/providers/ApiProvider";
import {TModelSourceList, validateModelSourceList} from "@/models/modelSource";
import useDebouncedEffect from "../../useDebouncedEffect";

type TProps = {
  project_id?: string;
};

export const useMyModelSources = ({project_id = ""}: TProps) => {
  const api = useApi();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modelSourceList, setModelSourceList] = useState<TModelSourceList>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const response = api.call("myModelSources", {
      query: new URLSearchParams({project_id}),
    });

    try {
      if (response.controller.signal.aborted) return;

      const res = await response.promise;
      const data = await res.json();
      const vr = validateModelSourceList(data);

      if (vr.isValid) {
        setModelSourceList(vr.data);
        setError(null);
      } else {
        setError("Invalid model source list received from the server. Detail: " + (vr.errors ?? ""));

        if (window.APP_SETTINGS.debug) {
          console.error(vr);
        }
      }
    } catch (e) {
      if (response.controller.signal.aborted) return;

      let msg = "An error occurred while loading checkpoint";

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

    setInitialized(true);
  }, [api, project_id]);

  useDebouncedEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({initialized, loading, error, modelSourceList}),
    [initialized, loading, error, modelSourceList]
  );
};
