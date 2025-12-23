import {useCallback, useMemo, useState} from "react";
import {useApi} from "@/providers/ApiProvider";

export const useSaveGlobalStorage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const api = useApi();
  const [validationErrors, setValidationErrors] = useState<{ [k: string]: string[] }>({});

  const save = useCallback((body: any, type: string, selectedItem?: any) => {
    setError(null);
    setValidationErrors({});

    const response = api.call(selectedItem ? "updateGlobalStorage" : "createGlobalStorage", {
      body,
      params: selectedItem ? {
        type,
        pk: selectedItem.id.toString(),
      } : {
        type,
      },
    });

    response.promise
      .then(async r => {
        if (response.controller.signal.aborted) return r;

        if (r.ok) {
          return r;
        }

        const data = await r.clone().json();

        if (Object.hasOwn(data, "message")) {
          setError(data.message);
        } else if (Object.hasOwn(data, "detail")) {
          setError(data.detail);
        }

        if (Object.hasOwn(data, "validation_errors")) {
          setValidationErrors(data.validation_errors);
        }

        return r;
      })
      .catch((e) => {
        if (response.controller.signal.aborted) return;
        let msg = "An error occurred while loading Storage";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
          setError(msg);
        }

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (response.controller.signal.aborted) return;
        setLoading(false);
      });

    return response;
  }, [api]);

  return useMemo(() => {
    return {
      loading,
      error,
      save,
      validationErrors,
    };
  }, [loading, error, save, validationErrors]);
};
