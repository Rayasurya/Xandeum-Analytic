import { useNavigate } from "react-router-dom";
import { IconArrowRight } from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
import { useFlowProvider } from "../FlowProvider";
import styles from '../Shared/WorkFlow.module.scss';
import LabelAndValidateDataLayout from "./LabelAndValidateDataLayout";
import {useFlowDiagramUpdate} from "./hooks";
import Workflow from "../Shared/Workflow";
import React from "react";

export default function TrainDeploy() {
  const flow = useFlowProvider();
  const navigate = useNavigate();
  useFlowDiagramUpdate();

  return (
    <LabelAndValidateDataLayout withoutSteps={true}>
      <div className={styles.workflows}>
        <div className={styles.workflowsWrapper}>
          <Workflow flows={flow.flowDiagram} />
          <Button
            onClick={() => {
              if (flow.project) {
                navigate("/label-and-validate-data/" + flow.project.id + "/project");
              } else {
                navigate("/label-and-validate-data/create");
              }
            }}
            className={styles.startflow}
          >
            Start
            <IconArrowRight width={18} height={18} />
          </Button>
        </div>
      </div>
    </LabelAndValidateDataLayout>
  );
}
