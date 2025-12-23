import LabelAndValidateDataLayout from "./LabelAndValidateDataLayout";
import {default as BaseModelMarketplace} from "@/components/ModelMarketplace/Index";
import {default as BaseModelDetail} from "@/components/ModelMarketplace/ModelDetail/Index";
import {useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
import {useLoader} from "@/providers/LoaderProvider";
import {useCallback} from "react";

export function ModelMarketplace() {
  const {project} = useFlowProvider();
  const navigate = useNavigate();

  return (
    <LabelAndValidateDataLayout bgColor="white">
      {project && (
        <BaseModelMarketplace
          project={project}
          pageUrl={"/label-and-validate-data/" + project.id + "/setup-model/marketplace"}
          onDetailClick={item => navigate("/label-and-validate-data/" + project.id + "/setup-model/marketplace/" + item.id)}
        />
      )}
    </LabelAndValidateDataLayout>
  );
}

export function ModelDetail() {
  const {project, models, computes, patchProject} = useFlowProvider();
  const navigate = useNavigate();
  const {waitingForPromise} = useLoader();

  const onCompleted = useCallback(() => {
    patchProject({predict_config: null});
    const promise = Promise.all([models.refresh(), computes.refresh()]);
    waitingForPromise(promise, "Refreshing models...");
    promise.then(() => navigate("/label-and-validate-data/" + project?.id + "/data"));
  }, [computes, models, navigate, project?.id, waitingForPromise, patchProject]);

  return (
    <LabelAndValidateDataLayout bgColor="white">
      {project && (
        <BaseModelDetail
          project={project}
          onBackClick={() => navigate("/label-and-validate-data/" + project?.id + "/setup-model/marketplace")}
          onCompleted={onCompleted}
        />
      )}
    </LabelAndValidateDataLayout>
  );
}
