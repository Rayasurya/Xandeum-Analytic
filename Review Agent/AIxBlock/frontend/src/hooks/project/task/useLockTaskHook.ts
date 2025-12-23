import React from "react";
import {TApiCallResult, useApi} from "@/providers/ApiProvider";
import {useMqtt} from "@/providers/MqttProvider";
import {useAuth} from "@/providers/AuthProvider";
import useDebouncedEffect from "../../useDebouncedEffect";

export type TUseLockTaskHook = {
  initialized: boolean,
  locking: boolean,
  lockingError: string | null,
  lockingTaskID: number | null,
}

export default function useLockTaskHook(id: number | null) {
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [locking, setLocking] = React.useState<boolean>(false);
  const [lockingError, setLockingError] = React.useState<null | string>(null);
  const [lockingTaskID, setLockingTaskID] = React.useState<number | null>(null);
  const api = useApi();
  const {publish} = useMqtt();
  const {user} = useAuth();

  const releaseTask = React.useCallback((id: number): TApiCallResult => {
    setLockingTaskID(null);

    return api.call("releaseTask", {
      params: {
        id: id.toString(),
      },
    });
  }, [api]);

  const lockTask = React.useCallback((id: number, silent?: boolean): TApiCallResult => {
    const ar = api.call("lockTask", {
      params: {id: id.toString()}
    });

    if (!silent) {
      setLocking(true);
    }

    ar.promise
      .then(async r => {
        if (r.ok) {
          setLockingTaskID(id);
        } else {
          const res = await r.clone().json();

          if (Object.hasOwn(res, "message")) {
            throw Error(res.message);
          } else {
            throw Error("Can not lock the task.");
          }
        }
      })
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while locking the task.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setLockingTaskID(null);
        setLockingError(msg);

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }

        setLocking(false);
        setInitialized(true);
      });

    return ar;
  }, [api]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const keepLockTask = React.useCallback((id: number) => {
    publish("keepTaskLock", JSON.stringify({
      id: id,
      command: "lock",
      user_id: user?.id,
    }));
  }, [publish, user?.id]);

  useDebouncedEffect(() => {
    if (id === lockingTaskID) {
      return;
    }

    if (lockingTaskID) {
      releaseTask(lockingTaskID);
    }

    if (!id) {
      setLockingTaskID(null);
      return;
    }

    const ar = lockTask(id);

    return () => {
      ar.controller.abort();
    };
  }, [api, releaseTask, lockTask, lockingTaskID, id]);

  useDebouncedEffect(() => {
    if (!lockingTaskID) {
      return;
    }

    const keepLockInterval = setInterval(() => {
      lockTask(lockingTaskID, true);
    }, 90000);

    return () => {
      clearInterval(keepLockInterval);
    }
  }, [lockTask, lockingTaskID]);

  return React.useMemo(() => ({
    initialized,
    locking,
    lockingError,
    lockingTaskID,
  }), [
    initialized,
    locking,
    lockingError,
    lockingTaskID,
  ]);
}
