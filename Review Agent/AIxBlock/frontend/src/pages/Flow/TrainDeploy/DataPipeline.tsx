import { useNavigate } from "react-router-dom";
import { useFlowProvider } from "../FlowProvider";
import { default as BaseDataPipeline } from "../Shared/DataPipeline";
import TrainDeployLayout from "./TrainDeployLayout";

export default function DataPipeline() {
  const { project, patchProject, flowStatus } = useFlowProvider();
  const navigate = useNavigate();

  return (
    <TrainDeployLayout
      withoutSteps={true}
      onBack={() => navigate("/train-and-deploy/" + project?.id + "/data-pipeline")}
      bgColor="#fff"
    >
      {project && (
        <BaseDataPipeline
          project={project}
          patchProject={patchProject}
          hasMlAssisted={flowStatus.hasMlAssisted}
        />
      )}
    </TrainDeployLayout>
  );
}
