import { useNavigate } from "react-router-dom";
import { IconArrowRight } from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
import { useFlowProvider } from "../FlowProvider";
import styles from '../Shared/WorkFlow.module.scss';
import FineTuneAndDeployLayout from "./FineTuneAndDeployLayout";
import Workflow from "../Shared/Workflow";
import React from "react";

export default function TrainDeploy() {
  const flow = useFlowProvider();
  const navigate = useNavigate();

  return (
    <FineTuneAndDeployLayout withoutSteps={true}>
      <div className={styles.workflows}>
        <div className={styles.workflowsWrapper}>
          <Workflow flows={flow.flowDiagram} />
          <Button
            onClick={() => {
              if (flow.project) {
                navigate("/fine-tune-and-deploy/" + flow.project.id + "/project");
              } else {
                navigate("/fine-tune-and-deploy/create");
              }
            }}
            className={styles.startflow}
          >
            Start
            <IconArrowRight width={18} height={18} />
          </Button>
        </div>
      </div>
    </FineTuneAndDeployLayout>
  );
}
