import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseSettings} from "../Shared/Settings";
import TrainDeployLayout from "./TrainDeployLayout";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

export default function Settings() {
  const {project, computes, flowDiagram, patchProject, switchDataPipeline, gotoComputeMarketplaceWithReturn, flowStatus, permission} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <TrainDeployLayout
      withoutSteps={true}
      onBack={project?.data_pipeline === "on" ? () => navigate("/train-and-deploy/" + project?.id + "/data") : undefined}
    >
      {permission.configure ? (
        <BaseSettings
          project={project}
          onClickImport={() => navigate(`/train-and-deploy/${project?.id.toString()}/data-preparation/local-upload`)}
          // onClickDataPipeline={() => navigate(`/train-and-deploy/${project?.id.toString()}/data-pipeline`)}
          showDataPipelineSwitcher={true}
          computes={computes}
          flowDiagram={flowDiagram}
          patchProject={patchProject}
          switchDataPipeline={switchDataPipeline}
          // onAddMoreModel={() => navigate("/train-and-deploy/" + project?.id + "/setup-model")}
          onAddComputeClick={gotoComputeMarketplaceWithReturn}
          hasMlAssisted={flowStatus.hasMlAssisted}
          hasAutoTrain={flowStatus.hasAutoTrain}
          canAddStorage={permission.configure}
          canSyncStorage={permission.configure}
          configCheckpointStorage={true}
        />
      ) : (
        <EmptyContent message="You don't have permission to access this page" />
      )}
    </TrainDeployLayout>
  );
}
