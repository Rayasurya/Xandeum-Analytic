import CloudStorage from "../Shared/CloudStorage";
import TrainDeployLayout from "./TrainDeployLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";

export default function Storage() {
  const {project, refreshProject, permission} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <TrainDeployLayout
      onBack={() => navigate("/train-and-deploy/" + project?.id + "/project")}
      onNext={() => navigate("/train-and-deploy/" + project?.id + "/setup-infrastructure/gpu")}
    >
      <CloudStorage canAdd={permission.configure} canSync={permission.configure} project={project} refreshProject={refreshProject} />
    </TrainDeployLayout>
  );
}
