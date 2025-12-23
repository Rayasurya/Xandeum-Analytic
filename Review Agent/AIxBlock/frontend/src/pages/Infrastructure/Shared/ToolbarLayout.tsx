import React, {useMemo} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import styles from "./ToolbarLayout.module.scss";
import {TTab} from "../Tabs";

export type TProps = {
  buttons?: TTab[];
  urlPrefix: string;
  rightContent?: React.ReactNode;
}

export default function ToolbarLayout({children, buttons, urlPrefix, rightContent}: React.PropsWithChildren<TProps>) {
  const navigate = useNavigate();
  const location = useLocation();
  const parts = useMemo(() => location.pathname.split("/"), [location.pathname]);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div>
          {buttons?.map(item => (
            <span
              className={[
                styles.navItem,
                (item.urlKey.length > 0 ? location.pathname.startsWith(urlPrefix + item.urlKey) : (parts?.[3] ?? "") === item.urlKey) ? styles.navItemActive : "",
              ].join(" ")}
              onClick={() => navigate(urlPrefix + item.urlKey)}
              key={"toolbar-item-" + item.urlKey}
            >
              {item.label}
            </span>
          ))}
        </div>
        <div className={styles.rightContent}>
          {rightContent}
        </div>
      </div>
      {children}
    </div>
  );
}
