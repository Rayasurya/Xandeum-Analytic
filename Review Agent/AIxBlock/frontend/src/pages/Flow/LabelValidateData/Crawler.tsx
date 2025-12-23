import LabelAndValidateDataLayout from "./LabelAndValidateDataLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseCrawler} from "../Shared/Crawler";
import { useOnDataPreparationNext } from "./hooks";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

export default function Crawler() {
  const {project} = useFlowProvider();
  const navigate = useNavigate();
  const onNext = useOnDataPreparationNext();

  return (
    <LabelAndValidateDataLayout
      onBack={() => navigate("/label-and-validate-data/" + project?.id + "/setup-infrastructure/storage")}
      onNext={onNext}
    >
      {
        ["localhost", "127.0.0.1", "dev-us-west-1.aixblock.io"].includes(window.location.hostname)
          ? <BaseCrawler project={project} onFinish={onNext} />
          : <EmptyContent message="(Coming soon...)" />
      }
    </LabelAndValidateDataLayout>
  );
}
