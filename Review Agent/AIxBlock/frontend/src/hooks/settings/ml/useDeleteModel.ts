import React, {useMemo, useState} from "react";
import {confirmDialog} from "@/components/Dialog";
import {toastError, toastSuccess} from "@/utils/toast";
import {useApi} from "@/providers/ApiProvider";
import {useUpdateStartStopDockerML} from "./useStartStopDockerML";

export default function useDeleteModel() {
  const [status, setStatus] = useState<string | null>(null);
  const {call} = useApi();
  const {onUpdateStartStop} = useUpdateStartStopDockerML();

  const deleteModel = React.useCallback((id: number, mlID?: number, onCompleted?: () => Promise<void>) => {
    confirmDialog({
      title: "Delete model #" + id,
      message: "Are you sure you want to delete this model?",
      submitText: "Yes, I'm sure",
      onSubmit: async () => {
        new Promise(async () => {
          if (mlID && mlID > 0) {
            try {
              setStatus("Stopping ML backend container...");
              await onUpdateStartStop("Delete", mlID.toString()).promise;
              setStatus("Deleting ML backend...");
              await call("delMLBackend", {params: {id: mlID.toString()}}).promise;
            } catch {
            }

            setStatus(null);
          }

          const ar = call("deleteHistoryBuildandDeployModel", {params: {id: id.toString()}});
          const res = await ar.promise;

          if (res.ok) {
            toastSuccess("Model has been deleted successfully.");
            await onCompleted?.();
            return;
          }

          try {
            const data = await res.json();

            if ("detail" in data) {
              toastError("An error occurred while deleting model. Error: " + data["detail"]);
              return;
            }
          } catch {
          }

          toastError("An error has been occurred while delete model. Error: " + res.status + " " + res.statusText);
        });

        return true;
      },
    })
  }, [call, onUpdateStartStop]);

  return useMemo(() => ({
    deleteModel,
    status,
  }), [deleteModel, status]);
}
