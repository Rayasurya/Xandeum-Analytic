import Alert from "../components/Alert/Alert";
import React, {CSSProperties, ReactNode} from "react";

export function createAlert(
  error: ReactNode | string | null,
  onRetry?: () => void,
  dismissable?: boolean,
  style?: CSSProperties,
) {
  if (!error) {
    return null;
  }

  return (
    <Alert
      dismissable={dismissable}
      message={error}
      type="Danger"
      style={style}
      actions={onRetry ? [
        {label: "Try again", useContextColor: true, onClick: onRetry}
      ] : []}
    />
  );
}

export function createAlertSuccess(
  message: ReactNode | string | null,
  dismissable: boolean = true,
  style?: CSSProperties,
) {
  if (!message) {
    return null;
  }

  return (
    <Alert
      dismissable={dismissable}
      message={message}
      type="Success"
      style={style}
    />
  );
}

export function createAlertInfo(
  message: ReactNode | string | null,
  dismissable: boolean = true,
  style?: CSSProperties,
) {
  if (!message) {
    return null;
  }

  return (
    <Alert
      dismissable={dismissable}
      message={message}
      type="Info"
      style={style}
    />
  );
}
