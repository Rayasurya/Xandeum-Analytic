import React from "react";
import useUsers from "@/providers/UsersProvider";
import "./Index.scss";
import {TUserCompactModel} from "@/models/user";
import {useAuth} from "@/providers/AuthProvider";
import {Tooltip} from "react-tooltip";
import {colourFromString, getContrastColour} from "@/utils/colours";

export type TProps = {
  userID: number,
}

export default function CompactUser(props: TProps) {
  const {getUser, users} = useUsers();
  const [user, setUser] = React.useState<TUserCompactModel | null>(getUser(props.userID).user);
  const {user: me} = useAuth();
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setUser(getUser(props.userID).user);
  }, [getUser, props.userID, users]);

  const name = React.useMemo((): {displayName: string, initals: string} => {
    if (!user) {
      return {displayName: "User #" + props.userID, initals: "#" + props.userID};
    }

    if ((user.first_name && user.first_name.length > 0) || (user.last_name && user.last_name.length > 0)) {
      return {
        displayName: [user.first_name, user.last_name].join(" "),
        initals: [
          user.first_name ? user.first_name[0] : "",
          user.last_name ? user.last_name[0] : "",
        ].join("").toUpperCase(),
      };
    }

    if (user.username && user.username.length > 0) {
      return {
        displayName: user.username,
        initals: (user.username.length > 2 ? user.username.substring(0, 2) : user.username).toUpperCase(),
      }
    }

    return {displayName: "User #" + props.userID, initals: "#" + props.userID};
  }, [props.userID, user]);

  const eleId = React.useMemo(() => {
    return "_" + Math.random().toString().substring(2, 8);
  }, []);

  const bg = React.useMemo(() => user ? colourFromString(user.username + user.id) : "0", [user]);

  const style = React.useMemo(() => {
    return {
      backgroundImage: `linear-gradient(90deg,${bg}66,${bg})`,
      color: getContrastColour(bg),
    };
  }, [bg]);

  return (
    <>
      <span
        id={eleId}
        className={"c-compact-user " + (props.userID === me?.id ? "c-compact-user--me" : "")}
        style={{borderColor: bg}}
      >
        {user?.avatar && !imgError ? (
          <img
            className="c-compact-user__avatar url"
            src={user.avatar}
            alt={name.displayName}
            title={user?.username ?? ("User #" + user?.id)}
            style={style}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="c-compact-user__avatar text"
            title={name.displayName}
            style={style}
          >
            {name.initals}
          </div>
        )}
      </span>
      <Tooltip
        place="top"
        content={name.displayName + (props.userID === me?.id ? " ( me )" : "")}
        positionStrategy="fixed"
        anchorSelect={"#" + eleId}
      />
    </>
  );
}
