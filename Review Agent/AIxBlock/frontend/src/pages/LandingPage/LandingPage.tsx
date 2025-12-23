import React, {CSSProperties} from "react";
import Button, {TButtonProps} from "@/components/Button/Button";
import styles from "./LandingPage.module.scss";
import useDebouncedEffect from "@/hooks/useDebouncedEffect";

export type TProps = {
  heading?: string;
  intro?: string;
  actions?: TButtonProps[];
  icon?: React.ReactNode;
  style?: CSSProperties,
  noAutoMargin?: boolean,
}

export default function LandingPage({heading, intro, actions, icon, style, noAutoMargin}: TProps) {
  const eleRef = React.useRef<HTMLDivElement>(null);

  useDebouncedEffect(() => {
    if (noAutoMargin) {
      return;
    }

    function setMargin() {
      if (!eleRef.current) {
        return;
      }

      const parentRect = eleRef.current.parentElement?.getBoundingClientRect() ?? {height: 0, width: 0, x: 0, y: 0};
      const clientRect = eleRef.current.getBoundingClientRect();

      eleRef.current.style.marginTop = parentRect.height <= clientRect.height
        ? ""
        : Math.floor((parentRect.height - clientRect.height) / 2) + "px";
    }

    setMargin();
    window.addEventListener("resize", setMargin);

    return () => {
      window.removeEventListener("resize", setMargin);
    }
  }, [noAutoMargin]);

  return (
    <div className={styles.container} ref={eleRef} style={style}>
      {icon && <div className={styles.icon}>{icon}</div>}
      {heading && <div className={styles.heading}>{heading}</div>}
      {intro && <div className={styles.intro}>{intro}</div>}
      {actions && <div className={styles.actions}>
        {actions.map((action, idx) => (
          <Button key={"key" in action ? action.key as string : "action-" + idx} {...action} />
        ))}
      </div>}
    </div>
  );
}
