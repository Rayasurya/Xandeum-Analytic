import React, { Fragment } from "react";
import IconCircleChecked from "@/assets/icons/IconCircleChecked";
import { CROWD_STEPS } from "../../constants";

export type TCrowdStepProps = {
  currentStep?: "upload_guildline" | "qualification_test";
  onSelectStep?: (step: TCrowdStepProps["currentStep"]) => void;
};

const MemoizedSteps: React.FC<TCrowdStepProps> = ({
  currentStep,
  onSelectStep,
}) => {
  const handleStepClick = (step: TCrowdStepProps["currentStep"]) => {
    onSelectStep && onSelectStep(step);
  };

  return (
    <div className="c-step children">
      {CROWD_STEPS?.map((step, index) => (
        <Fragment key={`step-key-${step.title}`}>
          <div
            className={`c-step-item ${
              currentStep === step.value ? "active" : ""
            }  allow`}
            key={`key-${step.title}`}
            onClick={() =>
              handleStepClick(step.value as TCrowdStepProps["currentStep"])
            }
          >
            <div className="c-step-item__number">
              <IconCircleChecked />
            </div>
            <span className="c-step-item__title">{step.title}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
};

const CrowdSteps = React.memo(MemoizedSteps);

export default CrowdSteps;
