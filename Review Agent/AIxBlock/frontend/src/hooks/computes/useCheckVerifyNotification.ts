import { useMemo } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useCentrifuge } from "@/providers/CentrifugoProvider";
import useDebouncedEffect from "../useDebouncedEffect";

export const useCheckVerifyNotification = () => {
  const api = useApi();
  const { user } = useAuth();
  const { publish } = useCentrifuge();

  useDebouncedEffect(() => {
    const ar: TApiCallResult = api.call("checkComputeSelfHostWaitVerify");

    ar.promise
      .then(async (r) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();

        // Check the local storage before pushing the message
        const canPushMessage =
          localStorage.getItem("canPushMessage") === "true";
        if (canPushMessage && data.id) {
          const msgNotification = {
            type: "Warning",
            message:
              "You have a compute that is still waiting for verification",
          };
          publish("user-notification/" + user?.uuid, msgNotification, false);
          localStorage.setItem("canPushMessage", "false");
        }
      })
      .catch((e) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }
      });
  }, [api, publish, user?.uuid]);

  return useMemo(() => {
    return {};
  }, []);
};
