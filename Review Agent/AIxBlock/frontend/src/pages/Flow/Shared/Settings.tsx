import React, {Fragment, useCallback, useMemo, useRef, useState} from "react";
import { IconFolderUpload, IconNotice, IconSetting } from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import Switch from "@/components/Switch/Switch";
import { TProjectModel } from "@/models/project";
import CloudStorage from "./CloudStorage";
import RentedList from "./CPU/RentedList";
import styles from "./Settings.module.scss";
import {TPageFlowProvider} from "../FlowProvider";
import { Tooltip } from "react-tooltip";
import { createPortal } from "react-dom";
import { toastError, toastSuccess } from "@/utils/toast";
import ModelsList from "./Model/ModelsList";
import Labels from "./DataPipeline/Labels";
import {hasLabelsRoot} from "@/utils/labelConfig";
import Members from "./DataPipeline/Members";
import Workflow from "./DataPipeline/Workflow";
import MLAssisted from "./DataPipeline/MLAssisted";
import {useGetListMarketplaceGpus} from "@/hooks/settings/ml/useGetListMarketplaceGpus";
import AutoTrain from "./DataPipeline/AutoTrain";
import Languages from "./Languages";
import Select from "@/components/Select/Select";
import { parsePiiEntities } from "../parsePiiEntities";
import PiiEntitiesManager from "./DataPipeline/PiiEntitiesManager";

type TSettingsProps = {
  project: TProjectModel | null;
  onClickImport?: () => void;
  showDataPipelineSwitcher?: boolean;
  forceDataPipeline?: boolean;
  noComputes?: boolean;
  noSource?: boolean;
  noModels?: boolean;
  // onAddMoreModel?: () => void;
  onAddComputeClick?: () => void;
  hasMlAssisted?: boolean;
  onMlAssistedChanged?: (v: boolean) => void;
  hasAutoTrain?: boolean;
  canAddStorage?: boolean;
  canSyncStorage?: boolean;
  noStorages?: boolean;
  noLanguages?: boolean;
  configCheckpointStorage?: boolean;
} & Pick<TPageFlowProvider, "computes" | "flowDiagram" | "switchDataPipeline" | "patchProject">

export default function Settings({
  project,
  onClickImport,
  showDataPipelineSwitcher,
  computes,
  switchDataPipeline,
  patchProject,
  forceDataPipeline,
  noComputes,
  noModels,
  onAddComputeClick,
  hasMlAssisted,
  onMlAssistedChanged,
  hasAutoTrain,
  canAddStorage,
  canSyncStorage,
  noStorages,
  noLanguages,
  configCheckpointStorage,
}: TSettingsProps) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [pjTitle, setPjTitle] = useState<string>(project?.title ?? "");
  const { rented: rentedComputes} = computes;
  const dataPipelineSectionRef = useRef<HTMLDivElement>(null);
  const usingGpus = useGetListMarketplaceGpus(project?.id.toString(), "1", "model-training");
  const [turningAutoTrain, setTurningAutoTrain] = useState<boolean>(false);
  const [checkpointStorage, setCheckpointStorage] = useState<TProjectModel["checkpoint_storage"]>(project?.checkpoint_storage);
  const [checkpointStorageHf, setCheckpointStorageHf] = useState<TProjectModel["checkpoint_storage_huggingface"]>(project?.checkpoint_storage_huggingface);
  const piiEntities = useMemo(() => parsePiiEntities(project?.label_config ?? "<View></View>"), [project?.label_config]);

  const usingComputes: TPageFlowProvider["computes"]["list"] = useMemo(() => {
    const gpuIds: number[] = [];

    usingGpus.gpusListModel.forEach(g => {
      g.compute_gpus.forEach(g => gpuIds.push(g.id));
    });

    return rentedComputes.filter(c => {
        return c.compute_install === "completed" && gpuIds.includes(c.compute_gpu.id);
      });
  }, [rentedComputes, usingGpus.gpusListModel]);

  const handleUpdateProject = useCallback(() => {
    if (checkpointStorage === "huggingface" && (checkpointStorageHf ?? "").trim().length === 0) {
      toastError("Please enter your Hugging Face token to store your checkpoint.");
      return;
    }

    setIsUpdating(true);

    patchProject({
      title: pjTitle,
      checkpoint_storage: checkpointStorage,
      checkpoint_storage_huggingface: checkpointStorageHf,
    }, false, () => {
      toastSuccess("Updated successfully.");
      setIsUpdating(false);
    });
  }, [checkpointStorage, checkpointStorageHf, patchProject, pjTitle]);

  const [changingMlAssisted, setChangingMlAssisted] = useState(false);

  const changeMLAssistFeature = useCallback((v: boolean) => {
    setChangingMlAssisted(true);

    patchProject({
      show_collab_predictions: v,
      start_training_on_annotation_update: false,
      evaluate_predictions_automatically: false,
      export_dataset: false,
    }, false, () => {
      setChangingMlAssisted(false);
      onMlAssistedChanged?.(v);
    });
  }, [onMlAssistedChanged, patchProject]);

  const hasDataPipeline = useMemo(() => {
    return forceDataPipeline || project?.data_pipeline === "on";
  }, [forceDataPipeline, project?.data_pipeline]);

  const onSwitchDataPipeline = useCallback(() => {
    if (forceDataPipeline) {
      return;
    }

    const nextVal = !hasDataPipeline;

    switchDataPipeline(nextVal, () => {
      if (!nextVal) return;

      setTimeout(() => {
        dataPipelineSectionRef.current?.scrollIntoView({behavior: "smooth"});
      }, 500);
    });
  }, [forceDataPipeline, hasDataPipeline, switchDataPipeline]);

  const hasLabels = useMemo(() => project && hasLabelsRoot(project.label_config), [project]);

  const switchAutoTrain = useCallback((v: boolean) => {
    setTurningAutoTrain(true);

    patchProject({
      start_training_on_annotation_update: v,
      auto_train_format: project?.auto_train_format ?? "JSON",
    }, false, () => {
      setTurningAutoTrain(false);
    });
  }, [patchProject, project?.auto_train_format]);

  return (
    <div className={styles.settings}>
      <div className={styles.toolbar}>
        <h4 className={styles.heading}>
          General Settings
        </h4>
        <div className={styles.action}>
          {onClickImport && (
            <Button
              type="secondary"
              size="small"
              className={styles.btnImport}
              icon={<IconFolderUpload />}
              onClick={onClickImport}
            >
              Import More Data
            </Button>
          )}
          {showDataPipelineSwitcher && !forceDataPipeline && (
            <div className={styles.pipeline}>
              <div className={project?.data_pipeline === "on" ? styles.btnContentActive : styles.btnContent}>
                <Button
                  type="secondary"
                  size="small"
                  className={project?.data_pipeline === "on" ? styles.btnPipelineActive : styles.btnPipeline}
                  icon={<IconSetting width={18} height={18} />}
                  onClick={onSwitchDataPipeline}
                >
                  Data Pipeline
                </Button>
                <Switch
                  checked={project?.data_pipeline === "on"}
                  onChange={onSwitchDataPipeline}
                />
              </div>
              <Fragment>
                <span
                  data-tooltip-id={"data-pipe-line"}
                  data-tooltip-place="top-end"
                  data-tooltip-position-strategy="fixed"
                  data-tooltip-content="Turn on this button to access the labeling platform settings for annotation, if needed."
                  className={styles.flex}
                >
                  <IconNotice />
                </span>
              </Fragment>
            </div>
          )}
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionHeading}>
          <h5 className={styles.sectionTitle}>Project</h5>
          <Button
            className={styles.sectionAction}
            onClick={() => handleUpdateProject()}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving" : "Save"}
          </Button>
        </div>
        <div className={styles.project}>
          <InputBase
            key={`key-input-${project?.title}`}
            className={styles.field}
            label="Project name"
            placeholder="Type something"
            allowClear={false}
            value={pjTitle ?? ""}
            onChange={(e) => setPjTitle(e.target.value)}
            disabled={isUpdating}
          />
          {project && !noLanguages && (
            <Languages
              projectId={project.id}
              labelConfig={project.label_config}
              patchProject={patchProject}
            />
          )}
        </div>
        {configCheckpointStorage && (
          <>
            <div className={styles.checkpointConfig}>
              <Select
                label="Checkpoint Storage"
                data={[{
                  options: [
                    {label: "Cloud Storage", value: "cloud"},
                    {label: "Hugging Face", value: "huggingface"},
                  ],
                }]}
                defaultValue={
                  checkpointStorage
                    ? {label: {"cloud": "Cloud Storage", "huggingface": "Hugging Face"}[checkpointStorage], value: checkpointStorage}
                    : {label: "Select checkpoint storage", value: ""}
                }
                onChange={o => setCheckpointStorage(o.value as TProjectModel["checkpoint_storage"])}
              />
              <InputBase
                key={`key-input-${project?.checkpoint_storage_huggingface}`}
                className={styles.field}
                label="Hugging Face Token"
                placeholder="Hugging Face Token"
                allowClear={false}
                value={checkpointStorageHf ?? ""}
                onChange={(e) => setCheckpointStorageHf(e.target.value)}
                disabled={isUpdating || checkpointStorage !== "huggingface"}
              />
            </div>
            <div className={styles.checkpointConfigExplain}>
              This configuration specifies the storage location for your trained model checkpoints.
              You can choose to save your checkpoints to cloud storage or upload them directly to Hugging Face.
            </div>
          </>
        )}
      </div>
      {!noStorages && (
        <div className={styles.section}>
          <div className={styles.sectionHeading}>
            <h5 className={styles.sectionTitle}>Infrastructure</h5>
          </div>
          <div className={styles.sectionChild}>
            <h6 className={`${styles.absolute} ${styles.subHeadingTitle}`}>Project’s Storage</h6>
            <CloudStorage
              project={project}
              defaultColumnsCout="column2"
              canAdd={canAddStorage}
              placementAction="flex-end"
              canSync={canSyncStorage}
            />
          </div>
        </div>
      )}
      {!noComputes && (
        <div className={styles.section}>
          <div className={styles.sectionHeading}>
            <h5 className={styles.sectionTitle}>Computes</h5>
          </div>
          <div className={styles.sectionChild}>
            <div className={styles.subHeading}>
              <h6 className={styles.subHeadingTitle}>Project’s Compute for Model Training/Deploying</h6>
              {onAddComputeClick && (
                <Button
                  className={styles.subHeadingAction}
                  onClick={onAddComputeClick}
                >
                  Add more computes
                </Button>
              )}
            </div>
            <RentedList rentedGpus={usingComputes} onDeleteCompute={computes.delete} project_id={project?.id ?? undefined} />
          </div>
        </div>
      )}
      {/* @TODO: Logic for editing model */}
      {/* !noSource && (
          <div className={styles.section}>
          <div className={styles.sectionHeading}>
            <h5 className={styles.sectionTitle}>Source Code</h5>
          </div>
          <div className={styles.sourceCode}>
            <div className={styles.fieldItem}>
              <label className={styles.label}>Title</label>
              <InputBase
                readonly
                className={styles.field}
                placeholder="Type something"
                allowClear={false}
                value={""}
              />
            </div>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldItem}>
                <label className={styles.label}>Source code</label>
                <InputBase
                  readonly
                  className={styles.field}
                  allowClear={false}
                  value={""}
                />
              </div>
              <div className={styles.fieldItems}>
                <div className={styles.fieldItem}>
                  <label className={styles.label}>Url</label>
                  <InputBase
                    readonly
                    className={styles.field}
                    allowClear={false}
                    value={""}
                  />
                </div>
                <div className={styles.fieldItem}>
                  <label className={styles.label}>Token</label>
                  <InputBase
                    readonly
                    className={styles.field}
                    allowClear={false}
                    value={""}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) */}
      {!noModels && (
        <div className={styles.section}>
          <div className={styles.sectionHeading}>
            <h5 className={styles.sectionTitle}>Models</h5>
          </div>
          <ModelsList />
          {/*{onAddMoreModel && <Button type="secondary" onClick={onAddMoreModel}>Add more models</Button>}*/}
        </div>
      )}
      {hasDataPipeline && project && (
        <>
          <div ref={dataPipelineSectionRef}/>
          {hasLabels && (
            <div className={styles.section}>
              <div className={styles.sectionHeading}>
                <h5 className={styles.sectionTitle}>Label List</h5>
              </div>
              <Labels project={project} patchProject={patchProject}/>
            </div>
          )}
          {piiEntities.redactors.length > 0 && (
            <div className={ styles.section }>
              <div className={ styles.sectionHeading }>
                <h5 className={ styles.sectionTitle }>PII Entities</h5>
              </div>
              <PiiEntitiesManager project={project} patchProject={patchProject} piiEntities={piiEntities} />
            </div>
          ) }
          <div className={ styles.section }>
            <div className={ styles.sectionHeading }>
              <h5 className={ styles.sectionTitle }>Labeler</h5>
            </div>
            <Members project={ project }/>
          </div>
          <div className={ styles.section}>
            <div className={styles.sectionHeading}>
              <h5 className={styles.sectionTitle}>Labeling Workflow</h5>
            </div>
            <Workflow project={project} patchProject={patchProject}/>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionHeading}>
              <h5 className={styles.sectionTitle}>ML-assisted Labeling</h5>
              <Switch
                checked={hasMlAssisted}
                onChange={changeMLAssistFeature}
                size="medium"
                processing={changingMlAssisted}
              />
            </div>
            {hasMlAssisted && <MLAssisted project={project} patchProject={patchProject}/>}
          </div>
          {hasAutoTrain && (
            <div className={styles.section}>
              <div className={styles.sectionHeading}>
                <h5 className={styles.sectionTitle}>Auto-train</h5>
                <Switch
                  checked={project.start_training_on_annotation_update}
                  onChange={switchAutoTrain}
                  size="medium"
                  processing={turningAutoTrain}
                />
              </div>
              {project.start_training_on_annotation_update && (
                <AutoTrain project={project} patchProject={patchProject} />
              )}
            </div>
          )}
        </>
      )}
      <div>&nbsp;</div>
      {createPortal(
        <Tooltip
          key={"data-pipe-line"}
          id={"data-pipe-line"}
          className={styles.tooltip}
        />,
        document.body
      )}
    </div>
  )
}
