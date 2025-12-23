import {useFlowProvider} from "../FlowProvider";
import {default as BaseDemoDeploy} from "../Shared/DemoDeploy";
import DeployLayout from "./DeployLayout";

export default function DemoDeploy() {
  const {project, gotoSelfHostWithReturn, gotoComputeMarketplaceWithReturn} = useFlowProvider();

  return (
    <DeployLayout withoutSteps={true}>
      <BaseDemoDeploy
        project={project}
        onAddCompute={gotoSelfHostWithReturn}
        onRentCompute={gotoComputeMarketplaceWithReturn}
      />
      {/* {project && <Demo project={project} />} */}
    </DeployLayout>
  );
}
