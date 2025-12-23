import { useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import {
  TTimeWorking,
  validateTimeWorkingModel,
} from "@/models/timeWorking";
import useDebouncedEffect from "../useDebouncedEffect";

type Props = {
  compute_id?: string;
};

export const useGetTimeWorking = ({ compute_id }: Props) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"create" | "edit">("create");
  const [timeWorking, setTimeWorking] = useState<TTimeWorking | null>(null);

  useDebouncedEffect(() => {
    if (!compute_id || isNaN(parseInt(compute_id))) {
      return;
    }
    setLoading(true);

    const ar: TApiCallResult = api.call("getComputeTimeWorking", {
      params: { id: compute_id },
    });

    ar.promise
      .then(async (r) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        if (data.status_code === 404) {
          setError(null);
          setType("create");
        } else {
          setType("edit");
          const vr = validateTimeWorkingModel(data);

          if (vr.isValid) {
            setTimeWorking(vr.data);
            setError(null);
          } else {
            // setError(
            //   "Invalid time working from the server. Detail: " +
            //     (vr.errors ?? "")
            // );

            if (window.APP_SETTINGS.debug) {
              console.error(vr);
            }
          }
        }
      })
      .catch((e) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading time working";

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
        setLoading(false);
      });
  }, [compute_id, api]);

  return useMemo(() => {
    return { loading, error, timeWorking, type };
  }, [loading, error, timeWorking, type]);
};
