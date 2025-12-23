import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseTrainingDashboard} from "../Shared/TrainingDashboard";
import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";

export default function TrainingDashboard() {
  const {project, patchProject} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <FineTuneAndDeployLayout
      withoutSteps={true}
      onBack={project?.data_pipeline === "on" ? () => navigate("/fine-tune-and-deploy/" + project?.id + "/data") : undefined}
    >
      <BaseTrainingDashboard project={project} patchProject={patchProject} />
    </FineTuneAndDeployLayout>
  );
}
