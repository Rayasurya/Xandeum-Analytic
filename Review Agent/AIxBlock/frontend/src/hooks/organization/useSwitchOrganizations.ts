import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";

export const useSwitchOrganization = () => {
  const [error, setError] = useState<Record<string, string>>();
  const api = useApi();

  const switchOrganization = useCallback((organization_id: number, cb: () => void) => {
    let response: TApiCallResult;

    response = api.call("switchOrganization", {
      body: { organization_id },
    });

    response.promise
      .then(async (res) => {
        if (response.controller.signal.aborted) {
          return;
        }

        if (res.ok) {
          cb();
        } else {
          const data = await res.json();
          setError({ message: data?.message });
        }
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while switching organization.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
          setError({ message: msg });
        }

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (response.controller.signal.aborted) return;
      });
  }, [api]);

  return useMemo(() => {
    return {
      error,
      switchOrganization,
    };
  }, [error, switchOrganization]);
};
