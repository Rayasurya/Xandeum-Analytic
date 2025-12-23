import { memo } from "react";
import IconClearCircle from "@/assets/icons/IconClearCircle";
import styles from "./LabelItem.module.scss";

type TLabelItemProps = {
  node: HTMLElement | null;
  onRemove: (node: HTMLElement | null) => void;
};

const MemoizedSLabelItem = (props: TLabelItemProps) => {
  const { node, onRemove } = props;
  const label = node && node.getAttribute("value");

  return (
    <div
      className={styles.item}
      style={{
        backgroundColor: node?.getAttribute("background") ?? "#FF0000",
      }}
    >
      <span className={styles.content}>
        {label && <span className={styles.value}>{label}</span>}
      </span>
      <button className={styles.clear} onClick={() => onRemove(node)}>
        <IconClearCircle />
      </button>
    </div>
  );
};

const LabelItem = memo(MemoizedSLabelItem);

export default LabelItem;
