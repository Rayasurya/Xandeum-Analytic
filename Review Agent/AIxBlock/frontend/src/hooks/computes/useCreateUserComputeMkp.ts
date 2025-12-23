import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";

export interface BodyUser {
  ip_address: string;
  infrastructure_id?: string;
  client_id?: string;
  client_secret?: string;
  compute_type?: string;
  file?: Blob;
  location_id?: string;
  location_alpha2?: string;
  location_name?: string;
  compute_id?: string;
  machine_options?: string[];
}

export const useCreateUserComputeMkp = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const [isCreateSuccess, setIsCreateSuccess] = useState<boolean>(false);
  const api = useApi();

  const onCreate = useCallback(
    async (body: BodyUser) => {
      return new Promise(async (resolve, reject) => {
        let response: TApiCallResult | null = null;

        try {
          response = api.call("computeMkpCreateUser", {
            body: body
          });

          const result = await response.promise;

          if (response.controller.signal.aborted) {
            reject("Request aborted");
            return;
          }

          if (result.ok) {
            const data = await result.json();
            setIsCreateSuccess(true);
            resolve(data);
          } else {
            const res = await result.json();
            if (res?.status_code === 400) {
              setError(res?.validation_errors);
            }
            if (res?.status_code === 500) {
              setError(res?.detail);
            }
          }
        } catch (e) {
          if (response && response.controller.signal.aborted) {
            reject("Request aborted");
            return;
          }

          let msg = "An error occurred while create user.";

          if (e instanceof Error) {
            msg += " Error: " + e.message + ".";
            setError(msg);
            reject(e);
          }

          if (window.APP_SETTINGS.debug) {
            console.error(e);
          }

          reject(msg);
        } finally {
          if (response && response.controller.signal.aborted) return;
          setLoading(false);
        }
      });
    },
    [api]
  );

  return useMemo(() => {
    return {
      loading,
      error,
      isCreateSuccess,
      onCreate
    };
  }, [loading, error, isCreateSuccess, onCreate]);
};
