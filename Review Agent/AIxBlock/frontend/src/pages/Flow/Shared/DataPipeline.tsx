import { TProjectModel } from "@/models/project";
import {TPageFlowProvider} from "../FlowProvider";
import styles from "./DataPipeline.module.scss";
import Labels from "./DataPipeline/Labels";
import Members from "./DataPipeline/Members";
import MLAssisted from "./DataPipeline/MLAssisted";
import Workflow from "./DataPipeline/Workflow";
import Switch from "@/components/Switch/Switch";
import {useCallback, useState} from "react";

type TDataPipelineProps = {
  project: TProjectModel;
  patchProject: TPageFlowProvider["patchProject"],
  hasMlAssisted?: boolean;
  onMlAssistedChanged?: (v: boolean) => void;
}

export default function DataPipeline({project, patchProject, hasMlAssisted, onMlAssistedChanged}: TDataPipelineProps) {
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

  return (
    <div className={styles.dataPipeline}>
      <h3 className={styles.h3Heading}>Data Pipeline</h3>
      <div className={styles.section}>
        <h4 className={styles.heading}>Label List</h4>
        <Labels project={project} patchProject={patchProject} />
      </div>
      <div className={styles.section}>
        <h4 className={styles.heading}>Labeler</h4>
        <Members project={project} />
      </div>
      <div className={styles.section}>
        <h4 className={styles.heading}>Labeling Workflow</h4>
        <Workflow project={project} patchProject={patchProject} />
      </div>
      <div className={styles.section}>
        <h4 className={styles.heading}>
          ML-assisted Labeling
          <Switch
            checked={hasMlAssisted}
            onChange={changeMLAssistFeature}
            size="medium"
            processing={changingMlAssisted}
          />
        </h4>
        {hasMlAssisted && <MLAssisted project={project} patchProject={patchProject} />}
      </div>
      <div>&nbsp;</div>
    </div>
  )
}
