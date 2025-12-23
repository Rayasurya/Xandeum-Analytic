import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import {default as BaseCrawler} from "../Shared/Crawler";

export default function Crawler() {
  const {project} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <FineTuneAndDeployLayout
      onBack={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-infrastructure/gpu")}
      onNext={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-model")}
    >
      {
        ["localhost", "127.0.0.1", "dev-us-west-1.aixblock.io"].includes(window.location.hostname)
          ? <BaseCrawler
            project={project}
            onFinish={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-model")}
          />
          : <EmptyContent message="(Coming soon...)" />
      }
    </FineTuneAndDeployLayout>
  );
}
