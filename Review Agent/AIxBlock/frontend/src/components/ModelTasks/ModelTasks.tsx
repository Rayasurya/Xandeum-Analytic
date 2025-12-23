import Select, {DataSelect} from "@/components/Select/Select";
import {useMemo} from "react";
import useModelTasks from "@/hooks/models/useModelTasks";
import styles from "./ModelTasks.module.scss";

export type TModelTasksProps = {
  label?: string,
  placeholder?: string,
  selectedTaskIds?: number[],
  setSelectedTaskIds?: (selectedTaskIds: number[]) => void,
  isRequired?: boolean,
  showFullDescription?: boolean,
  error?: string | null,
}

export default function ModelTasks({
  label,
  placeholder,
  selectedTaskIds = [],
  setSelectedTaskIds,
  isRequired,
  showFullDescription,
  error,
}: TModelTasksProps) {
  const {list: modelTasks, loading: mtLoading} = useModelTasks();

  const taskOptions = useMemo((): DataSelect[] => [
    {
      options: [
        ...modelTasks.map(mt => ({
          label: mt.name,
          value: mt.id.toString(),
          data: mt.description,
        })),
      ],
    },
  ], [modelTasks]);

  const selectedTask = useMemo(() => {
    return taskOptions[0].options.filter(mt => selectedTaskIds.includes(parseInt(mt.value)));
  }, [selectedTaskIds, taskOptions]);

  return (
    <Select
      label={label}
      data={taskOptions}
      defaultValue={selectedTask}
      isMultiple={true}
      type="checkbox"
      placeholderText={placeholder}
      isLoading={mtLoading}
      isRequired={isRequired}
      error={error}
      onMultipleChange={opts => {
        setSelectedTaskIds?.(opts.map(o => parseInt(o.value)));
      }}
      customRenderLabel={o => (
        <div className={styles.taskItem}>
          <div className={styles.taskItemLabel}>{o.label}</div>
          {o.data && typeof o.data === "string" && (
            <div className={ styles.taskItemDesc } title={o.data}>
              {o.data.length > 75 && !showFullDescription ? o.data.substring(0, 75) + "..." : o.data}
            </div>
          )}
        </div>
      ) }
    />
  );
}
