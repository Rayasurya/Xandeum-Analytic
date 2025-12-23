import { memo } from "react";
import IconClearCircle from "@/assets/icons/IconClearCircle";

type TLabelItemProps = {
  node: HTMLElement | null;
  onRemove: (node: HTMLElement | null) => void;
};

const MemoizedSLabelItem = (props: TLabelItemProps) => {
  const { node, onRemove } = props;
  const label = node && node.getAttribute("value");

  return (
    <div
      className="c-label__item"
      style={{
        backgroundColor: node?.getAttribute("background") ?? "#FF0000",
      }}
    >
      <span className="c-label__content">
        {label && <span className="c-label__value">{label}</span>}
      </span>
      <button className="c-label--clear" onClick={() => onRemove(node)}>
        <IconClearCircle />
      </button>
    </div>
  );
};

const LabelItem = memo(MemoizedSLabelItem);

export default LabelItem;
