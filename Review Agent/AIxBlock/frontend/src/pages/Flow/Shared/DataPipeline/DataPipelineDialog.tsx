import styles from "./DataPipelineDialog.module.scss";
import Modal from "@/components/Modal/Modal";
import {TProjectModel} from "@/models/project";
import Switch from "@/components/Switch/Switch";
import {useCallback, useState} from "react";
import {TUseProjectHook} from "@/hooks/project/useProjectHook";
import {IconLabelers, IconLabels, IconMLAssisted, IconWorkflow} from "./icons";
import Labels from "./Labels";
import Members from "./Members";
import Workflow from "./Workflow";
import MLAssisted from "./MLAssisted";
import AutoTrain from "./AutoTrain";

export type TProps = {
  show: boolean;
  project: TProjectModel;
  patchProject: TUseProjectHook["patchProject"];
  onClose?: () => void;
  hasMLAssisted?: boolean;
  hasAutoTrain?: boolean;
}

export type TStepKey = "labels" | "labeler" | "workflow" | "ml-assisted" | "auto-train";

export const STEPS_TITLE: {[k in TStepKey]: string} = {
  "labels": "Label List",
  "labeler": "Labelers",
  "workflow": "Labeling Workflow",
  "ml-assisted": "ML-assisted Labeling",
  "auto-train": "Auto-train",
}

export default function DataPipelineDialog({show, project, patchProject, onClose, hasMLAssisted, hasAutoTrain}: TProps) {
  const [currentStep, setCurrentStep] = useState<TStepKey>("labels");
  const [isTogglingML, setTogglingML] = useState(false);
  const [turningAutoTrain, setTurningAutoTrain] = useState<boolean>(false);

  const changeMLAssistFeature = useCallback((v: boolean) => {
    setTogglingML(true);

    patchProject({
      show_collab_predictions: v,
      start_training_on_annotation_update: false,
      evaluate_predictions_automatically: false,
      export_dataset: false,
    }, false, () => {
      setTogglingML(false);

      if (!v && currentStep === "ml-assisted") {
        setCurrentStep("labels");
      } else if (v && currentStep !== "ml-assisted") {
        setCurrentStep("ml-assisted");
      }
    });
  }, [currentStep, patchProject]);

  const switchAutoTrain = useCallback((v: boolean) => {
    setTurningAutoTrain(true);

    patchProject({
      start_training_on_annotation_update: v,
      auto_train_format: project.auto_train_format ?? "JSON",
    }, false, () => {
      setTurningAutoTrain(false);

      if (!v && currentStep === "auto-train") {
        setCurrentStep("labels");
      } else if (v && currentStep !== "auto-train") {
        setCurrentStep("auto-train");
      }
    });
  }, [currentStep, patchProject, project.auto_train_format]);

  return (
    <Modal
      open={show}
      onClose={onClose}
      className={styles.dialog}
    >
      <div className={styles.split}>
        <div className={styles.left}>
          <div className={styles.leftTitle}>Data Pipeline</div>
          <div className={styles.leftList}>
            <div
              className={[currentStep === "labels" ? styles.leftItemActive : styles.leftItem].join(" ")}
              onClick={() => setCurrentStep("labels")}
            >
              <span className={styles.leftItemLabel}>
                <IconLabels /> Label Name List
              </span>
            </div>
            <div
              className={[currentStep === "labeler" ? styles.leftItemActive : styles.leftItem].join(" ")}
              onClick={() => setCurrentStep("labeler")}
            >
              <span className={styles.leftItemLabel}>
                <IconLabelers /> Labelers
              </span>
            </div>
            <div
              className={[currentStep === "workflow" ? styles.leftItemActive : styles.leftItem].join(" ")}
              onClick={() => setCurrentStep("workflow")}
            >
              <span className={styles.leftItemLabel}>
                <IconWorkflow /> Labeling Workflow
              </span>
            </div>
            <div
              className={[currentStep === "ml-assisted" ? styles.leftItemActive : styles.leftItem].join(" ")
                + " " + (hasMLAssisted ? "" : styles.leftItemDisable)}
              onClick={() => {
                if (hasMLAssisted) {
                  setCurrentStep("ml-assisted");
                }
              }}
            >
              <span className={styles.leftItemLabel}>
                <IconMLAssisted /> ML-assisted Labeling
              </span>
              <Switch
                checked={hasMLAssisted}
                onChange={changeMLAssistFeature}
                size="medium"
                processing={isTogglingML}
              />
            </div>
            {hasAutoTrain && (
              <div
                className={[currentStep === "auto-train" ? styles.leftItemActive : styles.leftItem].join(" ")
                  + " " + (project.start_training_on_annotation_update ? "" : styles.leftItemDisable)}
                onClick={() => {
                  if (project.start_training_on_annotation_update) {
                    setCurrentStep("auto-train");
                  }
                }}
              >
                <span className={styles.leftItemLabel}>
                  <IconMLAssisted /> Auto-train
                </span>
                <Switch
                  checked={project.start_training_on_annotation_update}
                  onChange={switchAutoTrain}
                  size="medium"
                  processing={turningAutoTrain}
                />
              </div>
            )}
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.rightTitle}>
            {STEPS_TITLE[currentStep]}
          </div>
          <div className={styles.rightContent}>
            {currentStep === "labels" && (
              <Labels project={project} patchProject={patchProject} />
            )}
            {currentStep === "labeler" && (
              <Members project={project} />
            )}
            {currentStep === "workflow" && (
              <Workflow project={project} patchProject={patchProject} />
            )}
            {currentStep === "ml-assisted" && (
              <MLAssisted project={project} patchProject={patchProject} />
            )}
            {currentStep === "auto-train" && (
              <AutoTrain project={project} patchProject={patchProject} />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
