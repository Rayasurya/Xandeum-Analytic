import CloudStorage from "../Shared/CloudStorage";
import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";

export default function Storage() {
  const {project, refreshProject, permission} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <FineTuneAndDeployLayout
      onBack={() => navigate("/fine-tune-and-deploy/" + project?.id + "/project")}
      onNext={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-infrastructure/gpu")}
    >
      <CloudStorage canAdd={permission.configure} canSync={permission.configure} project={project} refreshProject={refreshProject} />
    </FineTuneAndDeployLayout>
  );
}
