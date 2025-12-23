import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";
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
    <FineTuneAndDeployLayout bgColor="white">
      {project && (
        <BaseModelMarketplace
          project={project}
          pageUrl={"/fine-tune-and-deploy/" + project.id + "/setup-model/marketplace"}
          onDetailClick={item => navigate("/fine-tune-and-deploy/" + project.id + "/setup-model/marketplace/" + item.id)}
        />
      )}
    </FineTuneAndDeployLayout>
  );
}

export function ModelDetail() {
  const {project, models, computes, flowStatus, patchProject} = useFlowProvider();
  const navigate = useNavigate();
  const {waitingForPromise} = useLoader();

  const onCompleted = useCallback(() => {
    patchProject({predict_config: null});
    const promise = Promise.all([models.refresh(), computes.refresh()]);
    waitingForPromise(promise, "Refreshing models...");

    if (flowStatus.hasData) {
      promise.then(() => navigate("/fine-tune-and-deploy/" + project?.id + "/data"));
    } else {
      promise.then(() => navigate("/fine-tune-and-deploy/" + project?.id + "/training-dashboard"));
    }
  }, [computes, flowStatus.hasData, models, navigate, project?.id, waitingForPromise, patchProject]);

  return (
    <FineTuneAndDeployLayout bgColor="white">
      {project && (
        <BaseModelDetail
          project={project}
          onBackClick={() => navigate("/fine-tune-and-deploy/" + project?.id + "/setup-model/marketplace")}
          onCompleted={onCompleted}
        />
      )}
    </FineTuneAndDeployLayout>
  );
}
