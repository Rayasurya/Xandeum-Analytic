import GPUOptions from "../Shared/GPUOptions";
import LabelAndValidateDataLayout from "./LabelAndValidateDataLayout";
import {useFlowProvider} from "../FlowProvider";
import {useNavigate} from "react-router-dom";
import React, {useEffect} from "react";

export default function GPU() {
  const {project, flowStatus} = useFlowProvider();
  const navigate = useNavigate();

  useEffect(() => {
    if (!flowStatus.hasMlAssisted) {
      navigate("/label-and-validate-data/" + project?.id + "/data");
    }
  }, [flowStatus.hasMlAssisted, navigate, project?.id]);

  if (!flowStatus.hasMlAssisted) {
    return <>Redirecting to data page...</>
  }

  return (
    <LabelAndValidateDataLayout
      onBack={() => navigate("/label-and-validate-data/" + project?.id + "/data-preparation/crowdsource")}
      onNext={() => navigate("/label-and-validate-data/" + project?.id + "/setup-model")}
    >
      {project && <GPUOptions project={project} />}
    </LabelAndValidateDataLayout>
  );
}
