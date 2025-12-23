import CloudStorage from "../Shared/CloudStorage";
import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";
import { useNavigate } from "react-router-dom";
import { useFlowProvider } from "../FlowProvider";

export default function CloudSync() {
  const { project, refreshProject, permission } = useFlowProvider();
  const navigate = useNavigate();

  return (
    <FineTuneAndDeployLayout
      onBack={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-infrastructure/gpu")}
      onNext={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-model")}
    >
      <CloudStorage canAdd={false} project={project} refreshProject={refreshProject} canSync={permission.configure} />
    </FineTuneAndDeployLayout>
  );
}
