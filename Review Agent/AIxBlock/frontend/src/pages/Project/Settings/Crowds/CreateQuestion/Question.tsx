import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import IconCirclePlus from "@/assets/icons/IconCirclePlus";
import IconCopySolid from "@/assets/icons/IconCopySolid";
import IconDelete from "@/assets/icons/IconDelete";
import IconRemove from "@/assets/icons/IconRemove";
import Button from "@/components/Button/Button";
import Checkbox from "@/components/Checkbox/Checkbox";
import InputBase from "@/components/InputBase/InputBase";
import Radio from "@/components/Radio/Radio";
import Select, { SelectOption } from "@/components/Select/Select";
import Upload from "@/components/Upload/Upload";
import {
  CrowdSourceAnswer,
  CrowdSourceQuestion,
  useProjectContext,
} from "@/providers/ProjectProvider";
import "./CreateQuestion.scss";

const QUESTION_TYPES = [{ label: "Paragraph", value: "paragraph" }];
const ANSWER_TYPES = [
  { label: "Text", value: "text" },
  { label: "Select One", value: "select-one" },
  { label: "Multiple Choice", value: "multiple-choice" },
  { label: "Upload", value: "upload" },
];

type TQuestionProps = CrowdSourceQuestion & {
  changeQuestion: (newQuestion: CrowdSourceQuestion) => void;
};

const Question: React.FC<TQuestionProps> = ({
  id,
  score,
  questionType,
  question,
  answerType,
  answers,
  changeQuestion,
}) => {
  const { deleteQuestion, duplicateQuestion } = useProjectContext();
  const [valueScore, setValueScore] = useState(score);
  const [valueQuestionType, setValueQuestionType] = useState(questionType);
  const [valueQuestion, setValueQuestion] = useState(question);
  const [valueAnswerType, setValueAnswerType] = useState(answerType);
  const [valueAnswer, setValueAnswer] = useState(answers);

  //todo: improve
  useEffect(() => {
    changeQuestion({
      id,
      score: valueScore,
      questionType: valueQuestionType,
      question: valueQuestion,
      answerType: valueAnswerType,
      answers: valueAnswer,
    });
  }, [
    valueScore,
    valueQuestionType,
    valueQuestion,
    valueAnswerType,
    valueAnswer,
  ]);

  const defaultQuestionTypeValue: SelectOption = useMemo(() => {
    return (
      QUESTION_TYPES.find((c) => c.value === questionType) ?? {
        label: "",
        value: "",
      }
    );
  }, [valueQuestionType]);

  const defaultAnswerTypeValue: SelectOption = useMemo(() => {
    return (
      ANSWER_TYPES.find((c) => c.value === answerType) ?? {
        label: "",
        value: "",
      }
    );
  }, [valueAnswerType]);

  const handleChangeScore = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValueScore(Number(e.target.value));
    },
    [setValueScore]
  );

  const handleChangeQuestion = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValueQuestion(e.target.value);
    },
    [setValueQuestion]
  );

  const handleChangeQuestionType = useCallback(
    (e: SelectOption) => {
      setValueQuestionType(e.value as TQuestionProps["questionType"]);
    },
    [setValueQuestionType]
  );

  const handleChangeAnswerType = useCallback(
    (e: SelectOption) => {
      const option = e.value as TQuestionProps["answerType"];
      setValueAnswerType(option);
      setValueAnswer(
        option === "text" || option === "upload"
          ? [
              {
                id: new Date().getTime(),
                text: "",
                isCorrect: true,
              },
            ]
          : []
      );
    },
    [setValueAnswerType]
  );

  const onAddNewAnswer = useCallback(() => {
    setValueAnswer((answers) =>
      answers.concat([
        { id: new Date().getTime(), text: "Your Answer", isCorrect: false },
      ])
    );
  }, [setValueAnswer]);

  const onChangeAnswerValue = useCallback(
    (
      valueAnswerType: TQuestionProps["answerType"],
      value: CrowdSourceAnswer
    ) => {
      if (valueAnswerType === "select-one") {
        setValueAnswer((answers) =>
          answers.map((answer) => ({
            ...answer,
            text: answer.id === value.id ? value.text : answer.text,
            isCorrect: answer.id === value.id ? value.isCorrect : false,
          }))
        );
      } else {
        setValueAnswer((answers) =>
          answers.map((answer) => {
            if (answer.id === value.id) {
              return {
                id: value.id,
                text: value.text,
                isCorrect: value.isCorrect,
              };
            } else {
              return answer;
            }
          })
        );
      }
    },
    [setValueAnswer]
  );

  const onRemoveAnswerValue = useCallback(
    (id: number | string) => {
      setValueAnswer((answers) => answers.filter((answer) => answer.id !== id));
    },
    [setValueAnswer]
  );

  const renderValueAnswerType = useCallback(() => {
    if (valueAnswerType === "text") {
      return (
        <InputBase
          label="Your Answer"
          value={valueAnswer?.[0].text}
          isMultipleLine={true}
          onChange={(e) => {
            const item = valueAnswer?.[0];
            onChangeAnswerValue(valueAnswerType, {
              ...item,
              text: e.target.value,
            });
          }}
        />
      );
    }
    if (valueAnswerType === "select-one") {
      return (
        <div className="c-question-item__question-list">
          {valueAnswer.map((item) => {
            return (
              <div className="c-question-item--checkbox">
                <div className="c-question-item--checkbox__label-wrapper">
                  <Radio
                    label={""}
                    size="sm"
                    checked={item.isCorrect}
                    onChange={(e) => {
                      onChangeAnswerValue(valueAnswerType, {
                        ...item,
                        isCorrect: e,
                      });
                    }}
                  />
                  <InputBase
                    value={item.text}
                    className="c-checkbox__label"
                    onChange={(e) => {
                      onChangeAnswerValue("text", {
                        ...item,
                        text: e.target.value,
                      });
                    }}
                  />
                </div>
                <Button
                  className="c-question-item--btn-remove"
                  size="small"
                  type="white"
                  icon={<IconRemove />}
                  onClick={() => {
                    onRemoveAnswerValue(item.id);
                  }}
                />
              </div>
            );
          })}
          <div className="c-question-item--checkbox--action">
            <Button
              size="small"
              type="white"
              icon={<IconCirclePlus />}
              onClick={onAddNewAnswer}
            />
          </div>
        </div>
      );
    }
    if (valueAnswerType === "multiple-choice") {
      return (
        <div className="c-question-item__question-list">
          {valueAnswer.map((item) => {
            return (
              <div className="c-question-item--checkbox">
                <div className="c-question-item--checkbox__label-wrapper">
                  <Checkbox
                    label={""}
                    size="sm"
                    checked={item.isCorrect}
                    onChange={(e) => {
                      onChangeAnswerValue(valueAnswerType, {
                        ...item,
                        isCorrect: e,
                      });
                    }}
                  />
                  <InputBase
                    value={item.text}
                    className="c-checkbox__label"
                    onChange={(e) => {
                      onChangeAnswerValue(valueAnswerType, {
                        ...item,
                        text: e.target.value,
                      });
                    }}
                  />
                </div>
                <Button
                  className="c-question-item--btn-remove"
                  size="small"
                  type="white"
                  icon={<IconRemove />}
                  onClick={() => {
                    onRemoveAnswerValue(item.id);
                  }}
                />
              </div>
            );
          })}
          <div className="c-question-item--checkbox--action">
            <Button
              size="small"
              type="white"
              icon={<IconCirclePlus />}
              onClick={onAddNewAnswer}
            />
          </div>
        </div>
      );
    }
    if (valueAnswerType === "upload") {
      return (
        <Upload
          describe="JPG, GIF or PNG. Max size of 800K"
          onUpload={(_data, base64) => {
            const item = valueAnswer?.[0];
            onChangeAnswerValue(valueAnswerType, {
              ...item,
              text: base64,
            });
          }}
        />
      );
    }
    return <></>;
  }, [valueAnswerType, valueAnswer, onAddNewAnswer]);

  return (
    <div className="c-question-item">
      <InputBase
        label="Score"
        className="c-question-item--score"
        value={valueScore.toString()}
        onChange={handleChangeScore}
      />
      <div className="c-question-item__spacer" />
      <Select
        defaultValue={defaultQuestionTypeValue}
        label="Type Question"
        data={[{ label: "Type Question", options: QUESTION_TYPES }]}
        onChange={handleChangeQuestionType}
      />
      <InputBase
        label="Question"
        type="text"
        isMultipleLine={true}
        value={valueQuestion}
        onChange={handleChangeQuestion}
      />
      <div className="c-question-item__spacer" />
      <Select
        defaultValue={defaultAnswerTypeValue}
        label="Type Answer"
        data={[{ label: "Type Answer", options: ANSWER_TYPES }]}
        onChange={handleChangeAnswerType}
      />
      <div className="c-question-item__question-list">
        {renderValueAnswerType()}
      </div>
      <div className="c-question-item__spacer" />
      <div className="c-question-item__action">
        <Button
          size="small"
          type="white"
          iconPosition="left"
          icon={<IconCopySolid />}
          onClick={() => duplicateQuestion(id)}
        >
          Duplicate
        </Button>
        <Button
          size="small"
          type="hot"
          iconPosition="left"
          icon={<IconDelete width={18} height={18} />}
          className="c-question-item__delete-button"
          onClick={() => deleteQuestion(id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default Question;
