import {TProjectModel} from "@/models/project";
import WorkflowItem from "./WorkflowItem/WorkflowItem";
import styles from "./Workflow.module.scss";
import {TUseProjectHook} from "@/hooks/project/useProjectHook";
import { IconLineDashed } from "@/assets/icons/Index";

type TWorkflowProps = {
  project: TProjectModel;
  patchProject: TUseProjectHook["patchProject"];
};

const Workflow = ({project, patchProject}: TWorkflowProps) => {
  return (
    <div className={styles.workflow}>
      <div className={styles.content}>
        <WorkflowItem label="Labeler" checked={true}/>
        <IconLineDashed color={project.need_to_qa ? '#865DFF' : "#DEDEEC"} />
        <WorkflowItem
          label="QA"
          checked={project.need_to_qa}
          onChange={(v) => patchProject({need_to_qa: v})}
        />
        <IconLineDashed color={project.need_to_qc ? "#865DFF" : "#DEDEEC"} />
        <WorkflowItem
          label="QC"
          checked={project.need_to_qc}
          disabled={!project.need_to_qa}
          onChange={(v) => patchProject({need_to_qc: v})}
        />
      </div>
    </div>
  );
};

export default Workflow;
