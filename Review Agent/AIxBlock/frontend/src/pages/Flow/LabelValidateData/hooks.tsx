import {useFlowProvider} from "../FlowProvider";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import React, {useCallback, useEffect, useMemo} from "react";
import {FlowItem} from "../Shared/Workflow";
import styles from "../Shared/WorkFlow.module.scss";
import {IconBox, IconData, IconMonitor, IconRocket} from "@/assets/icons/Index";
import IconCircleChecked from "@/assets/icons/IconCircleChecked";
import {CheckCompute, CheckModel, CheckStorage} from "../Shared/CheckRequirements";

export function useFlowDiagramUpdate() {
  const {flowStatus, setFlowDiagram, project, systemStorages} = useFlowProvider();
  const location = useLocation();
  const navigate = useNavigate();

  const validStorages = useMemo(
    () => flowStatus.hasStorage && systemStorages.source.length === 0 && systemStorages.target.length === 0,
    [flowStatus.hasStorage, systemStorages.source.length, systemStorages.target.length],
  );

  useEffect(() => {
    const pathSegments = location.pathname.split("/");

    const flows: FlowItem[] = [
      {
        step: 0,
        label: "Project",
        key: "project",
        icon: <IconData />,
        isCompleted: !!project?.id,
        isCurrent: pathSegments.length <= 3 || pathSegments[3] === "project" || pathSegments[3].length === 0,
        onClick: project?.id ? () => navigate("/label-and-validate-data/" + project?.id + "/project") : undefined,
      },
      {
        step: 1,
        label: "Set up infrastructure",
        key: "setup-infrastructure",
        children: (
          <div className={styles.flowsItemContent}>
            <div className={styles.flowsFlex}>
              <div className={validStorages ? styles.flowsItemContentChildrenPassed : styles.flowsItemContentChildren}>
                {validStorages && <IconCircleChecked />}
                Setup storage
              </div>
            </div>
          </div>
        ),
        icon: <IconMonitor />,
        isCompleted: validStorages,
        isCurrent: pathSegments.length > 2 && pathSegments[3] === "setup-infrastructure",
        onClick: project?.id ? () => navigate("/label-and-validate-data/" + project?.id + "/setup-infrastructure/storage") : undefined,
      },
      {
        step: 2,
        label: "Data preparation",
        key: "data-preparation",
        icon: <IconData />,
        isCompleted: (project?.task_number ?? 0) > 0,
        isCurrent: pathSegments.length > 2 && pathSegments[3] === "data-preparation",
        onClick: project?.id ? () => navigate("/label-and-validate-data/" + project?.id + "/data-preparation/local-upload") : undefined,
      },
      ...flowStatus.hasMlAssisted ? [
        {
          step: 4,
          label: "Setup Compute",
          key: "setup-compute",
          icon: <IconMonitor />,
          isCompleted: flowStatus.hasCompute || flowStatus.hasAddedModel || flowStatus.hasRentedModel,
          isCurrent: pathSegments.length > 2 && pathSegments[3] === "setup-compute",
          onClick: project?.id ? () => navigate("/label-and-validate-data/" + project?.id + "/setup-compute") : undefined,
        },
      ] : [],
      {
        step: 3,
        label: "Set up Models",
        key: "setup-model",
        children: (
          <div className={styles.flowsItemContent}>
            <div className={styles.flowsFlex}>
              {!flowStatus.hasRentedModel && (
                <div
                  className={flowStatus.hasAddedModel ? styles.flowsItemContentChildrenPassed : styles.flowsItemContentChildren}>
                  {flowStatus.hasAddedModel && <IconCircleChecked/>}
                  Add your model
                </div>
              )}
              {!flowStatus.hasRentedModel && !flowStatus.hasAddedModel && <span>Or</span>}
              {!flowStatus.hasAddedModel && (
                <div
                  className={flowStatus.hasRentedModel ? styles.flowsItemContentChildrenPassed : styles.flowsItemContentChildren}>
                  {flowStatus.hasRentedModel && <IconCircleChecked/>}
                  Check our model marketplace
                </div>
              )}
            </div>
          </div>
        ),
        icon: <IconBox/>,
        isCompleted: flowStatus.hasAddedModel || flowStatus.hasRentedModel,
        isCurrent: pathSegments.length > 2 && ["setup-model"].includes(pathSegments[3]),
        tip: "If you want the model to assist with auto labeling, configure this step",
        onClick: project?.id ? () => navigate("/label-and-validate-data/" + project?.id + "/setup-model") : undefined,
      },
      {
        step: 6,
        label: "Labeling Data",
        key: "labeling-data",
        icon: <IconRocket/>,
        isCompleted: false,
        isCurrent: pathSegments.length > 2 && ["data", "settings"].includes(pathSegments[3]),
        onClick: project?.id ? () => navigate("/label-and-validate-data/" + project?.id + "/data") : undefined,
      },
    ];

    setFlowDiagram(flows);
  }, [
    flowStatus.hasAddedModel,
    flowStatus.hasRentedModel,
    location.pathname,
    project?.task_number,
    setFlowDiagram,
    navigate,
    project?.id,
    validStorages,
    flowStatus.hasCompute,
    flowStatus.hasMlAssisted,
  ]);
}

export function useOnDataPreparationNext() {
  const {project, flowStatus} = useFlowProvider();
  const navigate = useNavigate();

  return useCallback(() => {
    if (flowStatus.hasMlAssisted) {
      navigate("/label-and-validate-data/" + project?.id + "/setup-compute");
    } else {
      navigate("/label-and-validate-data/" + project?.id + "/data");
    }
  }, [flowStatus.hasMlAssisted, navigate, project?.id]);
}

export function RequireStorage() {
  const {project} = useFlowProvider();
  return <CheckStorage whenErrorRedirectTo={"/label-and-validate-data/" + project?.id + "/setup-infrastructure/storage"} />;
}

export function RequireCompute() {
  const {project, flowStatus} = useFlowProvider();
  if (!flowStatus.hasMlAssisted) return <Outlet />;
  return <CheckCompute whenErrorRedirectTo={"/label-and-validate-data/" + project?.id + "/setup-compute"} />;
}

export function RequireModel() {
  const {project, flowStatus} = useFlowProvider();
  if (!flowStatus.hasMlAssisted) return <Outlet />;
  return <CheckModel whenErrorRedirectTo={"/label-and-validate-data/" + project?.id + "/setup-model"} />;
}
