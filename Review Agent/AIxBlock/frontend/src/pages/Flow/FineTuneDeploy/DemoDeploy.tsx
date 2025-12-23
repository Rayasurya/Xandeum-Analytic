import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseDemoDeploy} from "../Shared/DemoDeploy";
import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";

export default function DemoDeploy() {
  const {project, gotoSelfHostWithReturn, gotoComputeMarketplaceWithReturn} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <FineTuneAndDeployLayout
      withoutSteps={true}
      onBack={project?.data_pipeline === "on" ? () => navigate("/fine-tune-and-deploy/" + project?.id + "/data") : undefined}
    >
      <BaseDemoDeploy
        project={project}
        onAddCompute={gotoSelfHostWithReturn}
        onRentCompute={gotoComputeMarketplaceWithReturn}
      />
      {/* {project && <Demo project={project} />} */}
    </FineTuneAndDeployLayout>
  );
}
