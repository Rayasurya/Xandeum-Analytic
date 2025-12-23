import { useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import {TCompactOrganizationsList, validateCompactOrganizationsListModel} from "@/models/organization";
import useDebouncedEffect from "../useDebouncedEffect";

export const useGetMyOrganizations = () => {
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<TCompactOrganizationsList>([]);
  const api = useApi();

  useDebouncedEffect(() => {
    const response: TApiCallResult = api.call("myOrganizations");

    response.promise
      .then(async (res) => {
        if (response.controller.signal.aborted) return;
        const data = await res.json();
        const vr = validateCompactOrganizationsListModel(data);

        if (res.ok) {
          if (vr.isValid) {
            setOrganizations(data);
            setError(null);
          } else {
            setError("Invalid organization list received from the server. Please try again!");
            if (window.APP_SETTINGS.debug) {
              console.error(vr);
            }
          }
        }
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading users list.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setError(msg + " Please try again!");

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
      organizations,
      error,
    };
  }, [organizations, error]);
};
