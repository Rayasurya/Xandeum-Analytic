import React, {useMemo} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import {useFlowProvider} from "../FlowProvider";
// import {toastError} from "@/utils/toast";

export type TCheckRequirement = {
  initialized: boolean;
  isPassed: boolean;
  whenErrorRedirectTo: string;
  errorMessage: string | React.ReactNode;
}

export function CheckRequirement({initialized, isPassed, whenErrorRedirectTo, errorMessage}: TCheckRequirement) {
  const navigate = useNavigate();
  const {project} = useFlowProvider();

  React.useEffect(() => {
    if (!initialized || isPassed || !project) {
      return;
    }

    if (window.APP_SETTINGS.debug) {
      console.error("Redirect from: " + window.location.pathname);
    }

    navigate(whenErrorRedirectTo, {replace: true, state: {redirectError: errorMessage}});
    // toastError(errorMessage, {autoClose: 30000, toastId: "flow-check-requirement"});
  }, [errorMessage, initialized, isPassed, navigate, whenErrorRedirectTo, project]);

  if (!isPassed) {
    return null;
  }

  return <Outlet />;
}

export function CheckStorage({whenErrorRedirectTo}: Pick<TCheckRequirement, "whenErrorRedirectTo">) {
  const {initialized, systemStorages, flowStatus, storages} = useFlowProvider();

  const needToBeSetupStorages = useMemo(() => [
    ...systemStorages.source.map(id => "SOURCE S3-" + id),
    ...systemStorages.target.map(id => "TARGET S3-" + id),
  ], [systemStorages.source, systemStorages.target]);

  const errorMessage = useMemo(() => {
    if (!flowStatus.hasStorage) {
      return "Please setup storage first";
    }

    if (needToBeSetupStorages.length > 0) {
      return "Click Edit to set up or check your storage. Your data and model will stay on your own infrastructure. Storages: "
        + needToBeSetupStorages.join(", ");
    }

  }, [flowStatus, needToBeSetupStorages]);

  if (storages.loading || !flowStatus.isInitialized) {
    return <Outlet />;
  }

  return <CheckRequirement
    initialized={initialized}
    isPassed={flowStatus.hasStorage && needToBeSetupStorages.length === 0}
    whenErrorRedirectTo={whenErrorRedirectTo}
    errorMessage={errorMessage}
  />
}

export function CheckCompute({whenErrorRedirectTo}: Pick<TCheckRequirement, "whenErrorRedirectTo">) {
  const {flowStatus, initialized, computes, models} = useFlowProvider();

  if (computes.loading || models.loading || !flowStatus.isInitialized) {
    return <Outlet />;
  }

  return <CheckRequirement
    initialized={initialized}
    isPassed={flowStatus.hasCompute || flowStatus.hasAddedModel || flowStatus.hasRentedModel}
    whenErrorRedirectTo={whenErrorRedirectTo}
    errorMessage={"Please setup GPU first"}
  />
}

export function CheckDataPipeline({whenErrorRedirectTo}: Pick<TCheckRequirement, "whenErrorRedirectTo">) {
  const {flowStatus, project} = useFlowProvider();

  if (!flowStatus.isInitialized) {
    return <Outlet />;
  }

  return <CheckRequirement
    initialized={true}
    isPassed={project?.data_pipeline === "on"}
    whenErrorRedirectTo={whenErrorRedirectTo}
    errorMessage={"Please enable data pipeline first"}
  />
}

export function CheckModel({whenErrorRedirectTo}: Pick<TCheckRequirement, "whenErrorRedirectTo">) {
  const {flowStatus, initialized, models} = useFlowProvider();

  if (models.loading || !flowStatus.isInitialized) {
    return <Outlet />;
  }

  return <CheckRequirement
    initialized={initialized}
    isPassed={flowStatus.hasAddedModel || flowStatus.hasRentedModel}
    whenErrorRedirectTo={whenErrorRedirectTo}
    errorMessage={"Please setup model first"}
  />
}
