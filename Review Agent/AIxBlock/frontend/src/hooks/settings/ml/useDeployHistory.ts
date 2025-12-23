import {useCallback, useMemo, useState} from "react";
import {useApi} from "@/providers/ApiProvider";
import {TDeployBackend} from "@/models/deployHistory";
import useDebouncedEffect from "../../useDebouncedEffect";

type TProps = {
  project_id: number;
};

export const useDeployHistory = ({project_id}: TProps) => {
  const api = useApi();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<TDeployBackend[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = api.call("deployHistory", {
      params: {project: project_id.toString()},
    });

    try {
      if (response.controller.signal.aborted) return;
      const res = await response.promise;
      setList(await res.json());
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
    }

    if (response.controller.signal.aborted) return;

    setLoading(false);
    setInitialized(true);
  }, [api, project_id]);

  useDebouncedEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      initialized,
      loading,
      error,
      list,
      refresh,
    }),
    [initialized, loading, error, list, refresh]
  );
};
