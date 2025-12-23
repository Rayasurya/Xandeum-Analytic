import {TProjectModel} from "@/models/project";
import {TUseProjectHook} from "@/hooks/project/useProjectHook";
import Switch from "@/components/Switch/Switch";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./MLAssisted.module.scss";
import InputBase from "@/components/InputBase/InputBase";
import Slider from "rc-slider";
import usePredictConfigHook, { TPredictParamsKey, TPredictParamsValue } from "../../usePredictConfigHook";
import { getPredictTask } from "@/utils/models";
// import EmptyContent from "@/components/EmptyContent/EmptyContent";

type TProps = {
  project: TProjectModel;
  patchProject: TUseProjectHook["patchProject"];
};

export default function MLAssisted({project, patchProject}: TProps) {
  const [saving, setSaving] = useState<string[]>([]);
  const paramsTimeout = useRef<NodeJS.Timeout>();

  const {
    predictConfigRef,
    predictConfig: params,
    setPredictConfig: setParams,
    // checkingPredictConfig,
    // loadError,
    // getPredictConfig,
  } = usePredictConfigHook({
    projectPredictConfig: project.predict_config,
    hasMlAssisted: true,
    predictTask: getPredictTask(project.label_config_title),
    projectId: project.id,
  });

  const updateParam = useCallback((k: TPredictParamsKey, v: TPredictParamsValue) => {
    setParams(p => {
      console.log(p, k, v);

      if (p) {
        return { ...p, [k]: v };
      }

      return p;
    });
  }, [setParams]);

  const save = useCallback((d: Partial<TProjectModel>) => {
    const keys = Object.keys(d);
    setSaving(l => [...l, ...keys]);

    patchProject(d, false, () => {
      setSaving(l => l.filter(k => !keys.includes(k)));

      // if (keys.includes("predict_config")) {
      //   toastSuccess("AI Predict config has been saved successfully.", {toastId: "predict-config-saved"});
      // }
    });
  }, [patchProject]);

  useEffect(() => {
    clearTimeout(paramsTimeout.current);

    paramsTimeout.current = setTimeout(() => {
      save({predict_config: params});
    }, 1000);

    return () => {
      clearTimeout(paramsTimeout.current);
    }
  }, [params, predictConfigRef, save]);

  const lowerLabelConfig = React.useMemo(
    () => project.label_config.toLowerCase(),
    [project.label_config]
  );

  const isVideo = useMemo(() => {
    return [
      "Video Object Tracking",
    ].includes(project.label_config_title);
  }, [project.label_config_title]);

  const isCV = useMemo(() => {
    if ("video" in project.data_types || Object.values(project.data_types).includes("Video")) {
      return false;
    }

    if (lowerLabelConfig.indexOf("<brushlabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<rectanglelabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<polygonlabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<keypointlabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<skeletonlabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<cuboidlabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<polylinelabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<eliplabels") > -1) {
      return true;
    }
  }, [lowerLabelConfig, project.data_types]);

  const isLLM = useMemo(() => {
    return !isVideo && !isCV;
  }, [isCV, isVideo]);

  return (
    <div className={styles.mlAssisted}>
      <Switch
        size="medium"
        processing={saving.includes("show_collab_predictions")}
        checked={project.show_collab_predictions}
        label="Show predictions to annotators in the editors"
        onChange={(v) => save({show_collab_predictions: v})}
      />
      {/*{project.flow_type !== "label-and-validate-data" && (
        <Switch
          size="medium"
          processing={saving.includes("start_training_on_annotation_update")}
          checked={project.start_training_on_annotation_update}
          label="Start model training after any annotations are submitted or updated"
          onChange={(v) => save({start_training_on_annotation_update: v})}
        />
      )}*/}
      <Switch
        size="medium"
        processing={saving.includes("evaluate_predictions_automatically")}
        checked={project.evaluate_predictions_automatically}
        label="Retrieve predictions when loading a task automatically"
        onChange={(v) => save({evaluate_predictions_automatically: v})}
      />
      <Switch
        size="medium"
        processing={saving.includes("export_dataset")}
        checked={project.export_dataset}
        label="Automatically generate a new dataset version following human quality control checks."
        onChange={(v) => save({export_dataset: v})}
      />
      {/*{checkingPredictConfig && (
        <EmptyContent message="Checking ML backend..." />
      )}
      {!checkingPredictConfig && loadError && (
        <EmptyContent message={loadError} buttons={[
          {children: "Retry", type: "hot", onClick: () => getPredictConfig()},
        ]} />
      )}*/}
      {!!params && (
        <>
          {isLLM && (
            <>
              <div className={ styles.item }>
                <label>Token length:</label>
                <InputBase
                  type="number"
                  value={ params.tokenLength.toString() }
                  isControlledValue={ true }
                  allowClear={ false }
                  onChange={ e => updateParam("tokenLength", Number(e.target.value)) }
                />
              </div>
              <div className={ styles.item }>
                <label>Max gen. length:</label>
                <InputBase
                  type="number"
                  value={ params.maxGenLength.toString() }
                  isControlledValue={ true }
                  allowClear={ false }
                  onChange={ e => updateParam("maxGenLength", Number(e.target.value)) }
                />
              </div>
              <div className={ styles.item }>
                <label>Seed:</label>
                <InputBase
                  type="number"
                  value={ params.seed.toString() }
                  isControlledValue={ true }
                  allowClear={ false }
                  onChange={ e => updateParam("seed", Number(e.target.value)) }
                />
              </div>
            </>
          )}
          { isVideo && (
            <>
              <div className={ styles.item }>
                <label>Frame:</label>
                <InputBase
                  type="number"
                  value={ params.frame.toString() }
                  isControlledValue={ true }
                  allowClear={ false }
                  onChange={ e => updateParam("frame", Number(e.target.value)) }
                />
              </div>
              <div className={ styles.item }>
                <Switch
                  label="Full video"
                  checked={ params.fullVideo }
                  size="medium"
                  onChange={ v => updateParam("fullVideo", v) }
                />
              </div>
            </>
          ) }
          {isCV && (
            <>
              <div className={ styles.item }>
                <label>Confidence Threshold: { params.confidenceThreshold }</label>
                <Slider
                  className={ styles.slider }
                  min={ 0 }
                  max={ 1 }
                  step={ 0.01 }
                  defaultValue={ params.confidenceThreshold ?? 0.8 }
                  onChange={ (v: any) => updateParam("confidenceThreshold", Number(v)) }
                />
              </div>
              <div className={ styles.item }>
                <label>IOU Threshold: { params.iouThreshold }</label>
                <Slider
                  className={ styles.slider }
                  min={ 0 }
                  max={ 1 }
                  step={ 0.01 }
                  defaultValue={ params.iouThreshold ?? 0.8 }
                  onChange={ (v: any) => updateParam("iouThreshold", Number(v)) }
                />
              </div>
            </>
          ) }
          { isLLM && (
            <>
              <div className={ styles.item }>
                <label>Temperature: { params.temperature }</label>
                <Slider
                  className={ styles.slider }
                  min={ 0 }
                  max={ 1 }
                  step={ 0.01 }
                  defaultValue={ params.temperature ?? 0.9 }
                  onChange={ (v: any) => updateParam("temperature", Number(v)) }
                />
              </div>
              <div className={ styles.item }>
                <label>Top P: { params.topP }</label>
                <Slider
                  className={ styles.slider }
                  min={ 0 }
                  max={ 1 }
                  step={ 0.01 }
                  defaultValue={ params.topP ?? 0.5 }
                  onChange={ (v: any) => updateParam("topP", Number(v)) }
                />
              </div>
              <div className={ styles.item }>
                <label>Prompt:</label>
                <InputBase
                  type="number"
                  value={ params.prompt.toString() }
                  isControlledValue={ true }
                  allowClear={ false }
                  onChange={ e => updateParam("prompt", e.target.value) }
                  isMultipleLine={true}
                />
              </div>
            </>
          ) }
        </>
      )}
    </div>
  );
}
