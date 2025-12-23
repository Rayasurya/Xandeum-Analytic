import styles from "./Tutorial.module.scss";
import {useEffect, useRef} from "react";
import {useFlowProvider} from "../FlowProvider";
import {IconClose} from "@/assets/icons/Index";
import {createPortal} from "react-dom";
import {highestZIndex} from "@/utils/zIndex";
import Workflow from "./Workflow";

export type TProps = {
  name: string;
  show: boolean;
  onClose: () => void;
}

export default function Tutorial({name, show, onClose}: TProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {flowDiagram} = useFlowProvider();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    containerRef.current.style.display = show ? "" : "none";
    containerRef.current.style.zIndex = (highestZIndex() + 1).toString();
  }, [show]);

  return createPortal((
    <div className={styles.container} ref={containerRef}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.title}>{name}</div>
          <button
            className={styles.close}
            onClick={onClose}
          >
            <IconClose/>
          </button>
        </div>
        <Workflow flows={flowDiagram} />
      </div>
    </div>
  ), document.body);
}
