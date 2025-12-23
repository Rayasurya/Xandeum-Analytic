import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import {TUserModel} from "@/models/user";

export const useCreateUser = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const api = useApi();

  const create = useCallback((user: TUserModel) => {
    setLoading(true);
    setValidationErrors({});

    let response: TApiCallResult;
    const isEdit = user.id > 0;

    if (!user.email) {
      setValidationErrors({ email: ["This field may not be blank."] });
      setLoading(false);
      return;
    }

    if (!user.username) {
      setValidationErrors({ username: ["This field may not be blank."] });
      setLoading(false);
      return;
    }

    if (isEdit) {
      response = api.call("updateUser", {
        params: { id: String(user.id) },
        body: user,
      });
    } else {
      response = api.call("createUser", { body: user });
    }

    response.promise
      .then(async (res) => {
        if (response.controller.signal.aborted) {
          return;
        }

        const data = await res.clone().json();

        if (data?.validation_errors) {
          setValidationErrors(data?.validation_errors);
        }

        return res;
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while saving user";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
          setValidationErrors({ system: [msg] });
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
      validationErrors,
      create,
    };
  }, [loading, validationErrors, create]);
};
