import React, { createContext, useMemo, useReducer, useState } from "react";
import { SETUP_STEPS } from "../constants/projectConstants";
import { TProjectModel } from "../models/project";
import { useApi } from "./ApiProvider";
import { useLocation, useParams } from "react-router-dom";
import { infoDialog } from "../components/Dialog";
import { isCreateStep } from "../pages/Project/Settings/LayoutSettings/utils";

export type ProjectSteps = "set_up" | "import_data" | "create_done";
export type SetupValueSteps =
  | "general"
  | "ml"
  | "cloud_storage"
  | "setup_compute"
  | "webhooks"
  | "labels"
  | "members"
  | "workflow"
  | "crowdsource";

export type CrowdValueSteps =
  | "upload_guide"
  | "create_question"
  | "create_practical";

export type ImportValueSteps = "local" | "cloud" | "internet" | "contact_us";

export type CrowdSourceAnswer = {
  id: number | string;
  text: string;
  isCorrect: boolean;
};

export type CrowdSourceQuestion = {
  id: number;
  score: number;
  questionType: "paragraph";
  question: string;
  answerType: "text" | "select-one" | "multiple-choice" | "upload";
  answers: CrowdSourceAnswer[];
};

export type StepInit = {
  stepIndex: number;
  maxSteps?: number;
};
export interface ParentStepValue extends StepInit {
  stepStatus: ProjectSteps;
}
export interface StepValues extends StepInit {
  stepTitle?: string;
  stepStatus: SetupValueSteps | CrowdValueSteps | ImportValueSteps;
}

export type StepSwitcher =
  | "setUpSteps"
  | "crowdSteps"
  | "importSteps"
  | "steps";

export type PayloadAction = {
  step: StepSwitcher;
  data: StepValues;
};

export type Action =
  | {
      type: "SWITCH_STEP";
      payload: PayloadAction;
    }
  | {
      type: "NEXT_STEP";
      payload: PayloadAction;
    }
  | {
      type: "PREV_STEP";
      payload: PayloadAction;
    }
  | { type: "UPDATE_DATA_PROJECT"; payload: TProjectModel }
  | { type: "SET_IMPORTED_FILES"; payload: { data: Object } }
  | { type: "SET_IS_IMPORTING"; payload: boolean }
  | { type: "SET_UPLOADED_FILES"; payload: { data: Object } }
  | { type: "SET_ERROR"; payload: Object }
  | { type: "SET_IS_SYNCING"; payload: boolean }
  | { type: "SET_STORAGE_ID"; payload: number }
  | { type: "SET_CROWD_SOURCE_QUESTIONS"; payload: CrowdSourceQuestion[] }
  | { type: "SET_IN_CREATING_QUESTION_PROGRESS"; payload: boolean };

type Empty = Record<string, never>;

type ImportedFiles = {
  name: string;
  status: string;
  error: string;
  detail: string;
}[];

type State = {
  dataProject: TProjectModel | Empty;
  steps: ParentStepValue;
  setUpSteps: StepValues;
  crowdSteps: StepValues;
  importSteps: StepValues;
  importedFiles: ImportedFiles;
  isImporting: boolean;
  uploadedFiles: ImportedFiles;
  error: String;
  isSyncing: boolean;
  storageId: Number;
  crowdSourceQuestions: CrowdSourceQuestion[];
  inCreatingQuestionProgress: boolean;
};

const initialState: State = {
  dataProject: {},
  steps: {
    stepIndex: 0,
    stepStatus: "set_up",
    maxSteps: 0,
  },
  setUpSteps: {
    stepIndex: 0,
    stepTitle: "General",
    stepStatus: "general",
    maxSteps: 0,
  },
  crowdSteps: {
    stepIndex: 0,
    stepTitle: "General",
    stepStatus: "upload_guide",
    maxSteps: 0,
  },
  importSteps: {
    stepIndex: 0,
    stepTitle: "Local upload",
    stepStatus: "local",
    maxSteps: 0,
  },
  importedFiles: [],
  isImporting: false,
  uploadedFiles: [],
  error: "",
  isSyncing: false,
  storageId: 0,
  crowdSourceQuestions: [
    {
      id: 1,
      score: 10,
      question: "Lorem ipsum dolor, adipiscing elit?",
      questionType: "paragraph",
      answerType: "text",
      answers: [
        {
          id: 1,
          text: "ipsum dolor sit amet",
          isCorrect: true,
        },
      ],
    },
    {
      id: 2,
      score: 10,
      question: "Lorem ipsum dolor, adipiscing elit?",
      questionType: "paragraph",
      answerType: "multiple-choice",
      answers: [
        {
          id: 1,
          text: "ipsum dolor sit amet",
          isCorrect: true,
        },
        {
          id: 2,
          text: "ipsum dolor sit amet",
          isCorrect: true,
        },
        {
          id: 3,
          text: "ipsum dolor sit amet",
          isCorrect: true,
        },
        {
          id: 4,
          text: "ipsum dolor sit amet",
          isCorrect: false,
        },
      ],
    },
    {
      id: 3,
      score: 10,
      question: "Lorem ipsum dolor, adipiscing elit?",
      questionType: "paragraph",
      answerType: "upload",
      answers: [
        {
          id: 1,
          text: "ipsum dolor sit amet",
          isCorrect: true,
        },
      ],
    },
    {
      id: 4,
      score: 10,
      question: "Lorem ipsum dolor, adipiscing elit?",
      questionType: "paragraph",
      answerType: "select-one",
      answers: [
        {
          id: 1,
          text: "ipsum dolor sit amet",
          isCorrect: true,
        },
        {
          id: 2,
          text: "ipsum dolor sit amet",
          isCorrect: false,
        },
        {
          id: 3,
          text: "ipsum dolor sit amet",
          isCorrect: false,
        },
        {
          id: 4,
          text: "ipsum dolor sit amet",
          isCorrect: false,
        },
      ],
    },
  ],
  inCreatingQuestionProgress: false,
};

const getNextStep = (state: State, action: Action) => {
  if (action.type === "NEXT_STEP") {
    const { data } = action.payload;
    const nextStepIndex = data.stepIndex;

    if (
      nextStepIndex > SETUP_STEPS.length - 1 &&
      state.steps.stepStatus === "set_up"
    ) {
      const currentStep = state.steps.stepIndex + 1;
      return {
        stepIndex: currentStep,
        maxSteps: currentStep,
        stepStatus: "import_data" as ProjectSteps,
      };
    }
  }
  return state.steps;
};

const getMaxStep = (state: State, action: Action) => {
  if (action.type === "NEXT_STEP" || action.type === "PREV_STEP") {
    const currentStep = (
      action.payload.step === "setUpSteps"
        ? state.setUpSteps.maxSteps
        : state.importSteps.maxSteps
    ) as number;
    return Math.max(currentStep, action.payload.data.stepIndex);
  }
  if (action.type === "SWITCH_STEP") {
    const { payload } = action;
    return Math.max(state.steps.maxSteps as number, payload.data.stepIndex);
  }
};

const resetStep = (state: State, action?: Action) => {
  if (state.steps.stepIndex === 1) {
    return {
      ...state,
      steps: {
        stepIndex: 0,
        stepStatus: "set_up",
        maxSteps: state.steps.maxSteps,
      },
      crowdSteps: {
        stepIndex: 0,
        stepTitle: "General",
        stepStatus: "upload_guide",
        maxSteps: 0,
      },
    };
  } else {
    return state;
  }
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SWITCH_STEP":
      return {
        ...state,
        [action.payload.step]: {
          ...action.payload.data,
          maxSteps: getMaxStep(state, action),
        },
      };
    case "NEXT_STEP":
      return {
        ...state,
        [action.payload.step]: {
          ...action.payload.data,
          maxSteps: getMaxStep(state, action),
        },
        steps: getNextStep(state, action),
      };
    case "PREV_STEP":
      const data = resetStep(state, action) as State;
      return {
        ...data,
        [action.payload.step]: {
          ...action.payload.data,
          maxSteps: getMaxStep(state, action),
        },
      };
    case "UPDATE_DATA_PROJECT":
      return {
        ...state,
        dataProject: action.payload,
      };
    case "SET_IMPORTED_FILES":
      return {
        ...state,
        importedFiles: [
          ...state.importedFiles,
          action.payload.data,
        ] as unknown as ImportedFiles,
      };
    case "SET_IS_IMPORTING":
      return {
        ...state,
        isImporting: action.payload,
      };
    case "SET_UPLOADED_FILES":
      return {
        ...state,
        uploadedFiles: [
          ...state.uploadedFiles,
          action.payload.data,
        ] as unknown as ImportedFiles,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload as any,
      };
    case "SET_IS_SYNCING":
      return {
        ...state,
        isSyncing: action.payload,
      };
    case "SET_STORAGE_ID":
      return {
        ...state,
        storageId: action.payload,
      };
    case "SET_CROWD_SOURCE_QUESTIONS":
      return {
        ...state,
        crowdSourceQuestions: action.payload,
      };
    case "SET_IN_CREATING_QUESTION_PROGRESS":
      return {
        ...state,
        inCreatingQuestionProgress: action.payload,
      };
    default:
      return state;
  }
};

type TProjectProvider = {
  state: State;
  dispatch: React.Dispatch<Action>;
  validateSteps: () => boolean;
  importFiles: (uploadedFiles: any) => void;
  syncStorage: (opts: any) => Promise<boolean>;
  isCreatingProject: boolean;
  setCrowdSourceQuestions: (questions: CrowdSourceQuestion[]) => void;
  addMoreQuestion: () => void;
  deleteQuestion: (questionId: number) => void;
  duplicateQuestion: (questionId: number) => void;
  enableCreatingQuestionMode: () => void;
  newValue: any;
  setNewValue: (value: any) => void;
};

const ProjectContext = createContext<TProjectProvider | undefined>(undefined);

const emptyQuestion = {
  question: "",
  questionType: "paragraph",
  answerType: "text",
  answers: [{ id: new Date().getTime(), text: "", isCorrect: true }],
  score: 0,
};

interface ProjectProviderProps {
  children: React.ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const params = useParams();
  const projectId = params.projectID;
  const location = useLocation();
  const isCreatingProject = useMemo(() => isCreateStep(location), [location]);
  const api = useApi();
  const [newValue, setNewValue] = useState("raw_data");

  const importFiles = async (uploadedFiles: any) => {
    try {
      const query = { commit_to_project: "false" };
      dispatch({ type: "SET_ERROR", payload: false });

      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type_import", newValue);
        dispatch({ type: "SET_UPLOADED_FILES", payload: { data: file.name } });

        const response = await api.call("importFiles", {
          params: { id: projectId || "", ...query },
          body: formData,
        }).promise;

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          dispatch({
            type: "SET_IMPORTED_FILES",
            payload: { data: { name: file.name, status: "success" } },
          });
          dispatch({ type: "SET_IS_IMPORTING", payload: true });
        } else {
          console.error(
            "Failed to import files. Please try again status:",
            response.status
          );
          const error = await response.json();
          dispatch({
            type: "SET_IMPORTED_FILES",
            payload: {
              data: {
                name: file.name,
                status: "fail",
                error: error,
                detail: error.detail,
              },
            },
          });
          dispatch({ type: "SET_IS_IMPORTING", payload: true });
        }
      }
    } catch (e) {
      if (window.APP_SETTINGS.debug) {
        console.error(e);
      }
      dispatch({ type: "SET_ERROR", payload: "An error occurred" });
      dispatch({ type: "SET_IS_IMPORTING", payload: false });
    }
  };

  const syncStorage = async (params: any) => {
    let result = false;
    dispatch({ type: "SET_IS_SYNCING", payload: true });
    dispatch({ type: "SET_STORAGE_ID", payload: params.id });
    const formData = new FormData();
    formData.append("type_import", newValue);

    const response = await api.call(
      params.target === "source" ? "importStorage" : "exportStorage",
      {
        params: {
          type: params.type,
          pk: params.id,
        },
        body: formData,
      }
    ).promise;

    if (response.ok) {
      // const data = await response.json();
      // console.log(data);
      // TODO: Handle the data
      setTimeout(() => {
        infoDialog({ message: "Sync storage successful!" });
      }, 0);

      result = true;
    } else {
      const error = await response.json();

      if (window.APP_SETTINGS.debug) {
        console.error("Failed to sync storage. Please try again status:", response.status);
        console.log(error);
      }

      setTimeout(() => {
        infoDialog({ message: "Failed to sync storage. Please try again." });
      }, 0);
    }

    dispatch({ type: "SET_IS_SYNCING", payload: false });
    dispatch({ type: "SET_STORAGE_ID", payload: 0 });
    return result;
  };

  const setCrowdSourceQuestions = (questions: CrowdSourceQuestion[]) => {
    dispatch({ type: "SET_CROWD_SOURCE_QUESTIONS", payload: questions });
  };

  const addMoreQuestion = () => {
    const newQuestionId = new Date().getTime();
    dispatch({
      type: "SET_CROWD_SOURCE_QUESTIONS",
      payload: [
        ...state.crowdSourceQuestions,
        { ...emptyQuestion, id: newQuestionId } as CrowdSourceQuestion,
      ],
    });
  };

  const deleteQuestion = (questionId: number) => {
    const updatedQuestions = state.crowdSourceQuestions.filter(
      (question) => question.id !== questionId
    );

    dispatch({
      type: "SET_CROWD_SOURCE_QUESTIONS",
      payload: updatedQuestions,
    });
  };

  const duplicateQuestion = (questionId: number) => {
    const currentQuestion = state.crowdSourceQuestions.find(
      (question) => question.id === questionId
    );
    let newQuestion = {
      ...emptyQuestion,
      id: new Date().getTime(),
    } as CrowdSourceQuestion;

    if (currentQuestion) {
      newQuestion = {
        ...currentQuestion,
        id: new Date().getTime(),
      };
    }

    dispatch({
      type: "SET_CROWD_SOURCE_QUESTIONS",
      payload: state.crowdSourceQuestions.concat([newQuestion]),
    });
  };

  const enableCreatingQuestionMode = () => {
    dispatch({
      type: "SET_IN_CREATING_QUESTION_PROGRESS",
      payload: true,
    });
  };

  const validateSteps = (): boolean => {
    // Todo: logic to validate steps
    return true;
  };

  const contextValue: TProjectProvider = {
    state,
    dispatch,
    validateSteps,
    importFiles,
    syncStorage,
    isCreatingProject,
    setCrowdSourceQuestions,
    addMoreQuestion,
    deleteQuestion,
    duplicateQuestion,
    enableCreatingQuestionMode,
    newValue, // Thêm newValue vào contextValue
    setNewValue, 
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = React.useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
};
