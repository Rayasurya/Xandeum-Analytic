import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconClear } from "@/assets/icons/Index";
import Button, { TButtonProps } from "../Button/Button";
import "./Modal.scss";
import { debounce } from "@/utils/debounce";
import {highestZIndex} from "@/utils/zIndex";

type TModalProps = {
  children?: React.ReactNode;
  title?: React.ReactNode;
  open: boolean;
  cancelText?: string | null;
  cancelButtonProps?: TButtonProps;
  submitText?: string;
  submitButtonProps?: TButtonProps;
  icon?: JSX.Element;
  iconTitle?: JSX.Element;
  className?: string;
  onSubmit?: () => void;
  onCancel?: (ref?: React.RefObject<HTMLDivElement> | null) => void;
  onClose?: () => void;
  zIndex?: number;
  displayClose?: boolean;
  closeOnOverlayClick?: boolean;
  disableSubmit?: boolean;
  modalLoading?: boolean;
};

const Modal: React.FC<TModalProps> = ({
  children,
  title,
  open,
  cancelText,
  submitText,
  icon,
  iconTitle,
  className,
  onSubmit,
  onCancel,
  onClose,
  zIndex,
  cancelButtonProps,
  submitButtonProps,
  displayClose = true,
  closeOnOverlayClick = true,
  disableSubmit = false,
  modalLoading = false,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cancelBtnRef = useRef<HTMLDivElement | null>(null);
  const [hasScrollbar, setHasScrollbar] = useState(true);
  const nextZIndex = useRef(highestZIndex() + 1);
  
  const handleClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const targetTagName = (event.target as HTMLElement)?.tagName.toLowerCase();
    if (targetTagName !== "button" && !closeOnOverlayClick) {
      return;
    }
    if (targetTagName !== "button" && onCancel) {
      onCancel(null);
    } else {
      onCancel && onCancel(cancelBtnRef);
    }
  };

  const hasCancel = useMemo(
    () => onCancel && cancelText,
    [onCancel, cancelText]
  );
  const hasSubmit = useMemo(
    () => onSubmit && submitText,
    [onSubmit, submitText]
  );
  const hasFooter = useMemo(
    () => hasCancel || hasSubmit,
    [hasCancel, hasSubmit]
  );

  useEffect(() => {
    const body = document.body;

    if (open) {
      body.style.overflowY = "hidden";
      body.style.width = "calc(100% - 15px)";
    } else {
      setHasScrollbar(false);
    }

    return () => {
      body.style.overflowY = "";
      body.style.width = "";
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!modalLoading) {
      const handleResize = debounce(() => {
        const modalContent = modalRef.current;
        if (modalContent && children && contentRef.current) {
          const modalHeight = modalContent.clientHeight;
          const windowHeight = window.innerHeight;
          const heightPercent = (modalHeight / windowHeight) * 100;
          setHasScrollbar(!!(heightPercent >= 86));
        }
      }, 200);
  
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [open, children, modalLoading]);

  return createPortal(
    open ? (
      <div className="c-modal__root">
        <div
          className="c-modal__mask"
          onClick={handleClose}
          style={zIndex ? { zIndex } : { zIndex: nextZIndex.current }}
        ></div>
        <aside
          role="dialog"
          className={`c-modal ${className}`}
          ref={modalRef}
          style={zIndex ? { zIndex } : { zIndex: nextZIndex.current }}
        >
          <div
            className={`c-modal__content ${
              hasScrollbar ? "scrollbar scrollbar-y" : ""
            }`}
            ref={contentRef}
          >
            {displayClose && (
              <div className="c-modal--close" onClick={onClose ?? handleClose}>
                <button>
                  <IconClear />
                </button>
              </div>
            )}

            {title && (
              <div className="c-modal__header">
                {iconTitle}
                {title && <span className="c-modal__title">{title}</span>}
              </div>
            )}
            <div className="c-modal__body">{children}</div>
            {hasFooter && (
              <div className="c-modal__footer">
                {hasCancel && (
                  <div className="c-modal--cancel" ref={cancelBtnRef}>
                    <Button
                      type="white"
                      size="small"
                      {...cancelButtonProps}
                      onClick={cancelButtonProps?.onClick ?? handleClose}
                    >
                      {cancelText}
                    </Button>
                  </div>
                )}
                {hasSubmit && (
                  <Button
                    size="small"
                    icon={icon}
                    type="primary"
                    disabled={disableSubmit}
                    {...submitButtonProps}
                    // onClick={submitButtonProps?.onClick ?? onSubmit}
                    onClick={(event) => {
                      (submitButtonProps?.onClick ?? onSubmit)?.(event); // Truyền event vào
                      if (submitText === "Finish") {
                        window.location.reload(); // Chỉ reload nếu submitText = "Finish"
                      }
                    }}
                  >
                    {submitText}
                  </Button>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    ) : null,
    document.body
  );
};

export default Modal;
