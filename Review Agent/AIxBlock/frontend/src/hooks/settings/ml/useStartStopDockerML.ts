import { useCallback, useMemo, useState } from "react";
import { useApi } from "@/providers/ApiProvider";


export const useUpdateStartStopDockerML = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Record<string, string[]> | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const api = useApi();

  const onUpdateStartStop = useCallback((action: string, mlId: string) => {
    setLoading(true);
    const ar = api.call("startStopMLDocker", {
      query: new URLSearchParams({
        ml_id: mlId.toString(),
        action: action.toString()
      })
    });

    ar.promise
      .then(async (r) => {

        if (ar.controller.signal.aborted) return;
        const res = r.clone();
        const data = await res.json();
        if (data?.validation_errors) {
          setError(data?.validation_errors);
        } else {
          setIsUpdated(true);
          setError(null);
        }

        return r;
      })
      .catch((e) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading update model marketplace";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
          setError({ system: [msg] });
        }

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) return;
        setLoading(false);
      });

    return ar;
  }, [api]);

  return useMemo(() => {
    return {
      loading,
      error,
      isUpdated,
      onUpdateStartStop,
    };
  }, [loading, error, isUpdated, onUpdateStartStop]);
};
