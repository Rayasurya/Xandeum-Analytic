import CloudStorage from "../Shared/CloudStorage";
import LabelAndValidateDataLayout from "./LabelAndValidateDataLayout";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";

export default function Storage() {
  const {project, refreshProject, permission} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <LabelAndValidateDataLayout
      onBack={() => navigate("/label-and-validate-data/" + project?.id + "/project")}
      onNext={() => navigate("/label-and-validate-data/" + project?.id + "/data-preparation/local-upload")}
    >
      <CloudStorage canAdd={permission.configure} canSync={permission.configure} project={project} refreshProject={refreshProject} />
    </LabelAndValidateDataLayout>
  );
}
