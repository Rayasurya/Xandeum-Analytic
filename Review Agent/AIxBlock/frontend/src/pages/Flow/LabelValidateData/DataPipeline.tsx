import { useNavigate } from "react-router-dom";
import { useFlowProvider } from "../FlowProvider";
import { default as BaseDataPipeline } from "../Shared/DataPipeline";
import LabelAndValidateDataLayout from "./LabelAndValidateDataLayout";
import {useCallback} from "react";
import {confirmDialog} from "@/components/Dialog";

export default function DataPipeline() {
  const { project, patchProject, flowStatus } = useFlowProvider();
  const navigate = useNavigate();

  const onMlAssistedChanged = useCallback((v: boolean) => {
    if (!v) {
      return;
    }

    if (flowStatus.hasAddedModel || flowStatus.hasRentedModel) {
      return;
    }

    confirmDialog({
      title: "ML-assisted Labeling",
      message: "Do you want to setup compute and setup model for ML-assisted Labeling now?",
      submitText: "Yes, I do",
      onSubmit: () => navigate("/label-and-validate-data/" + project?.id + "/setup-compute")
    });
  }, [flowStatus.hasAddedModel, flowStatus.hasRentedModel, navigate, project?.id]);

  return (
    <LabelAndValidateDataLayout
      withoutSteps={true}
      onBack={() => navigate("/label-and-validate-data/" + project?.id + "/data-pipeline")}
      bgColor="#fff"
    >
      {project && (
        <BaseDataPipeline
          project={project}
          patchProject={patchProject}
          hasMlAssisted={flowStatus.hasMlAssisted}
          onMlAssistedChanged={onMlAssistedChanged}
        />
      )}
    </LabelAndValidateDataLayout>
  );
}
