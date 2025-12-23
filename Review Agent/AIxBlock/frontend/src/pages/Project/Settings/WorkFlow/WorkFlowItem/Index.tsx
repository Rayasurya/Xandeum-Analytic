import { memo } from "react";
import Checkbox from "@/components/Checkbox/Checkbox";

type TWorkFlowItemProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  subLabel?: string;
  onChange?: (checked: boolean) => void;
};

const MemoizedWorkFlowItem = (props: TWorkFlowItemProps) => {
  const { label, checked, disabled, subLabel, onChange } = props;
  return (
    <div className="c-workflow__item">
      <Checkbox
        label={label}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        size="sm"
      />
      {subLabel && (
        <p className="c-workflow__item-desc">
          lorem ipsum dolor sit amet consectetuer adipiscing elit.
        </p>
      )}
    </div>
  );
};

const WorkFlowItem = memo(MemoizedWorkFlowItem);

export default WorkFlowItem;
