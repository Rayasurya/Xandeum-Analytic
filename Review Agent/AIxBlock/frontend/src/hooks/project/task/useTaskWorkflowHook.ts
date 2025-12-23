import React from "react";
import {useApi} from "@/providers/ApiProvider";

export type TUseTaskWorkflowHook = {
  processing: boolean,
  error: string | null,
  submitToReview: (cb?: () => void) => void,
  approve: (cb?: () => void) => void,
  reject: (cb?: () => void) => void,
  qualify: (cb?: () => void) => void,
  unqualify: (cb?: () => void) => void,
}

export default function useTaskWorkflowHook(taskID: number | null): TUseTaskWorkflowHook {
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const {call} = useApi();

  const doWorkflowAction = React.useCallback((action: string, cb?: () => void) => {
    if (!taskID) {
      return;
    }

    setProcessing(true);
    setError(null);

    const ar = call("updateTask", {
      params: {id: taskID.toString()},
      body: {qa_action: action},
    });

    ar.promise
      .then(async r => {
        // @ts-ignore
        if (r.status === 403) {
          const data = await r.json();

          if (Object.hasOwn(data, "message")) {
            // @ts-ignore
            setError(data["message"]);
          }
        } else if (r.ok) {
          cb && cb();
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while processing workflow action for the task.";

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

        setProcessing(false);
      });

    return () => {
      ar.controller.abort();
    }
  }, [call, taskID]);

  const submitToReview = React.useCallback((cb?: () => void) => {
    doWorkflowAction("review", cb);
  }, [doWorkflowAction]);

  const approve = React.useCallback((cb?: () => void) => {
    doWorkflowAction("approve", cb);
  }, [doWorkflowAction]);

  const reject = React.useCallback((cb?: () => void) => {
    doWorkflowAction("reject", cb);
  }, [doWorkflowAction]);

  const qualify = React.useCallback((cb?: () => void) => {
    doWorkflowAction("qualify", cb);
  }, [doWorkflowAction]);

  const unqualify = React.useCallback((cb?: () => void) => {
    doWorkflowAction("unqualify", cb);
  }, [doWorkflowAction]);

  return React.useMemo(() => ({
    processing,
    error,
    submitToReview,
    approve,
    reject,
    qualify,
    unqualify,
  }), [processing, error, submitToReview, approve, reject, qualify, unqualify]);
}
