import {TProjectModel} from "@/models/project";
import Modal from "@/components/Modal/Modal";
import ModelSource from "@/components/Model/ModelSource";
import styles from "./ModelSourceDialog.module.scss";
import {TModelSources} from "@/components/Model/Source";

export type TProps = {
  project: TProjectModel | null;
  isOpen: boolean;
  onAdded?: () => void;
  onClose?: () => void;
  hasCheckpoint?: boolean;
  disallowedSources?: TModelSources[];
  hasFramework?: boolean;
}

export default function ModelSourceDialog({project, isOpen, onAdded, onClose, hasCheckpoint, disallowedSources, hasFramework}: TProps) {
  return (
    <Modal
      open={isOpen}
      title={"Add new network"}
      className={styles.dialog + " scrollbar scrollbar-y"}
      onClose={onClose}
    >
      {project && (
        <ModelSource
          project={project}
          onAdded={onAdded}
          onClose={onClose}
          hasCheckpoint={hasCheckpoint}
          disallowedSources={disallowedSources}
          hasFramework={hasFramework}
          isNetwork={true}
        />
      )}
    </Modal>
  )
}
