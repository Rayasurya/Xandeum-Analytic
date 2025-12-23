import { useNavigate } from "react-router-dom";
import { useFlowProvider } from "../FlowProvider";
import { default as BaseDataPipeline } from "../Shared/DataPipeline";
import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";

export default function DataPipeline() {
  const { project, patchProject, flowStatus } = useFlowProvider();
  const navigate = useNavigate();

  return (
    <FineTuneAndDeployLayout
      withoutSteps={true}
      onBack={() => navigate("/fine-tune-and-deploy/" + project?.id + "/data-pipeline")}
      bgColor="#fff"
    >
      {project && (
        <BaseDataPipeline
          project={project}
          patchProject={patchProject}
          hasMlAssisted={flowStatus.hasMlAssisted}
        />
      )}
    </FineTuneAndDeployLayout>
  );
}
