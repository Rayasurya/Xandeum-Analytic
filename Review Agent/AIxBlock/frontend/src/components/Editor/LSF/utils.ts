import { IApiAnnotation, IApiPrediction, IApiTask, ILsfAnnotation, ILsfTaskData } from "./types";

/**
 * Converts the task from the server format to the
 * format supported by the LS frontend
 * @param {import("../stores/Tasks").TaskModel} task
 * @private
 */
export const taskToLSFormat = (task: IApiTask): ILsfTaskData | void => {
  if (!task) return;

  const result: ILsfTaskData = {
    ...task,
    annotations: [],
    predictions: [],
    createdAt: task.created_at,
    // isLabeled: task.is_labeled, // @todo why?
  };

  if (task.annotations) {
    result.annotations = task.annotations.map(annotationToLSF);
  }

  if (task.predictions) {
    result.predictions = task.predictions.map(predictionToLSF);
  }

  return result;
};

export const annotationToLSF = (annotation: IApiAnnotation) => {
  return {
    ...annotation,
    id: undefined,
    pk: String(annotation.id),
    createdAgo: annotation.created_ago,
    createdBy: annotation.created_username,
    createdDate: annotation.created_at,
    leadTime: annotation.lead_time ?? 0,
    skipped: annotation.was_cancelled ?? false,
  };
};

export const predictionToLSF = (prediction: IApiPrediction) => {
  return {
    ...prediction,
    id: undefined,
    pk: String(prediction.id),
    createdAgo: prediction.created_ago,
    createdBy: prediction.model_version?.trim() ?? "",
    createdDate: prediction.created_at,
  };
};

export const annotationToServer = (annotation: ILsfAnnotation): IApiAnnotation => {
  return {
    ...annotation,
    id: Number(annotation.pk),
    created_ago: annotation.createdAgo,
    created_username: annotation.createdBy,
    created_at: new Date().toISOString(),
    lead_time: annotation.leadTime,
  };
};

export const getAnnotationSnapshot = (c: ILsfAnnotation) => ({
  id: c.id,
  pk: c.pk,
  result: c.serializeAnnotation(),
  leadTime: c.leadTime,
  userGenerate: !!c.userGenerate,
  sentUserGenerate: !!c.sentUserGenerate,
});

export const annotationToApiPayload = (annotation: ILsfAnnotation, includeId: boolean = false, isDraft: boolean = false) => {
  const userGenerate =
    !annotation.userGenerate || annotation.sentUserGenerate;

  let result = {
    // task execution time, always summed up with previous values
    lead_time: ((new Date()).getTime() - annotation.loadedDate.getTime()) / 1000 + Number(annotation.leadTime ?? 0),
    // don't serialize annotations twice for drafts
    result: isDraft ? (annotation.versions?.draft ?? []) : annotation.serializeAnnotation(),
    draft_id: annotation.draftId,
    parent_prediction: annotation.parent_prediction,
    parent_annotation: annotation.parent_annotation,
  };

  if (includeId && userGenerate) {
    result = Object.assign(result, {id: parseInt(annotation.pk)})
  }

  return result;
}

