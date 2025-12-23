import {useFlowProvider} from "../FlowProvider";
import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect/*, useMemo*/} from "react";
import {FlowItem} from "../Shared/Workflow";
import styles from "../Shared/WorkFlow.module.scss";
import {IconBox, IconData, IconMonitor, IconRocket} from "@/assets/icons/Index";
import IconCircleChecked from "@/assets/icons/IconCircleChecked";
import {CheckCompute, CheckModel, CheckStorage} from "../Shared/CheckRequirements";

export function useFlowDiagramUpdate() {
  const {flowStatus, setFlowDiagram, project/*, systemStorages*/} = useFlowProvider();
  const location = useLocation();
  const navigate = useNavigate();

  // const validStorages = useMemo(
  //   () => flowStatus.hasStorage && systemStorages.source.length === 0 && systemStorages.target.length === 0,
  //   [flowStatus.hasStorage, systemStorages.source.length, systemStorages.target.length],
  // );

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
        onClick: project?.id ? () => navigate("/deploy/" + project?.id + "/project") : undefined,
      },
      {
        step: 1,
        label: "Set up infrastructure",
        key: "setup-infrastructure",
        children: (
          <div className={styles.flowsItemContent}>
            <div className={styles.flowsFlex}>
              {/*<div className={validStorages ? styles.flowsItemContentChildrenPassed : styles.flowsItemContentChildren}>*/}
              {/*  {validStorages && <IconCircleChecked />}*/}
              {/*  Setup storage*/}
              {/*</div>*/}
              {/*<span>and</span>*/}
              <div className={
                (flowStatus.hasCompute || flowStatus.hasAddedModel || flowStatus.hasRentedModel)
                  ? styles.flowsItemContentChildrenPassed
                  : styles.flowsItemContentChildren
              }>
                {(flowStatus.hasCompute || flowStatus.hasAddedModel || flowStatus.hasRentedModel) && <IconCircleChecked />}
                Setup computes for model deploying
              </div>
            </div>
          </div>
        ),
        icon: <IconMonitor />,
        isCompleted: /*validStorages &&*/ (flowStatus.hasCompute || flowStatus.hasAddedModel || flowStatus.hasRentedModel),
        isCurrent: pathSegments.length > 2 && pathSegments[3] === "setup-infrastructure",
        onClick: project?.id ? () => navigate("/deploy/" + project?.id + "/setup-infrastructure/gpu") : undefined,
      },
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
        isCurrent: pathSegments.length > 2 && pathSegments[3] === "setup-model",
        onClick: project?.id ? () => navigate("/deploy/" + project?.id + "/setup-model") : undefined,
      },
      {
        step: 5,
        label: "Demo and deploy",
        key: "demo-and-deploy",
        icon: <IconRocket/>,
        isCompleted: false,
        isCurrent: pathSegments.length > 2 && ["settings", "demo-and-deploy"].includes(pathSegments[3]),
        onClick: project?.id ? () => navigate("/deploy/" + project?.id + "/demo-and-deploy") : undefined,
      },
    ];

    setFlowDiagram(flows);
  }, [
    flowStatus.hasCompute,
    flowStatus.hasCheckpoint,
    flowStatus.hasAddedModel,
    flowStatus.hasRentedModel,
    location.pathname,
    project?.task_number,
    setFlowDiagram,
    navigate,
    project?.id,
    /*validStorages,*/
  ]);
}

export function RequireStorage() {
  const {project} = useFlowProvider();
  return <CheckStorage whenErrorRedirectTo={"/deploy/" + project?.id + "/setup-infrastructure/storage"} />;
}

export function RequireCompute() {
  const {project} = useFlowProvider();
  return <CheckCompute whenErrorRedirectTo={"/deploy/" + project?.id + "/setup-infrastructure/gpu"} />;
}

export function RequireModel() {
  const {project} = useFlowProvider();
  return <CheckModel whenErrorRedirectTo={"/deploy/" + project?.id + "/setup-model"} />;
}
