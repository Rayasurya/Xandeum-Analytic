import GPUOptions from "../Shared/GPUOptions";
import DeployLayout from "./DeployLayout";
import {useFlowProvider} from "../FlowProvider";
import {useNavigate} from "react-router-dom";
import React from "react";

export default function GPU() {
  const {project} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <DeployLayout
      onBack={() => navigate("/deploy/" + project?.id + "/project")}
      onNext={() => navigate("/deploy/" + project?.id + "/setup-model")}
    >
      {project && <GPUOptions project={project} />}
    </DeployLayout>
  );
}
