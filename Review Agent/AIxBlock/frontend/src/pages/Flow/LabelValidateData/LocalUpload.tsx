import LabelAndValidateDataLayout from "./LabelAndValidateDataLayout";
import {useFlowProvider} from "../FlowProvider";
import {useNavigate} from "react-router-dom";
import {default as BaseLocalUpload} from "../Shared/LocalUpload";
import {useOnDataPreparationNext} from "./hooks";

export default function LocalUpload() {
  const {project, refreshProject} = useFlowProvider();
  const navigate = useNavigate();
  const onNext = useOnDataPreparationNext();

  return (
    <LabelAndValidateDataLayout
      onBack={() => navigate("/label-and-validate-data/" + project?.id + "/setup-infrastructure/storage")}
      onNext={onNext}
    >
      <BaseLocalUpload project={project} refreshProject={refreshProject} />
    </LabelAndValidateDataLayout>
  );
}
