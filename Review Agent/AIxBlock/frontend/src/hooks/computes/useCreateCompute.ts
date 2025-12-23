import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { getPath, isCreateStep } from "@/pages/Project/Settings/LayoutSettings/utils";

export interface DataCompute {
  ip_address: string;
  token_worker: string;
  client_id: string;
  client_secret: string;
};

export const useCreateCompute = (body: DataCompute) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ field?: string, error: string } | null>(null);
  const api = useApi();
  const navigate = useNavigate();
  // const { dispatch } = useProjectContext();
  const location = useLocation();
  const isGeneralStep = getPath(location.pathname, 1) === "general";

  const onCreate = useCallback(async () => {
    setLoading(true);
    let response: TApiCallResult;

    if (body.ip_address?.length === 0) {
      setError({ field: 'ip_address', error: 'Ip port is required' });
      setLoading(false);
      return;
    }

    response = await api.call('createCompute', {
      body: body,
    });

    response.promise
      .then(async res => {
        if (response.controller.signal.aborted) return;
        const data = await res.json();
        if (data?.validation_errors) {
          setError(data?.validation_errors.title[0]);
        } else {
          if (isCreateStep(location) || isGeneralStep) {
            navigate("/projects/" + data?.id + `/settings/ml`);
          }
          setError(null);
        }
      })
      .catch(e => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading create compute";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
          setError({ error: msg });
        }

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (response.controller.signal.aborted) return;
        setLoading(false);
      })
  }, [api, body, location, isGeneralStep, navigate]);

  return useMemo(() => {
    return {
      loading,
      error,
      onCreate,
    }
  }, [
    loading,
    error,
    onCreate
  ]);
};
