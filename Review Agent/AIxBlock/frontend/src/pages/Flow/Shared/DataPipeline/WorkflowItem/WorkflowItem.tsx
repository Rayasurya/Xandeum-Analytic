import { memo } from "react";
import Checkbox from "@/components/Checkbox/Checkbox";
import styles from "../Workflow.module.scss";

type TWorkflowItemProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  subLabel?: string;
  onChange?: (checked: boolean) => void;
};

const MemoizedWorkflowItem = (props: TWorkflowItemProps) => {
  const { label, checked, disabled, subLabel, onChange } = props;
  return (
    <div className={checked ? styles.itemCompleted : styles.item}>
      <Checkbox
        label={label}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        size="sm"
      />
      {subLabel && (
        <p className={styles.itemDesc}>{subLabel}</p>
      )}
    </div>
  );
};

const WorkflowItem = memo(MemoizedWorkflowItem);

export default WorkflowItem;
