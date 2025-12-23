import React, { useState } from "react";
import "./Loader.scss";
import { createPortal } from "react-dom";
import ProgressBarLoading from "../ProcessBarLoading/Index";
import IconLoadingV2 from "@/assets/icons/IconLoadingV2";
import IconLogoV2 from "@/assets/icons/IconLogoV2";

export type TLoaderRef = {
  show: () => void,
  hide: () => void,
  hideImmediately: () => void,
  setText: (text: string) => void,
  setTop: (top: number) => void,
  setLeft: (left: number) => void,
  setLoading: (isLoading: boolean) => void,
}

export default React.forwardRef<TLoaderRef>(function Loader(_, ref) {
  const ele = React.useRef<HTMLDivElement | null>(null);
  const eleText = React.useRef<HTMLSpanElement | null>(null);
  const hideTimeout = React.useRef<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const hideImmediately = React.useCallback(() => {
    ele.current?.classList.remove("c-loader--hiding");

    if (ele.current?.classList.contains("c-loader--show")) {
      ele.current?.classList.remove("c-loader--show");
    }

    if (eleText.current) {
      eleText.current.innerText = "";
    }
  }, []);

  React.useImperativeHandle(ref, () => ({
    show: () => {
      clearTimeout(hideTimeout.current);

      if (ele.current?.classList.contains("c-loader--show")) {
        return;
      }

      ele.current?.classList.add("c-loader--show");
    },
    hide: () => {
      if (!ele.current?.classList.contains("c-loader--hiding")) {
        ele.current?.classList.add("c-loader--hiding");
      }

      hideTimeout.current = setTimeout(hideImmediately, 350);
    },
    hideImmediately: hideImmediately,
    setText: (text: string) => {
      if (!eleText.current) {
        return;
      }

      eleText.current.innerHTML = text;
    },
    setTop: (top: number) => {
      if (!ele.current) {
        return;
      }

      ele.current.style.top = top + "px";
    },
    setLeft: (left: number) => {
      if (!ele.current) {
        return;
      }

      ele.current.style.left = left + "px";
    },
    setLoading: (isLoading: boolean) => {
      if (!ele.current) {
        return;
      }
      setIsLoading(isLoading);
    }
  }), [hideImmediately]);

  React.useLayoutEffect(() => {
    return () => {
      hideImmediately();
    };
  }, [hideImmediately]);

  return createPortal(
    <div className="c-loader" ref={e => ele.current = e} style={{ left: 0, top: 0 }}>
      <div className="c-loader__icon">
        <IconLogoV2 />
        <IconLoadingV2 />
      </div>
      <ProgressBarLoading isLoading={isLoading} />
      <span className="c-loader__text" ref={e => eleText.current = e}></span>
    </div>,
    document.body
  );
});

