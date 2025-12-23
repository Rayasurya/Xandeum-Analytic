import TrainDeployLayout from "./TrainDeployLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseDataHubs} from "../Shared/DataHubs";

export default function Crawler() {
  const {project} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <TrainDeployLayout
      onBack={() => navigate("/train-and-deploy/" + project?.id + "/setup-infrastructure/gpu")}
      onNext={() => navigate("/train-and-deploy/" + project?.id + "/setup-model")}
    >
      <BaseDataHubs />
    </TrainDeployLayout>
  );
}
