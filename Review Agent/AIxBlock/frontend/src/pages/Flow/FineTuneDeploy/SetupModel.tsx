import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseSetupModel} from "../Shared/SetupModel";
import React, {useMemo} from "react";
import ModelsList from "../Shared/Model/ModelsList";
import styles from "./FineTuneAndDeploy.module.scss";

export default function SetupModel() {
  const {project, models, computes, flowStatus, patchProject} = useFlowProvider();
  const navigate = useNavigate();

  const nextPage = useMemo(() => {
    return project?.data_pipeline === "on"
      ? "/fine-tune-and-deploy/" + project?.id + "/data"
      : "/fine-tune-and-deploy/" + project?.id + "/training-dashboard";
  }, [project?.data_pipeline, project?.id]);

  const onModelAdded = React.useCallback(() => {
    patchProject({predict_config: null});

    Promise.all([models.refresh(), computes.refresh()])
      .then(() => navigate(nextPage));
  }, [computes, models, navigate, nextPage, patchProject]);

  return (
    <FineTuneAndDeployLayout
      onBack={() => navigate("/fine-tune-and-deploy/" + project?.id + "/data-preparation/local-upload")}
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
            hasMarketplace={true}
            hasCheckpoint={true}
            onMarketPlaceClick={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-model/marketplace")}
            hasFramework={true}
          />
      ) : <>Project not found</>}
    </FineTuneAndDeployLayout>
  );
}
