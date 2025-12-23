import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";

export const useInviteMember = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const [isUploadSuccess, setIsUploadSuccess] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{[k:string]: string[]}>({});
  const api = useApi();

  const inviteMember = useCallback(
    async (form: FormData) => {
      return new Promise(async (resolve, reject) => {
        let response: TApiCallResult | null = null;
        setError(null);
        setValidationErrors({});
        setIsUploadSuccess(false);
        setLoading(true);

        try {
          response = api.call("inviteMember", {
            body: form
          });

          const result = await response.promise;

          if (response.controller.signal.aborted) {
            reject("Request aborted");
            return;
          }

          if (result.ok) {
            const data = await result.json();
            setIsUploadSuccess(true);
            resolve(data);
            return;
          }

          const errorData = await result.json();

          if (Object.hasOwn(errorData, "message")) {
            setError(errorData.message);
          } else if (Object.hasOwn(errorData, "detail")) {
            setError(errorData.detail);
          }

          if (Object.hasOwn(errorData, "validation_errors")) {
            setValidationErrors(errorData.validation_errors);
          }

          reject(errorData);
        } catch (e) {
          if (response && response.controller.signal.aborted) {
            reject("Request aborted");
            return;
          }

          let msg = "An error occurred while inviting members.";

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

  const inviteByEmail = useCallback((email: string, organizationId: number, role?: string, projectID?: number) => {
    const form = new FormData();
    form.append("email", email);
    form.append("organizationId", organizationId.toString());
    form.append("role", role ?? "annotator");
    form.append("project_id", projectID?.toString() ?? "");

    const ar = api.call("addMemberByEmail", {body: form});

    setLoading(true);
    setError(null);

    ar.promise
      .then(async r => {
        if (ar.controller.signal.aborted || r.ok) {
          return r;
        }

        const data = await r.clone().json();

        if (Object.hasOwn(data, "detail")) {
          setError(data["detail"]);
        } else {
          setError(r.statusText);
        }

        return r;
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while inviting user.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setError(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }
      })

    return ar;
  }, [api]);

  return useMemo(() => {
    return {
      loading,
      error,
      isUploadSuccess,
      inviteMember,
      validationErrors,
      inviteByEmail,
    };
  }, [loading, error, isUploadSuccess, inviteMember, validationErrors, inviteByEmail]);
};
