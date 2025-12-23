import {Flip, toast, ToastContent, ToastOptions} from "react-toastify";
import {CSSProperties} from "react";

const defaultOptions: ToastOptions<string> = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Flip,
  closeButton: true,
  pauseOnFocusLoss: false,
}

function getDefaultStyle(): CSSProperties {
  return {
    zIndex: 2147483647,
  };
}

export function toastSticky(message: string, options?: ToastOptions<string>) {
  const id = toast<string>(message, {
    ...defaultOptions,
    type: "info",
    theme: "colored",
    ...options,
    style: {...defaultOptions.style, ...options?.style},
    autoClose: false,
    draggable: false,
    closeButton: false,
  });

  return () => {
    toast.dismiss(id);
  }
}

export function toastSuccess(message: ToastContent<string>, options?: ToastOptions<string>) {
  return toast.success<string>(message, {...defaultOptions, ...(options ?? {}), style: {...getDefaultStyle(), ...options?.style}});
}

export function toastError(message: ToastContent<string>, options?: ToastOptions<string>) {
  return toast.error<string>(message, {...defaultOptions, theme: "colored", ...(options ?? {}), style: {...getDefaultStyle(), ...options?.style}});
}

export function toastWarn(message: ToastContent<string>, options?: ToastOptions<string>) {
  return toast.warn<string>(message, {...defaultOptions, theme: "colored", ...(options ?? {}), style: {...getDefaultStyle(), ...options?.style}});
}

export function toastInfo(message: ToastContent<string>, options?: ToastOptions<string>) {
  return toast.info<string>(message, {...defaultOptions, ...(options ?? {}), style: {...getDefaultStyle(), ...options?.style}});
}

export function toastDefault(message: ToastContent<string>, options?: ToastOptions<string>) {
  return toast<string>(message, {...defaultOptions, ...(options ?? {}), style: {...getDefaultStyle(), ...options?.style}});
}
