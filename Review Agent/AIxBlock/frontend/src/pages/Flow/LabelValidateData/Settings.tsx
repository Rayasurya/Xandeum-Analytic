import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {default as BaseSettings} from "../Shared/Settings";
import LabelAndValidateDataLayout from "./LabelAndValidateDataLayout";
import {useCallback} from "react";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

export default function Settings() {
  const {project, computes, flowDiagram, patchProject, switchDataPipeline, flowStatus, gotoComputeMarketplaceWithReturn, permission} = useFlowProvider();
  const navigate = useNavigate();

  const onMlAssistedChanged = useCallback((v: boolean) => {
    if (!v || flowStatus.hasAddedModel || flowStatus.hasRentedModel) {
      return;
    }

    if (flowStatus.hasCompute) {
      navigate(`/label-and-validate-data/${project?.id.toString()}/setup-model`);
    } else {
      navigate(`/label-and-validate-data/${project?.id.toString()}/setup-compute`);
    }
  }, [flowStatus.hasAddedModel, flowStatus.hasCompute, flowStatus.hasRentedModel, navigate, project?.id]);

  return (
    <LabelAndValidateDataLayout
      withoutSteps={true}
      onBack={project?.data_pipeline === "on" ? () => navigate("/label-and-validate-data/" + project?.id + "/data") : undefined}
    >
      {permission.configure ? (
        <BaseSettings
          project={project}
          onClickImport={() => navigate(`/label-and-validate-data/${project?.id.toString()}/data-preparation/local-upload`)}
          // onClickDataPipeline={() => navigate(`/label-and-validate-data/${project?.id.toString()}/data-pipeline`)}
          showDataPipelineSwitcher={true}
          computes={computes}
          flowDiagram={flowDiagram}
          patchProject={patchProject}
          switchDataPipeline={switchDataPipeline}
          forceDataPipeline={true}
          noComputes={!flowStatus.hasMlAssisted}
          noSource={true}
          noModels={!flowStatus.hasMlAssisted}
          // onAddMoreModel={() => navigate("/label-and-validate-data/" + project?.id + "/setup-model")}
          onAddComputeClick={gotoComputeMarketplaceWithReturn}
          hasMlAssisted={flowStatus.hasMlAssisted}
          onMlAssistedChanged={onMlAssistedChanged}
          canAddStorage={permission.configure}
          canSyncStorage={permission.configure}
        />
      ) : (
        <EmptyContent message="You don't have permission to access this page" />
      )}
    </LabelAndValidateDataLayout>
  );
}
