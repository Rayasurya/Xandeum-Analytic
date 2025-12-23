import { useMemo, useState } from "react";
import Button from "@/components/Button/Button";
import { TProjectModel } from "@/models/project";
import FormRender from "./FormRender/Index";
import styles from "./DataSetHubs.module.scss";


type TDataSetHubsProps = {
  data?: TProjectModel | null;
};

export enum DATASET_HUB_TYPE {
  kaggle = "kaggle",
  huggingface = "hugging-face",
  roboflow = "roboflow",
  git = "git"
}

const DataSetHubs = (props: TDataSetHubsProps) => {
  const [currentTab, setCurrentTab] = useState<DATASET_HUB_TYPE>(DATASET_HUB_TYPE.huggingface);

  const fields = useMemo(() => {
    switch (currentTab) {
      case DATASET_HUB_TYPE.roboflow:
        return [
          {
            name: "dataset_path",
            label: "Dataset_path *",
            placeholder: "...",
            required: true,
          },
          {
            name: "token",
            label: "Token *",
            placeholder: "...",
            required: true,
          },
          {
            name: "workspace",
            label: "Workspace *",
            placeholder: "...",
            required: true,
          },
          {
            name: "version",
            label: "Version",
            placeholder: "...",
            required: false,
          }
        ];
      case DATASET_HUB_TYPE.kaggle:
        return [
          {
            name: "username",
            label: "Username *",
            placeholder: "...",
            required: true,
          },
          {
            name: "dataset_path",
            label: "Dataset_path *",
            placeholder: "...",
            required: true,
          },
          {
            name: "token",
            label: "Token *",
            placeholder: "...",
            required: true,
          },
        ]
      case DATASET_HUB_TYPE.git:
        return [
          {
            name: "url",
            label: "URL *",
            placeholder: "...",
            required: true,
          },
          {
            name: "token",
            label: "Token",
            placeholder: "...",
            required: false,
          },
        ]
      default:
        return [
          {
            name: "dataset_path",
            label: "Dataset_path *",
            placeholder: "...",
            required: true,
          },
          {
            name: "token",
            label: "Token",
            placeholder: "...",
            required: false,
          },
        ];
    }
  }, [currentTab]);

  return (
    <div className={styles.DatasetHubsForm}>
      <h2 className={styles.DatasetHubsHeading}>Dataset Hubs</h2>
      <div className={styles.DatasetHubsTab}>
        <Button
          className={`${styles.tabHubs} ${currentTab === "hugging-face" ? styles.tabHubsActive : ""}`}
          onClick={() => setCurrentTab(DATASET_HUB_TYPE.huggingface)}
        >
          Hugging face
        </Button>
        <Button
          className={`${styles.tabHubs} ${currentTab === "roboflow" ? styles.tabHubsActive : ""}`}
          onClick={() => setCurrentTab(DATASET_HUB_TYPE.roboflow)}
        >
          Roboflow
        </Button>
        <Button
          className={`${styles.tabHubs} ${currentTab === "kaggle" ? styles.tabHubsActive : ""}`}
          onClick={() => setCurrentTab(DATASET_HUB_TYPE.kaggle)}>
          Kaggle
        </Button>
        <Button
          className={`${styles.tabHubs} ${currentTab === "git" ? styles.tabHubsActive : ""}`}
          onClick={() => setCurrentTab(DATASET_HUB_TYPE.git)}>
          Github
        </Button>
      </div>
      <FormRender type={currentTab} fields={fields} />
    </div>
  );
};

export default DataSetHubs;
