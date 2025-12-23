import CloudStorage from "../Shared/CloudStorage";
import DeployLayout from "./DeployLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";

export default function Storage() {
  const {project, refreshProject, permission} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <DeployLayout
      onBack={() => navigate("/deploy/" + project?.id + "/project")}
      onNext={() => navigate("/deploy/" + project?.id + "/setup-infrastructure/gpu")}
    >
      <CloudStorage canAdd={permission.configure} canSync={permission.configure} project={project} refreshProject={refreshProject} />
    </DeployLayout>
  );
}
