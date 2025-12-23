import DeployLayout from "./DeployLayout";
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
    <DeployLayout bgColor="white">
      {project && (
        <BaseModelMarketplace
          project={project}
          pageUrl={"/deploy/" + project.id + "/setup-model/marketplace"}
          onDetailClick={item => navigate("/deploy/" + project.id + "/setup-model/marketplace/" + item.id)}
        />
      )}
    </DeployLayout>
  );
}

export function ModelDetail() {
  const {project, models, computes} = useFlowProvider();
  const navigate = useNavigate();
  const {waitingForPromise} = useLoader();

  const onCompleted = useCallback(() => {
    const promise = Promise.all([models.refresh(), computes.refresh()]);
    waitingForPromise(promise, "Refreshing models...");
    promise.then(() => navigate("/deploy/" + project?.id + "/demo-and-deploy"));
  }, [computes, models, navigate, project?.id, waitingForPromise]);

  return (
    <DeployLayout bgColor="white">
      {project && (
        <BaseModelDetail
          project={project}
          onBackClick={() => navigate("/deploy/" + project?.id + "/setup-model/marketplace")}
          onCompleted={onCompleted}
        />
      )}
    </DeployLayout>
  );
}
