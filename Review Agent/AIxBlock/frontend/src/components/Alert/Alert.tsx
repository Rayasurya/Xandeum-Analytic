import React, { CSSProperties, ReactNode, useEffect } from "react";
import "./Alert.scss";


export enum AlertType {
  Default = "Default",
  Info = "Info",
  Danger = "Danger",
  Success = "Success",
  Warning = "Warning",
}

export default function Alert({ actions, title, message, dismissable, style, type = "Default", autoDismissTime }: {
  actions?: {
    label: string,
    onClick: () => void,
    useContextColor?: boolean,
    isExternal?: boolean,
  }[],
  title?: string,
  message: string | ReactNode,
  dismissable?: boolean,
  style?: CSSProperties,
  type?: "Default" | "Info" | "Danger" | "Success" | "Warning",
  autoDismissTime?: number,
}) {
  const [show, setShow] = React.useState<boolean>(true);

  useEffect(() => {
    if (autoDismissTime) {
      const timer = setTimeout(() => setShow(false), autoDismissTime);
      return () => clearTimeout(timer); // Clean up the timer on component unmount
    }
  }, [autoDismissTime]);

  const classes = React.useMemo(() => {
    const list = ["c-alert", "c-alert--" + type.toLowerCase()];

    if (dismissable) {
      list.push("c-alert--dismissable");
    }

    return list;
  }, [type, dismissable]);

  const titleNode = React.useMemo(() => {
    if (!title) {
      return null;
    }

    return <div className="c-alert__title">{title}</div>
  }, [title]);

  const messageNode = React.useMemo(() => {
    return <div className="c-alert__message">{message}</div>
  }, [message]);

  const dismissNode = React.useMemo(() => {
    if (!dismissable) {
      return null;
    }

    return (
      <div className="c-alert__dismiss" onClick={() => setShow(false)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.76773 6.99997L13.5407 11.7729L11.7729 13.5407L6.99997 8.76773L2.227 13.5407L0.459231 11.7729L5.2322 6.99997L0.459229 2.227L2.227 0.459229L6.99997 5.2322L11.7729 0.459229L13.5407 2.227L8.76773 6.99997Z"
            fill="#40405B" />
        </svg>
      </div>
    );
  }, [dismissable]);

  const actionsNode = React.useMemo(() => {
    if (!dismissable && (!actions || actions.length === 0)) {
      return null;
    }

    const actionsList = actions ? [...actions] : [];

    if (dismissable) {
      actionsList.push({
        label: "Dismiss",
        onClick: () => setShow(false),
      });
    }

    return (
      <div className="c-alert__actions">
        {
          actionsList.map((a, idx) => {
            const list = ["c-alert__actions-item"];

            if (a.useContextColor) {
              list.push("c-alert__actions-item--context");
            }

            return (
              <div key={"action-" + idx} className={list.join(" ")} onClick={() => a.onClick?.()}>
                {a.label}
                {a.isExternal &&
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.25 7.75L7.99999 1L1.25 7.75ZM7.99999 1L2 1.00001L7.99999 1ZM7.99999 1V7V1Z"
                      fill="currentColor" />
                    <path d="M1.25 7.75L7.99999 1M7.99999 1L2 1.00001M7.99999 1V7" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              </div>
            );
          })
        }
      </div>
    );
  }, [actions, dismissable]);

  if (!show) {
    return null;
  }

  return (
    <div className={classes.join(" ")} style={style}>
      <div className="c-alert__icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM9 15V13H11V15H9ZM9 5V11H11V5H9Z"
            fill="currentColor" />
        </svg>
      </div>
      {dismissNode}
      {titleNode}
      {messageNode}
      {actionsNode}
    </div>
  )
}
