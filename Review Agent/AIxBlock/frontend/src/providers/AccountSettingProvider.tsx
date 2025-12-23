import React, { createContext, useReducer } from "react";
import { useApi } from "./ApiProvider";
import { TUserModel } from "../models/user";
import { useAuth } from "./AuthProvider";
import {usePromiseLoader} from "./LoaderProvider";
import { infoDialog } from "../components/Dialog";
import {randomUsername} from "../utils/random";

export type Data = {
  accountInfo: any[];
  dataImport: any[];
  mlData: any[];
  organization: any[];
  project: any[];
  tasks: any[];
  report: any[];
  users: any[];
  token: any[];
};

export type accountSettingState = {
  data: Data;
  last_updated_at: number;
};

const initialState: accountSettingState = {
  data: {
    accountInfo: [],
    dataImport: [],
    mlData: [],
    organization: [],
    project: [],
    tasks: [],
    report: [],
    users: [],
    token: [],
  },
  last_updated_at: 0,
};

type ActionTypes = {
  SET_ACCOUNT_INFO: string;
  SET_DATA_IMPORT: string;
  SET_ML_DATA: string;
  SET_ORGANIZATION: string;
  SET_PROJECT: string;
  SET_TASKS: string;
  SET_REPORT: string;
  SET_USERS: string;
  SET_TOKEN: string;
};

const actionTypes: ActionTypes = {
  SET_ACCOUNT_INFO: "SET_ACCOUNT_INFO",
  SET_DATA_IMPORT: "SET_DATA_IMPORT",
  SET_ML_DATA: "SET_ML_DATA",
  SET_ORGANIZATION: "SET_ORGANIZATION",
  SET_PROJECT: "SET_PROJECT",
  SET_TASKS: "SET_TASKS",
  SET_REPORT: "SET_REPORT",
  SET_USERS: "SET_USERS",
  SET_TOKEN: "SET_TOKEN",
};

type State = typeof initialState;

type Action =
  | { type: ActionTypes["SET_ACCOUNT_INFO"]; payload: { data: Object } }
  | { type: ActionTypes["SET_DATA_IMPORT"]; payload: { data: Object } }
  | { type: ActionTypes["SET_ML_DATA"]; payload: { data: Object } }
  | { type: ActionTypes["SET_ORGANIZATION"]; payload: { data: Object } }
  | { type: ActionTypes["SET_PROJECT"]; payload: { data: Object } }
  | { type: ActionTypes["SET_TASKS"]; payload: { data: Object } }
  | { type: ActionTypes["SET_REPORT"]; payload: { data: Object } }
  | { type: ActionTypes["SET_USERS"]; payload: { data: Object } }
  | { type: ActionTypes["SET_TOKEN"]; payload: { data: Object } };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.SET_ACCOUNT_INFO:
      return {
        ...state,
        data: {
          ...state.data,
          accountInfo: [action.payload.data],
        },
        last_updated_at: new Date().getTime(),
      };
    case actionTypes.SET_DATA_IMPORT:
      return {
        ...state,
        data: {
          ...state.data,
          dataImport: [action.payload.data],
        },
        last_updated_at: new Date().getTime(),
      };
    case actionTypes.SET_ML_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          mlData: [action.payload.data],
        },
        last_updated_at: new Date().getTime(),
      };
    case actionTypes.SET_ORGANIZATION:
      return {
        ...state,
        data: {
          ...state.data,
          organization: [action.payload.data],
        },
        last_updated_at: new Date().getTime(),
      };
    case actionTypes.SET_PROJECT:
      return {
        ...state,
        data: {
          ...state.data,
          project: [action.payload.data],
        },
        last_updated_at: new Date().getTime(),
      };
    case actionTypes.SET_TASKS:
      return {
        ...state,
        data: {
          ...state.data,
          tasks: [action.payload.data],
        },
        last_updated_at: new Date().getTime(),
      };
    case actionTypes.SET_REPORT:
      return {
        ...state,
        data: {
          ...state.data,
          report: [action.payload.data],
        },
        last_updated_at: new Date().getTime(),
      };
    case actionTypes.SET_USERS:
      return {
        ...state,
        data: {
          ...state.data,
          users: [action.payload.data],
        },
        last_updated_at: new Date().getTime(),
      };
    case actionTypes.SET_TOKEN:
      return {
        ...state,
        data: {
          ...state.data,
          token: [action.payload.data],
        },
        last_updated_at: new Date().getTime(),
      };
    default:
      return state;
  }
};

type TAccountSettingProvider = {
  state: State;
  dispatch: React.Dispatch<Action>;
  validateSteps: () => boolean;
  fetchDataImport: (data: Object) => void;
  fetchMLData: (data: Object) => void;
  fetchOrganization: (data: Object) => void;
  fetchProject: (data: Object) => void;
  fetchTasks: (data: Object) => void;
  fetchReport: (data: Object) => void;
  fetchUsers: (data: Object) => void;
  resetToken: (data: Object) => void;
  updateUser: (data: TUserModel, avatar?: FileList) => void;
  getUserToken: (data: Object) => void;
};

const AccountSettingContext = createContext<
  TAccountSettingProvider | undefined
>(undefined);

interface AccountSettingProviderProps {
  children: React.ReactNode;
}

export const AccountSettingProvider: React.FC<AccountSettingProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { refreshUser } = useAuth();
  const api = useApi();
  const { addPromise } = usePromiseLoader();
  const isLoadingToken = React.useRef(false);

  const validateSteps = (): boolean => {
    // Todo: logic to validate steps
    return true;
  };

  const fetchDataImport = (data: Object) => ({
    type: actionTypes.SET_DATA_IMPORT,
    payload: { data },
  });

  const fetchMLData = (data: Object) => ({
    type: actionTypes.SET_ML_DATA,
    payload: { data },
  });

  const fetchOrganization = (data: Object) => ({
    type: actionTypes.SET_ORGANIZATION,
    payload: { data },
  });

  const fetchProject = (data: Object) => ({
    type: actionTypes.SET_PROJECT,
    payload: { data },
  });

  const fetchTasks = (data: Object) => ({
    type: actionTypes.SET_TASKS,
    payload: { data },
  });

  const fetchReport = (data: Object) => ({
    type: actionTypes.SET_REPORT,
    payload: { data },
  });

  const fetchUsers = (data: Object) => ({
    type: actionTypes.SET_USERS,
    payload: { data },
  });

  const resetToken = async () => {
    try {
      const ar = api.call("resetToken");
      addPromise(ar.promise, "Resetting access token...");
      const response = await ar.promise;

      if (response.ok) {
        const token = await response.json();
        dispatch({ type: actionTypes.SET_TOKEN, payload: { data: { token } } });
      } else {
        console.error(
          "Reset token request failed with status:",
          response.status
        );
      }
    } catch (e) {
      if (window.APP_SETTINGS.debug) {
        console.error(e);
      }
    }
  };

  const updateUser = async (data: TUserModel, avatar?: FileList) => {
    try {
      const promises = [
        api.call("updateUser", {
          params: { id: data.id.toString() },
          body: (data.username?.length ?? 0) > 0 ? data : {...data, username: randomUsername()},
        }).promise,
      ];

      addPromise(promises[0], "Updating profile...");

      if (avatar) {
        const avatarForm = new FormData();

        if (avatar?.length > 0) {
          avatarForm.append("avatar", avatar[0]);
        }

        promises.push(
          api.call("updateUserAvatar", {
            params: { id: data.id.toString() },
            body: avatarForm,
          }).promise
        );

        addPromise(promises[1], "Updating avatar...");
      }

      const responses = await Promise.all(promises);
      const messages = [];
      let refresh = false;

      if (responses[0].ok) {
        messages.push("User's information has been updated successfully.");
        refresh = true;
      } else {
        messages.push(
          "Failed to update user's information. Response status: " +
            responses[0].status
        );
      }

      if (!responses[1].ok) {
        try {
          const res = await responses[1].json();
          messages.push(res.join(". "));
        } catch {
          messages.push(
            "Failed to update user's avatar. Response status: " +
              responses[1].status
          );
        }
      } else {
        refresh = true;
      }

      if (messages.length > 0) {
        infoDialog({ message: messages.join("\n") });
      }

      if (refresh) {
        refreshUser();
      }
    } catch (e) {
      if (window.APP_SETTINGS.debug) {
        console.error(e);
      }
    }
  };

  const getUserToken = async () => {
    if(isLoadingToken.current) return;
    isLoadingToken.current = true;
    try {
      const ar = api.call("getUserToken");
      addPromise(ar.promise, "Getting access token...");
      const response = await ar.promise;
      if (response.ok) {
        const token = await response.json();
        dispatch({ type: actionTypes.SET_TOKEN, payload: { data: { token } } });
      } else {
        console.error(
          "Get user token request failed with status:",
          response.status
        );
      }
    } catch (e) {
      if (window.APP_SETTINGS.debug) {
        console.error(e);
      }
    }
    isLoadingToken.current = false;
  };

  const contextValue: TAccountSettingProvider = {
    state,
    dispatch,
    validateSteps,
    fetchDataImport,
    fetchMLData,
    fetchOrganization,
    fetchProject,
    fetchTasks,
    fetchReport,
    fetchUsers,
    resetToken,
    updateUser,
    getUserToken,
  };

  return (
    <AccountSettingContext.Provider value={contextValue}>
      {children}
    </AccountSettingContext.Provider>
  );
};

export const useAccountSettingContext = () => {
  const context = React.useContext(AccountSettingContext);

  if (!context) {
    throw new Error(
      "useAccountSettingContext must be used within an AccountSettingProvider"
    );
  }

  return context;
};
