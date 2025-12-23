import React, { Suspense, useCallback, useState } from "react";

import { useNavigate } from "react-router-dom";
import IconPlus from "@/assets/icons/IconPlus";
import Modal from "@/components/Modal/Modal";
import { CROWD_STEP } from "@/constants/projectConstants";
import { TProjectModel } from "@/models/project";
import {
  StepValues,
  useProjectContext,
} from "@/providers/ProjectProvider";
import CrowdSteps, {
  TCrowdStepProps,
} from "../LayoutSettings/Header/CrowdSteps/Index";
import LayoutSettings from "../LayoutSettings/Index";
// import CreatePractical from "./CreatePractical/CreatePractical";
import CreateQuestion from "./CreateQuestion/CreateQuestion";
import "./Crowds.scss";
import AppLoading from "@/components/AppLoading/AppLoading";

const ContactUs = React.lazy(() => import("./ContactUs/ContactUs"));
const UploadGuideline = React.lazy(
  () => import("./UploadGuideline/UploadGuideline")
);

type TCrowdsProps = {
  data?: TProjectModel | null;
};

const Crowds = (props: TCrowdsProps) => {
  const { state, dispatch, addMoreQuestion } = useProjectContext();
  const { crowdSteps } = state;
  const navigate = useNavigate();
  const { stepIndex } = crowdSteps;
  const [isOpenModal, setOpenModal] = useState<boolean>(true);
  const [isShowContent, setShowContent] = useState<boolean | null>(null);
  const [activeStep, setActiveStep] =
    useState<TCrowdStepProps["currentStep"]>("upload_guildline");
  const [isOpenUploadGuideline, setIsOpenUploadGuideline] =
    useState<boolean>(false);

  const handleCloseCrowd = () => {
    setShowContent(false);
    setOpenModal(false);
  };

  const handleSubmitModal = () => {
    setShowContent(true);
    setOpenModal(false);
  };

  const handleCancelModal = () => {
    setShowContent(false);
    setOpenModal(false);
    setIsOpenUploadGuideline(true);
    // Skip step and navigate to import data
    // navigate("/projects/" + props.data?.id + `/import/local`);
  };

  const handleSubmitUploadModal = () => {
    setIsOpenUploadGuideline(false);
    handleStepSelect("qualification_test");
  };

  const handleCancelUploadModal = () => {
    setIsOpenUploadGuideline(false);
    setOpenModal(true);
  };

  const handleSubmitContactUs = () => {
    // Todo: handle contact us
    navigate("/projects/" + props.data?.id + `/import/local`);
  }

  const handleCancelSubmitContactUs = () => {
    setShowContent(false);
    setOpenModal(true);
  }

  const handleNextStep = useCallback(() => {
    if (!isShowContent) {
      dispatch({
        type: "NEXT_STEP",
        payload: {
          step: "crowdSteps",
          data: CROWD_STEP[stepIndex + 1] as StepValues,
        },
      });
    }
  }, [isShowContent, stepIndex, dispatch]);

  // const handlePrevStep = () => {
  //   if (stepIndex > 0) {
  //     dispatch({
  //       type: "PREV_STEP",
  //       payload: {
  //         step: "crowdSteps",
  //         data: CROWD_STEP[stepIndex - 1] as StepValues,
  //       },
  //     });
  //   }
  // };

  const handleStepSelect = (step: TCrowdStepProps["currentStep"]) => {
    setActiveStep(step);
    if (step === "upload_guildline") {
      setIsOpenUploadGuideline(true);
    }
  };

  // const genStepContent = () => {
  //   switch (stepStatus) {
  //     case "create_question":
  //       return <CreateQuestion />;
  //     case "create_practical":
  //       return <CreatePractical data={props.data} />;
  //     default:
  //       return <UploadGuideline />;
  //   }
  // };

  return (
    <div className="c-content-settings">
      <div className="c-crowds m-303">
        <Suspense>
          <Modal
            title="Need a dedicated Project Manager?"
            cancelText="No"
            submitText="Yes"
            closeOnOverlayClick={false}
            open={isOpenModal}
            onSubmit={handleSubmitModal}
            onCancel={handleCancelModal}
            onClose={handleCloseCrowd}
            className="c-crowds__modal-manager"
          >
            <span>
              If you require a dedicated subject matter expert to oversee your
              project, recruit and onboard crowd annotators, and conduct their
              testing and verification, please select 'Yes'. Otherwise, choose
              'No'.
            </span>
          </Modal>
        </Suspense>
        <Suspense>
          <Modal
            title="Upload Guidline"
            cancelText="Back"
            submitText="Next"
            displayClose={false}
            closeOnOverlayClick={false}
            cancelButtonProps={{
              type: "dark",
            }}
            open={isOpenUploadGuideline}
            onSubmit={handleSubmitUploadModal}
            onCancel={handleCancelUploadModal}
            className="c-crowds__modal-upload"
          >
            <UploadGuideline />
          </Modal>
        </Suspense>
        <Suspense fallback={<AppLoading/>}>
          {isShowContent !== null && (
            <>
              {isShowContent ? (
                <Modal
                  title="Contact Us"
                  cancelText="Back"
                  submitText="Next"
                  displayClose={false}
                  closeOnOverlayClick={false}
                  cancelButtonProps={{
                    type: "dark",
                  }}
                  open={isShowContent}
                  onSubmit={handleSubmitContactUs}
                  onCancel={handleCancelSubmitContactUs}
                  className="c-contact-us__modal-contact-us"
                >
                  <ContactUs />
                </Modal>
              ) : (
                <>
                  <div className="c-crowds__breadcrumbs">
                    <CrowdSteps
                      currentStep={activeStep}
                      onSelectStep={handleStepSelect}
                    />
                  </div>
                  <CreateQuestion />
                </>
              )}
            </>
          )}
        </Suspense>
        <Suspense>
          {state.crowdSteps.stepIndex === 1 &&
            state.inCreatingQuestionProgress && (
              <div className="c-crowds__bottom-bar">
                <div className="c-crowds__total-questions">
                  Total Questions: {state.crowdSourceQuestions.length} ({" "}
                  {state.crowdSourceQuestions.reduce(
                    (total, question) => total + question.score,
                    0
                  )}{" "}
                  scores)
                </div>
                <button
                  className="c-crowds__add-question-button"
                  onClick={() => addMoreQuestion()}
                >
                  <IconPlus />
                  Add More Question
                </button>
                <button
                  className="c-crowds__complete-button"
                  onClick={handleNextStep}
                >
                  Complete
                </button>
              </div>
            )}
        </Suspense>
      </div>
      <LayoutSettings.Footer
        prevUrl={"/projects/" + props.data?.id + `/settings/workflow`}
        nextUrl={"/projects/" + props.data?.id + `/import/local`}
        onSkip={() => navigate("/projects/" + props.data?.id + `/import/local`)}
      />
    </div>
  );
};

export default Crowds;
