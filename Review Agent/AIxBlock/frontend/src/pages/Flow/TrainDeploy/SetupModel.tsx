import TrainDeployLayout from "./TrainDeployLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseSetupModel} from "../Shared/SetupModel";
import React, {useMemo} from "react";
import styles from "./TrainDeploy.module.scss";
import ModelsList from "../Shared/Model/ModelsList";

export default function SetupModel() {
  const {project, models, computes, flowStatus, patchProject} = useFlowProvider();
  const navigate = useNavigate();

  const nextPage = useMemo(() => {
    return project?.data_pipeline === "on"
      ? "/train-and-deploy/" + project?.id + "/data"
      : "/train-and-deploy/" + project?.id + "/training-dashboard";
  }, [project?.data_pipeline, project?.id]);

  const onModelAdded = React.useCallback(() => {
    patchProject({predict_config: null});

    Promise.all([models.refresh(), computes.refresh()])
      .then(() => navigate(nextPage));
  }, [computes, models, navigate, nextPage, patchProject]);

  return (
    <TrainDeployLayout
      onBack={() => navigate("/train-and-deploy/" + project?.id + "/data-preparation/local-upload")}
      onNext={() => navigate(nextPage)}
    >
      {project ? (
        flowStatus.hasAddedModel || flowStatus.hasRentedModel
          ? <div className={styles.modelList}>
            <ModelsList canConfigure={true} />
          </div>
          : <BaseSetupModel
            onAdded={onModelAdded}
            project={project}
            hasNotebook={false}
            disallowedSources={["HUGGING_FACE"/*, "ROBOFLOW"*/]}
          />
      ) : <>Project not found</>}
    </TrainDeployLayout>
  );
}
