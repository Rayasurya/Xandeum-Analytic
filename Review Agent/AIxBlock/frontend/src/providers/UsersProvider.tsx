import React from "react";
import {TUserCompactModel, validateUserCompactModel} from "../models/user";
import {TApiCallResult, useApi} from "./ApiProvider";

export type TGetUserReturn = {
  user: TUserCompactModel | null,
  state: "loading" | "loaded",
}

export type TUsersProvider = {
  getUser: (id: number) => TGetUserReturn,
  users: TUserCompactModel[],
}

export const UsersContext = React.createContext<TUsersProvider>({
  getUser: (_: number) => ({user: null, state: "loading"}),
  users: [],
});

export function UsersProvider(props: React.PropsWithChildren) {
  const [users, setUsers] = React.useState<TUserCompactModel[]>([]);
  const requestedUsers = React.useRef<number[]>([]);
  const fetchingUsers = React.useRef<{ [k: number]: TApiCallResult }>({});
  const {call} = useApi();

  const getUser = React.useCallback((id: number): TGetUserReturn => {
    if (requestedUsers.current.indexOf(id) === -1) {
      const ar = call("compactUser", {params: {id: id.toString()}});
      requestedUsers.current.push(id);
      fetchingUsers.current[id] = ar;

      ar.promise
        .then(r => r.json())
        .then(r => {
          const vr = validateUserCompactModel(r);

          if (vr.isValid) {
            setUsers(a => [...a, vr.data]);
          } else {
            console.log(vr.errors);
          }
        })
        .finally(() => {
          delete fetchingUsers.current[id];
        });

      return {
        user: null,
        state: "loading",
      };
    }

    return {
      user: users.find(u => u.id === id) ?? null,
      state: Object.hasOwn(fetchingUsers.current, id) ? "loading" : "loaded",
    };
  }, [call, users]);

  React.useEffect(() => {
    return () => {
      for (let uid in fetchingUsers.current) {
        // eslint-disable-next-line
        fetchingUsers.current[uid].controller.abort();
      }
    }
  }, []);

  return <>
    <UsersContext.Provider value={{
      getUser,
      users,
    }}>
      {props.children}
    </UsersContext.Provider>
  </>;
}

export default function useUsers(): TUsersProvider {
  return React.useContext(UsersContext);
}
