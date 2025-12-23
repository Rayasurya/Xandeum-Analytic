import TrainDeployLayout from "./TrainDeployLayout";
import {useFlowProvider} from "../FlowProvider";
import {useNavigate} from "react-router-dom";
import {default as BaseLocalUpload} from "../Shared/LocalUpload";

export default function LocalUpload() {
  const {project, refreshProject} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <TrainDeployLayout
      onBack={() => navigate("/train-and-deploy/" + project?.id + "/setup-infrastructure/gpu")}
      onNext={() => navigate("/train-and-deploy/" + project?.id + "/setup-model")}
    >
      <BaseLocalUpload project={project} refreshProject={refreshProject} />
    </TrainDeployLayout>
  );
}
