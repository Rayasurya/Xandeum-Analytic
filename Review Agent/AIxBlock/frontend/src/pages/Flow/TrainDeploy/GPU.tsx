import GPUOptions from "../Shared/GPUOptions";
import TrainDeployLayout from "./TrainDeployLayout";
import {useFlowProvider} from "../FlowProvider";
import {useNavigate} from "react-router-dom";
import React from "react";

export default function GPU() {
  const {project} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <TrainDeployLayout
      onBack={() => navigate("/train-and-deploy/" + project?.id + "/setup-infrastructure/storage")}
      onNext={() => navigate("/train-and-deploy/" + project?.id + "/data-preparation/local-upload")}
    >
      {project && <GPUOptions project={project} />}
    </TrainDeployLayout>
  );
}
