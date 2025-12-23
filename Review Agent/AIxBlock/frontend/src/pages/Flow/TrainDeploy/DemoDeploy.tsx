import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
// import {default as BaseDemoDeploy} from "../Shared/DemoDeploy";
import TrainDeployLayout from "./TrainDeployLayout";
import Demo from "../Shared/Demo";

export default function DemoDeploy() {
  const {project} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <TrainDeployLayout
      withoutSteps={true}
      onBack={project?.data_pipeline === "on" ? () => navigate("/train-and-deploy/" + project?.id + "/data") : undefined}
    >
      {/*<BaseDemoDeploy project={project} />*/}
      {project && <Demo project={project} />}
    </TrainDeployLayout>
  );
}
