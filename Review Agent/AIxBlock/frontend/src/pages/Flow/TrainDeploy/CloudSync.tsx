import CloudStorage from "../Shared/CloudStorage";
import TrainDeployLayout from "./TrainDeployLayout";
import { useNavigate } from "react-router-dom";
import { useFlowProvider } from "../FlowProvider";

export default function CloudSync() {
  const { project, refreshProject, permission } = useFlowProvider();
  const navigate = useNavigate();

  return (
    <TrainDeployLayout
      onBack={() => navigate("/train-and-deploy/" + project?.id + "/setup-infrastructure/gpu")}
      onNext={() => navigate("/train-and-deploy/" + project?.id + "/setup-model")}
    >
      <CloudStorage canAdd={false} project={project} refreshProject={refreshProject} canSync={permission.configure} />
    </TrainDeployLayout>
  );
}
