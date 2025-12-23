import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/providers/ApiProvider";
import { TUserModel } from "@/models/user";

type TProps = {
  id: string;
};

/**
 * Get user
 *
 * @param {TProps} props
 */
export default function useGetUser({ id }: TProps) {
  const [user, setUser] = useState<TUserModel>();
  const [error, setError] = useState<string>();
  const api = useApi();

  useEffect(() => {
    const ar = api.call("getUser", {
      params: { id },
    });

    ar.promise
      .then(async (r) => {
        if (ar.controller.signal.aborted) {
          return;
        }
        const data = await r.json();
        setUser(data);
      })
      .catch((e) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading user.";

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
      });

    return () => {
      ar.controller.abort();
    };
  }, [api, id]);

  return useMemo(() => {
    return { user, error };
  }, [user, error]);
}
