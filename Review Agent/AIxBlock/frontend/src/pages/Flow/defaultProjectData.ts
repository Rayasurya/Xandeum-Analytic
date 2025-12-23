import { TProjectModel } from "@/models/project";
import { COLOR_LIST } from "../Project/Settings/LayoutSettings/constants";

export const CUSTOM_FLOW_PROJECT_DATA = {
  "label-and-validate-data": {
    data_pipeline: "on",
    show_collab_predictions: false,
    evaluate_predictions_automatically: false,
    export_dataset: false,
  },
  "deploy": {},
  "fine-tune-and-deploy": {},
  "train-and-deploy": {},
}

type TDefaultProjectDataArgs = {
  flow: TProjectModel["flow_type"],
  title?: string,
  color?: string,
  config?: string,
  configTitle?: string,
  annotationTemplateId?: number,
}

export function getDefaultProjectData(args: TDefaultProjectDataArgs): Partial<TProjectModel> {
  return {
    title: args.title ?? "",
    color: args.color ?? COLOR_LIST[0].color ?? "#888888",
    label_config: args.config ?? "",
    label_config_title: args.configTitle ?? "",
    annotation_template: args.annotationTemplateId ?? 0,
    template_id: args.annotationTemplateId ?? 0,
    type: { label: "Select type", value: "" },
    epochs: 1,
    batch_size: 1,
    image_width: 64,
    image_height: 64,
    flow_type: args.flow,
    ...(args.flow ? (CUSTOM_FLOW_PROJECT_DATA?.[args.flow] ?? {}) : {}),
  };
}
