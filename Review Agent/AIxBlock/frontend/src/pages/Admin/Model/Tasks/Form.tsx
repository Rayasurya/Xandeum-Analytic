import Modal from "@/components/Modal/Modal";
import {TModelTask} from "@/models/modelMarketplace";
import InputBase from "@/components/InputBase/InputBase";
import {useMemo} from "react";
import styles from "./Form.module.scss";

export type TModelTaskFormData = Pick<TModelTask, "id" | "name" | "description">;

export type TModelTaskFormProps = {
  isOpen: boolean;
  isProcessing?: boolean;
  data?: TModelTaskFormData;
  onChange?: (d: TModelTaskFormData) => void;
  onSave?: () => void;
  onClose?: () => void;
}

export default function ModelTaskForm({isOpen, isProcessing, data, onChange, onSave, onClose}: TModelTaskFormProps) {
  const newData: TModelTaskFormData = useMemo(() => ({
    id: data?.id ?? 0,
    name: data?.name ?? "",
    description: data?.description ?? "",
  }), [data]);

  return (
    <Modal
      title="Model Task"
      open={isOpen}
      onSubmit={onSave}
      submitText={isProcessing ? undefined : "Save"}
      onClose={onClose}
    >
      <div className={styles.root}>
        <InputBase
          label="Task name"
          isControlledValue={true}
          value={newData.name}
          allowClear={false}
          disabled={isProcessing}
          onChange={ev => onChange?.({...newData, name: ev.currentTarget.value})}
        />
        <InputBase
          label="Description"
          isMultipleLine={true}
          isControlledValue={true}
          value={newData.description}
          allowClear={false}
          disabled={isProcessing}
          onChange={ev => onChange?.({...newData, description: ev.currentTarget.value})}
        />
      </div>
    </Modal>
  )
}
