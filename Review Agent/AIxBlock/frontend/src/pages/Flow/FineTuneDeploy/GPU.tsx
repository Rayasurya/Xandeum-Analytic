import GPUOptions from "../Shared/GPUOptions";
import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";
import {useFlowProvider} from "../FlowProvider";
import {useNavigate} from "react-router-dom";
import React from "react";

export default function GPU() {
  const {project} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <FineTuneAndDeployLayout
      onBack={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-infrastructure/storage")}
      onNext={() => navigate("/fine-tune-and-deploy/" + project?.id + "/data-preparation/local-upload")}
    >
      {project && <GPUOptions project={project} />}
    </FineTuneAndDeployLayout>
  );
}
