import { useCallback, useMemo, useState } from "react";
import { useApi } from "@/providers/ApiProvider";

export const useCreateMLBackend = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const [isCreateSuccess, setIsCreateSuccess] = useState<boolean>(false);
  const api = useApi();

  const onCreateMl = useCallback((projectId: number, ip_address: string, port: string, mlId: number) => {
    const ar = api.call("createMLBackend", {
      body: {
        project: projectId,
        url: "http://" + (ip_address || "") + ":" + (port || ""),
        ml_id: mlId
      }
    });

    ar.promise
      .then(async r => {
        if (r.ok) {
          setIsCreateSuccess(true);
        } else {
          const res = await r.clone().json();

          if (Object.hasOwn(res, "detail")) {
            throw new Error(res["detail"]);
          }
        }

        return r;
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while creating ML.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
          setError(msg);
        }

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

    return ar;
  }, [api]);

  return useMemo(() => {
    return {
      loading,
      error,
      isCreateSuccess,
      onCreateMl
    };
  }, [loading, error, isCreateSuccess, onCreateMl]);
};
