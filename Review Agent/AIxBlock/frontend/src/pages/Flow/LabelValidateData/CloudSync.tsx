import CloudStorage from "../Shared/CloudStorage";
import LabelAndValidateDataLayout from "./LabelAndValidateDataLayout";
import { useNavigate } from "react-router-dom";
import { useFlowProvider } from "../FlowProvider";
import {useOnDataPreparationNext} from "./hooks";

export default function CloudSync() {
  const { project, refreshProject, permission } = useFlowProvider();
  const navigate = useNavigate();
  const onNext = useOnDataPreparationNext();

  return (
    <LabelAndValidateDataLayout
      onBack={() => navigate("/label-and-validate-data/" + project?.id + "/setup-infrastructure/storage")}
      onNext={onNext}
    >
      <CloudStorage canAdd={false} project={project} refreshProject={refreshProject} canSync={permission.configure} />
    </LabelAndValidateDataLayout>
  );
}
