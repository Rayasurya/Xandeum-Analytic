import styles from "./SetupModel.module.scss";
import {TProjectModel} from "@/models/project";
import Button from "@/components/Button/Button";
import IconChevronRight from "@/assets/icons/IconChevronRight";
import ModelSourceDialog from "./Model/ModelSourceDialog";
import React from "react";
import {TModelSources} from "@/components/Model/Source";

export type TProps = {
  project: TProjectModel;
  onAdded?: () => void;
  hasNotebook?: boolean;
  hasMarketplace?: boolean;
  hasCheckpoint?: boolean;
  onMarketPlaceClick?: () => void;
  disallowedSources?: TModelSources[];
  hasFramework?: boolean;
}

export default function SetupModel({project, onAdded, hasNotebook, hasMarketplace, hasCheckpoint, onMarketPlaceClick, disallowedSources, hasFramework}: TProps) {
  const [showAddModel, setShowAddModel] = React.useState(false);

  const onOpenAddModel = React.useCallback(() => {
    setShowAddModel(true);
  }, []);

  const onCloseAddModel = React.useCallback(() => {
    setShowAddModel(false);
  }, []);

  const onModelAdded = React.useCallback(() => {
    setShowAddModel(false);
    onAdded?.();
  }, [onAdded]);

  return (
    <div className={styles.setupModel}>
      {hasCheckpoint
        ? (
          <div className={styles.item}>
            <div className={styles.title}>Add Model</div>
            <div className={styles.description}>
              Bring your own model to training. Upload and customize your model to fit it properly for your project needs, assuring best performance and outcomes.
            </div>
            <Button className={styles.button} icon={<IconChevronRight />} onClick={onOpenAddModel}>
              Start Now
            </Button>
          </div>
        )
        : (
          <div className={styles.item}>
            <div className={styles.title}>Add Source Code</div>
            <div className={styles.description}>
              Our simplified method allows you to easily add source code to your project. You can upload your code, arrange it neatly, and keep your project updated.
            </div>
            <Button className={styles.button} icon={<IconChevronRight />} onClick={onOpenAddModel}>
              Start Now
            </Button>
          </div>
        )
      }
      {hasNotebook && (
        <div className={styles.item}>
          <div className={styles.title}>Notebook</div>
          <div className={styles.description}>
            Access and write code right from the notebook. Open the notebook to begin coding, organizing your work, and incorporating it into your project with ease.
          </div>
          <Button
            className={styles.button}
            icon={<IconChevronRight />}
            onClick={() => {
              Object.assign(document.createElement('a'), {
                target: '_blank',
                rel: 'noopener noreferrer',
                href: window.APP_SETTINGS.hostname + "notebook/?project_id=" + project.id,
              }).click();
            }}
          >
            Start Now
          </Button>
        </div>
      )}
      {hasMarketplace && (
        <div className={styles.item}>
          <div className={styles.title}>Rent Model From Marketplace</div>
          <div className={styles.description}>
            Discover and rent models from our marketplace. Our varied range will help you choose the ideal model for your project needs and optimize your operations.
          </div>
          <Button
            className={styles.button}
            icon={<IconChevronRight />}
            onClick={onMarketPlaceClick}
          >
            Start Now
          </Button>
        </div>
      )}
      {showAddModel && (
        <ModelSourceDialog
          project={project}
          isOpen={true}
          onAdded={onModelAdded}
          onClose={onCloseAddModel}
          hasCheckpoint={hasCheckpoint}
          disallowedSources={disallowedSources}
          hasFramework={hasFramework}
        />
      )}
    </div>
  )
}
