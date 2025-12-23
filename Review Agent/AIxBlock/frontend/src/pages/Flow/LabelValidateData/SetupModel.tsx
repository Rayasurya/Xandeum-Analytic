import LabelAndValidateDataLayout from "./LabelAndValidateDataLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseSetupModel} from "../Shared/SetupModel";
import React, {useEffect, useMemo} from "react";

export default function SetupModel() {
  const {project, flowStatus, models, computes, patchProject} = useFlowProvider();
  const navigate = useNavigate();

  const nextPage = useMemo(() => {
    return project?.data_pipeline === "on"
      ? "/label-and-validate-data/" + project?.id + "/data"
      : "/label-and-validate-data/" + project?.id + "/settings";
  }, [project?.data_pipeline, project?.id]);

  const onModelAdded = React.useCallback(() => {
    patchProject({predict_config: null});

    Promise.all([models.refresh(), computes.refresh()])
      .then(() => navigate(nextPage));
  }, [computes, models, navigate, nextPage, patchProject]);

  useEffect(() => {
    if (!flowStatus.hasMlAssisted) {
      navigate("/label-and-validate-data/" + project?.id + "/settings", {
        replace: true,
        state: {redirectError: "Please enable the ML-assisted Labeling feature first"},
      });
    }
  }, [flowStatus.hasMlAssisted, navigate, project?.id]);

  if (!flowStatus.hasMlAssisted) {
    return <>Redirecting to settings page...</>
  }

  return (
    <LabelAndValidateDataLayout
      onBack={() => navigate("/label-and-validate-data/" + project?.id + "/setup-compute")}
      onNext={() => navigate(nextPage)}
    >
      {project ? (
        <BaseSetupModel
          onAdded={onModelAdded}
          project={project}
          hasMarketplace={true}
          hasCheckpoint={true}
          onMarketPlaceClick={() => navigate("/label-and-validate-data/" + project?.id + "/setup-model/marketplace")}
          hasFramework={true}
        />
      ) : <>Project not found</>}
    </LabelAndValidateDataLayout>
  );
}
