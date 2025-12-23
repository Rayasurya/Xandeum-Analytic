import {TProjectModel} from "../models/project";
import {TUserModel} from "../models/user";
import {TTaskModel} from "../models/task";

export type TCheckResult = {
  canEdit: boolean;
  canView: boolean;
  error: string | null;
}

export default function canHandleTask(user: TUserModel, project: TProjectModel, task: TTaskModel, isQA?: boolean, isQC?: boolean): TCheckResult {
  const result: TCheckResult = {
    canEdit: true,
    canView: true,
    error: null,
  }

  const currentIsQC = isQC ?? user.is_qc;
  const currentIsQA = isQA ?? user.is_qa;

  if (task.assigned_to.length > 0 && !task.assigned_to.includes(user.id)) {
    result.canEdit = false;
    result.canView = false;
    result.error = "The task #" + task.id + " has been assigned to another user";
    return result;
  }

  if (user.is_superuser || user.is_organization_admin) {
    return result;
  }

  // QA/QC flow turned on
  if (project.need_to_qa) {
    // Check for QA role
    // if (user.is_qa) {
    if (currentIsQA) {
      if (
        task.reviewed_by.length > 0
        && !task.reviewed_by.map(u => u.user_id).includes(user.id)
      ) {
        result.canView = false;
      }

      if (!task.is_in_review || !result.canView) {
        result.canEdit = false;
        result.error = "The task #" + task.id + " is handling by another user";
      }
      // End check for QA
    }
    // Check for QC role
    // else if (user.is_qc) {
    else if (currentIsQC) {
      if (project.need_to_qc) {
        if (
          task.qualified_by.length > 0
          && !task.qualified_by.map(u => u.user_id).includes(user.id)
        ) {
          result.canView = false;
        }

        if (!task.is_in_qc || !result.canView) {
          result.canEdit = false;
          result.error = "The task #" + task.id + " is handling by another user";
        }
      }
      // End check for QC
    }
    // Check for Annotator role
    else {
      if (
        task.is_in_review
        || task.is_in_qc
        || (task.reviewed_result === "rejected" && !task.annotators.includes(user.id) && task.annotators.length > 0)
      ) {
        result.canEdit = false;
        result.error = "The task #" + task.id + " is handling by another user";
      }

      // Not in working pool
      if (task.is_in_review || task.is_in_qc) {
        // The task is not completed by current user
        if (!task.annotators.includes(user.id)) {
          result.canView = false;
        }
      }
      // In working pool
      else {
        if (task.reviewed_result === "rejected" && !task.annotators.includes(user.id) && task.annotators.length > 0) {
          result.canView = false;
        }
      }
    } // End check for Annotator
  }

  return result;
}
