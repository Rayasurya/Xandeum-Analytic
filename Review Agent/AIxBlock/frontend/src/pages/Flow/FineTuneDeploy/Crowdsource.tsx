import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseCrowdsource} from "../Shared/Crowdsource"; 

export default function Crowdsource() {
  const {project} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <FineTuneAndDeployLayout
      onBack={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-infrastructure/gpu")}
      onNext={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-model")}
    >
      <BaseCrowdsource />
    </FineTuneAndDeployLayout>
  );
}
