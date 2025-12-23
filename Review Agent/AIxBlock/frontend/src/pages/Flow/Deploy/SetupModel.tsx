import DeployLayout from "./DeployLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseSetupModel} from "../Shared/SetupModel";
import React from "react";
import styles from "./Deploy.module.scss";
import ModelsList from "../Shared/Model/ModelsList";

export default function SetupModel() {
  const {project, models, computes, flowStatus} = useFlowProvider();
  const navigate = useNavigate();

  const onModelAdded = React.useCallback(() => {
    Promise.all([models.refresh(), computes.refresh()])
      .then(() => {
        navigate("/deploy/" + project?.id + "/demo-and-deploy");
      });
  }, [computes, models, navigate, project?.id]);

  return (
    <DeployLayout
      onBack={() => navigate("/deploy/" + project?.id + "/setup-infrastructure/gpu")}
      onNext={() => navigate("/deploy/" + project?.id + "/demo-and-deploy")}
    >
      {project ? (
        flowStatus.hasAddedModel || flowStatus.hasRentedModel
          ? <div className={styles.modelList}>
            <ModelsList />
          </div>
          : <BaseSetupModel
            onAdded={onModelAdded}
            project={project}
            hasMarketplace={true}
            hasCheckpoint={true}
            onMarketPlaceClick={() => navigate("/deploy/" + project?.id + "/setup-model/marketplace")}
            hasFramework={true}
          />
      ) : <>Project not found</>}
    </DeployLayout>
  );
}
