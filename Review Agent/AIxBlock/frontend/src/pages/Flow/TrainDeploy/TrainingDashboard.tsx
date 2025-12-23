import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseTrainingDashboard} from "../Shared/TrainingDashboard";
import TrainDeployLayout from "./TrainDeployLayout";

export default function TrainingDashboard() {
  const {project, patchProject} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <TrainDeployLayout
      withoutSteps={true}
      onBack={project?.data_pipeline === "on" ? () => navigate("/train-and-deploy/" + project?.id + "/data") : undefined}
    >
      <BaseTrainingDashboard project={project} patchProject={patchProject} />
    </TrainDeployLayout>
  );
}
