import { useNavigate, useParams } from "react-router-dom";
import { TProjectModel } from "@/models/project";
import LayoutSettings from "../LayoutSettings/Index";
import "./index.scss";
import Button from "@/components/Button/Button";
import { useMemo, useState } from "react";
import FormRender from "./FormRender/Index";

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
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<DATASET_HUB_TYPE>(DATASET_HUB_TYPE.huggingface);
  const params = useParams();
  const projectID = parseInt(params.projectID ?? "0");

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
  }, [currentTab])

  return (
    <div className="m-335">
      <div className="p-dataset-hubs wrapper m-308">
        <div>
          <div className="p-dataset-hubs form-hubs">
            <h2 className="p-dataset-hubs__heading">Dataset Hubs</h2>
            <div className="p-dataset-hubs__tab">
              <Button 
                className={`tab-hubs ${currentTab === "hugging-face" ? "active" : ""}`} 
                onClick={() => setCurrentTab(DATASET_HUB_TYPE.huggingface)}
              >
                Hugging face
              </Button>
              <Button 
                className={`tab-hubs ${currentTab === "roboflow" ? "active" : ""}`} 
                onClick={() => setCurrentTab(DATASET_HUB_TYPE.roboflow)}
              >
                Roboflow
              </Button>
              <Button 
                className={`tab-hubs ${currentTab === "kaggle" ? "active" : ""}`} 
                onClick={() => setCurrentTab(DATASET_HUB_TYPE.kaggle)}>
                Kaggle
              </Button>
              <Button 
                className={`tab-hubs ${currentTab === "git" ? "active" : ""}`} 
                onClick={() => setCurrentTab(DATASET_HUB_TYPE.git)}>
                Github
              </Button>
            </div>
            <FormRender type={currentTab} fields={fields} />
          </div>
        </div>
      </div>
      <LayoutSettings.Footer
        prevUrl={"/projects/" + props.data?.id + `/import/cloud`}
        nextUrl={`/projects/${props?.data?.id}/data`}
        onSkip={() => navigate("/projects/" + projectID + `/data`)}
      />
    </div>
  );
};

export default DataSetHubs;
