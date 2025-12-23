import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import {TOrganizationsAdmin} from "@/models/organization";
import { TUserModel } from "@/models/user";

export type TAdminOrganizationDTO = Pick<TOrganizationsAdmin, "id" | "title" | "status" | "token" | "team_id">;

export const useAdminOrganizations = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const [validationErrors, setValidationErrors] = useState<{[k:string]: string[]}>({});
  const api = useApi();

  const save = useCallback(
    async (data: TAdminOrganizationDTO) => {
      setValidationErrors({});
      setError("");

      return new Promise(async (resolve, reject) => {
        let response: TApiCallResult | null = null;

        try {
          response = api.call(data.id && data.id > 0 ? "adminOrgUpdate" : "adminOrgCreate", {
            params: data.id > 0 ? {id: data.id.toString()} : {},
            body: data,
          });

          const result = await response.promise;

          if (response.controller.signal.aborted) {
            reject("Request aborted");
            return;
          }

          if (result.ok) {
            const data = await result.json();
            resolve(data);
            return;
          }

          const res = await result.json();

          if (Object.hasOwn(res, "validation_errors")) {
            setValidationErrors(res["validation_errors"]);
          }

          if (Object.hasOwn(res, "detail")) {
            setError(res["detail"]);
          }
        } catch (e) {
          if (response && response.controller.signal.aborted) {
            reject("Request aborted");
            return;
          }

          let msg = "An error occurred while saving organization.";

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

  const removeMember = useCallback((orgID: number, userID: number, project_id?: number) => {
    setLoading(true)
    const form = new FormData();
    form.append("memberId", userID.toString());
    form.append("organizationId", orgID.toString());

    if (project_id){
      form.append("project_id", project_id.toString());
    }
    const ar = api.call("deleteMember", {body: form});

    ar.promise
      .finally(() => {
        setLoading(false);
      });

    return ar;
  }, [api]);

  const updateMember = useCallback((user: TUserModel, id: number) => {
    setLoading(true)
    const ar = api.call("updateUser", {
      params: { id: id.toString() ?? "" },
      body: user
    });

    ar.promise
      .finally(() => {
        setLoading(false);
      });

    return ar;
  }, [api]);

  return useMemo(() => {
    return {
      loading,
      error,
      save,
      validationErrors,
      removeMember,
      updateMember,
    };
  }, [loading, error, save, validationErrors, removeMember, updateMember]);
};
