import Modal from "../Modal/Modal";
import {createRoot} from "react-dom/client";
import React from "react";
import {highestZIndex} from "@/utils/zIndex";


type MessageContent = React.ReactNode | string | string[];
type MessageFunction = () => MessageContent;


type DialogProps = {
  message: MessageContent | MessageFunction;
  title?: string | React.ReactNode;
  iconTitle?: JSX.Element;
  submitText?: string;
  cancelText?: string | null;
  className?: string;
  closeOnOverlayClick?: boolean;
  displayClose?: boolean;
  onSubmit?: () => any | Promise<any>;
  onCancel?: (ref?: React.RefObject<HTMLDivElement> | null) => void;
  style?: React.CSSProperties;
};

const createModal = ({
  message,
  title,
  iconTitle,
  submitText,
  cancelText,
  className,
  closeOnOverlayClick,
  displayClose,
  onSubmit,
  onCancel,
}: DialogProps) => {
  const rootDiv = document.createElement("div");
  document.body.appendChild(rootDiv);
  const root = createRoot(rootDiv);

  const closeModal = () => {
    root.unmount();
    rootDiv.remove();
  };

  const renderMessage = () => {
    if (typeof message === 'function') {
      const messageContent = message();
      return Array.isArray(messageContent) ? (
        <ul>
          {messageContent.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      ) : (
        messageContent
      );
    } else {
      return Array.isArray(message) ? (
        <ul>
          {message.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      ) : (
        message
      );
    }
  };

  root.render(
    <Modal
      title={title}
      iconTitle={iconTitle}
      open={true}
      submitText={submitText}
      cancelText={cancelText}
      className={className}
      closeOnOverlayClick={closeOnOverlayClick}
      displayClose={displayClose}
      onSubmit={() => {
        if (!onSubmit) {
          return;
        }

        const result = onSubmit();

        if (result instanceof Promise) {
          result.then(r => {
            if (r !== false) {
              closeModal();
            }
          });
        } else if (result !== false) {
          closeModal();
        }
      }}
      onCancel={(ref) => {
        onCancel?.(ref);
        closeModal();
      }}
      zIndex={highestZIndex() + 1}
    >
      {renderMessage()}
    </Modal>
  );

  return closeModal;
};

export const infoDialog = ({
  message,
  title = "Information",
  iconTitle,
  cancelText = "OK",
  className,
  onCancel,
}: DialogProps) => {
  return createModal({ message, title, iconTitle, cancelText, className, onCancel });
};

export const confirmDialog = ({
  message,
  title = "Confirm",
  iconTitle,
  submitText = "OK",
  cancelText = "Cancel",
  className,
  closeOnOverlayClick,
  displayClose,
  onSubmit,
  onCancel,
}: DialogProps) => {
  return createModal({ message, title, iconTitle, submitText, cancelText, className, closeOnOverlayClick, displayClose, onSubmit, onCancel });
};
