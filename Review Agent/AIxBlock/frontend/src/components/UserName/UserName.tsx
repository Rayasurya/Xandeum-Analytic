import React from "react";
import useUsers from "@/providers/UsersProvider";
import {TUserCompactModel} from "@/models/user";
import {getDisplayName} from "@/utils/user";

export type TProps = {
  userID: number,
}

export default function UserName(props: TProps) {
  const {getUser, users} = useUsers();
  const [user, setUser] = React.useState<TUserCompactModel | null>(getUser(props.userID).user);

  React.useEffect(() => {
    setUser(getUser(props.userID).user);
  }, [getUser, props.userID, users])


  const displayName = React.useMemo(() => {
    if (!user) {
      return "#" + props.userID;
    }

    return getDisplayName(user);
  }, [props.userID, user]);

  return <>{displayName}</>;
}
