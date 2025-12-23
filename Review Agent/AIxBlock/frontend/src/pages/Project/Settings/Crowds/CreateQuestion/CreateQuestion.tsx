import IconPlus from "@/assets/icons/IconPlus";
import IconQuestion from "@/assets/icons/IconQuestion";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import {
  CrowdSourceQuestion,
  useProjectContext,
} from "@/providers/ProjectProvider";
import "./CreateQuestion.scss";
import Question from "./Question";

const CreateQuestion = () => {
  const {
    state,
    setCrowdSourceQuestions,
    addMoreQuestion,
  } = useProjectContext();

  const changeQuestion = (id: number, newQuestion: CrowdSourceQuestion) => {
    const updatedQuestions = [...state.crowdSourceQuestions];
    const index = updatedQuestions.findIndex((question) => question.id === id);
    if (index !== -1) {
      updatedQuestions[index] = newQuestion;
      setCrowdSourceQuestions(updatedQuestions);
    }
  };

  return (
    <div className="c-create-question">
      <div className="c-create-question__container">
        <div className="c-create-question__header">
          <IconQuestion /> <p>Total questions: 30</p>{" "}
          <p className="c-create-question__header-high-light">(300 scores)</p>
        </div>
        <div className="c-create-question__wrapper">
          <div className="c-create-question__intro">
            <p className="c-create-question__intro__title">
              Prompt to auto create question
            </p>
            <InputBase
              type="text"
              isMultipleLine={true}
              className="c-create-question__intro__text"
              placeholder="Create a 30-question qualification test for our global crowd-based
            project, focusing on data labeling, QA, and dataset validation.
            Ensure the questions are challenging enough to require a 95% pass
            rate, with a mix of multiple-choice and scenario-based questions to
            assess comprehensive understanding of our project guidelines"
            />
            <p className="c-create-question__intro__note">
              <b>Note:</b>
              <span>
                You can easily request our AI to design a qualification test for
                your annotators using the guidelines you've uploaded by writing
                a simple prompt.
              </span>
            </p>
            <div className="c-create-question__button__wrapper">
              <Button type="dark" size="small" onClick={() => {}}>
                Back
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  console.log(state.crowdSourceQuestions);
                }}
                htmlType="submit"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="c-create-question__question-list">
        {state.crowdSourceQuestions.map((question) => (
          <Question
            key={question.id}
            id={question.id}
            question={question.question}
            questionType={question.questionType}
            answerType={question.answerType}
            answers={question.answers}
            score={question.score}
            changeQuestion={(newQuestion) =>
              changeQuestion(question.id, newQuestion)
            }
          />
        ))}
      </div>
      <div className="c-create-question__question-list-action">
        <Button
          iconPosition="left"
          icon={<IconPlus />}
          size="medium"
          onClick={addMoreQuestion}
        >
          Add New Question
        </Button>
      </div>
    </div>
  );
};

export default CreateQuestion;
