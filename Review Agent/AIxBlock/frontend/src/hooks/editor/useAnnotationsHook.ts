import {TTaskModel} from "@/models/task";
import React from "react";
import {ILsfAnnotation} from "@/components/Editor/LSF/types";
import {useApi} from "@/providers/ApiProvider";
import {annotationToApiPayload} from "@/components/Editor/LSF/utils";

export type TUseAnnotationsHook = {
  submitDraft: (annotation: ILsfAnnotation, params: Object) => { controller: AbortController, result: Promise<Object> },
  deleteDraft: (annotationID: number | string) => { controller: AbortController, result: Promise<boolean> },
  submitAnnotation: (annotation: ILsfAnnotation) => { controller: AbortController, result: Promise<Object> },
  updateAnnotation: (annotation: ILsfAnnotation) => { controller: AbortController, result: Promise<Object> },
  deleteAnnotation: (annotationID: number | string) => { controller: AbortController, result: Promise<boolean> },
}

export default function useAnnotationsHook(task: TTaskModel): TUseAnnotationsHook {
  const {call} = useApi();

  const submitDraft = React.useCallback((annotation: ILsfAnnotation, params: Object = {}) => {
    const annotationDoesntExist = !annotation.pk;
    const controller = new AbortController();
    const body = Object.assign(annotationToApiPayload(annotation, false, true), params);
    let endpoint: string, p: { [k: string]: string };

    if (annotation.draftId && annotation.draftId > 0) {
      endpoint = "updateDraft";
      p = {id: annotation.draftId.toString()};
    } else {
      if (annotationDoesntExist) {
        endpoint = "createDraftForTask";
        p = {task: task.id.toString()};
      } else {
        endpoint = "createDraftForAnnotation";
        p = {task: task.id.toString(), annotation: annotation.pk};
      }
    }

    const result = new Promise<Object>((resolve, reject) => {
      const ar = call(endpoint, {params: p, body});

      ar.promise
        .then(async r => {
          const data = await r.json();

          if (!r.ok) {
            reject(data);
            return;
          }

          annotation.setDraftId(data.id);
          resolve(data);
        })
        .catch(e => reject(e));
    });

    return {controller, result};
  }, [call, task.id]);

  const deleteDraft = React.useCallback((draftID: number | string) => {
    const controller = new AbortController();

    const result = new Promise<boolean>((resolve, reject) => {
      const ar = call("deleteDraft", {
        abortController: controller,
        params: {id: draftID.toString()},
      });

      ar.promise
        .then(r => resolve(r.ok))
        .catch(e => reject(e));
    });

    return {
      controller: controller,
      result,
    }
  }, [call]);

  const saveAnnotation = React.useCallback((mode: "submit" | "update", annotation: ILsfAnnotation) => {
    const controller = new AbortController();

    const result = new Promise<Object>((resolve, reject) => {
      const ar = call(mode === "submit" ? "submitAnnotation" : "updateAnnotation", {
        abortController: controller,
        params: mode === "submit"
          ? {
            id: task.id.toString(),
            project: task.project.toString(),
          }
          : {
            id: (annotation.pk ?? 0).toString(),
            task: task.id.toString(),
            project: task.project.toString(),
          },
        body: annotationToApiPayload(annotation),
      });

      ar.promise
        .then(async r => {
          const data = await r.json();

          if (!r.ok) {
            reject(data);
            return;
          }

          if (mode === "submit" && !controller.signal.aborted) {
            annotation.updatePersonalKey(data.id.toString());
          }

          resolve(data);
        })
        .catch(e => reject(e));
    });

    return {
      controller: controller,
      result,
    }
  }, [call, task]);

  const submitAnnotation = React.useCallback((annotation: ILsfAnnotation) => {
    return saveAnnotation("submit", annotation);
  }, [saveAnnotation]);

  const updateAnnotation = React.useCallback((annotation: ILsfAnnotation) => {
    return saveAnnotation("update", annotation);
  }, [saveAnnotation]);

  const deleteAnnotation = React.useCallback((annotationID: number | string) => {
    const controller = new AbortController();

    const result = new Promise<boolean>((resolve, reject) => {
      const ar = call("deleteAnnotation", {
        abortController: controller,
        params: {
          id: annotationID.toString(),
          task: task.id.toString(),
          project: task.project.toString(),
        },
      });

      ar.promise
        .then(r => resolve(r.ok))
        .catch(e => reject(e));
    });

    return {
      controller: controller,
      result,
    }
  }, [call, task]);

  return React.useMemo(() => {
    return {
      submitDraft,
      deleteDraft,
      submitAnnotation,
      updateAnnotation,
      deleteAnnotation,
    };
  }, [
    submitDraft,
    deleteDraft,
    submitAnnotation,
    updateAnnotation,
    deleteAnnotation,
  ]);
}
