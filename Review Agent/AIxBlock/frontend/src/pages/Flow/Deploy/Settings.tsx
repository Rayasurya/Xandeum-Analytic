import {useFlowProvider} from "../FlowProvider";
import {default as BaseSettings} from "../Shared/Settings";
import DeployLayout from "./DeployLayout";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

export default function Settings() {
  const {project, computes, flowDiagram, patchProject, switchDataPipeline, gotoComputeMarketplaceWithReturn, flowStatus, permission} = useFlowProvider();

  return (
    <DeployLayout
      withoutSteps={true}
    >
      {permission.configure ? (
        <BaseSettings
          project={project}
          computes={computes}
          flowDiagram={flowDiagram}
          patchProject={patchProject}
          switchDataPipeline={switchDataPipeline}
          // onAddMoreModel={() => navigate("/deploy/" + project?.id + "/setup-model")}
          onAddComputeClick={gotoComputeMarketplaceWithReturn}
          hasMlAssisted={flowStatus.hasMlAssisted}
          canAddStorage={permission.configure}
          canSyncStorage={permission.configure}
          noStorages={true}
          noLanguages={true}
        />
      ) : (
        <EmptyContent message="You don't have permission to access this page" />
      )}
    </DeployLayout>
  );
}
