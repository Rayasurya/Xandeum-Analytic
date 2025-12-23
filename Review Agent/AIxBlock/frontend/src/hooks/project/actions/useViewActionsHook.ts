import {TViewModel} from "@/models/view";
import React from "react";
import {useApi} from "@/providers/ApiProvider";
import {infoDialog} from "@/components/Dialog";

export type TActionResult = {
  processedCount: number,
  reload: boolean,
}

export type TUseViewActionsHook = {
  process: (action: string, included: number[], all: boolean) => {
    controller: AbortController,
    result: Promise<TActionResult>,
  },
}

export default function useViewActionsHook(view: TViewModel): TUseViewActionsHook {
  const {call} = useApi();

  const process = React.useCallback((action: string, included: number[], all: boolean = false) => {
    const controller = new AbortController();

    const result = new Promise<TActionResult>((resolve, reject) => {
      const ar = call("doAction", {
        abortController: controller,
        params: {
          id: action,
          tabID: view.id.toString(),
          project: view.project.toString(),
        },
        body: {
          filters: view.data.filters,
          ordering: view.data.ordering,
          project: view.project,
          selectedItems: all ? {all} : {all, included},
        }
      });

      ar.promise
        .then(r => r.json())
        .then(async r => {
          const processedCount = parseInt(Object.hasOwn(r, "processed_items") ? r["processed_items"] : "0");
          const reload = Object.hasOwn(r, "reload") && !!r["reload"];

          resolve({processedCount, reload});

          if (Object.hasOwn(r, "detail") && typeof r["detail"] === "string" && r["detail"].length > 0) {
            infoDialog({message: r["detail"]});
          }
        })
        .catch(e => {
          reject(e);
        });
    });

    return {
      controller: controller,
      result,
    }
  }, [call, view])

  return React.useMemo(() => {
    return {
      process,
    };
  }, [process]);
}
