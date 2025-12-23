import { useNavigate, useParams } from "react-router-dom";
import { TProjectModel } from "@/models/project";
import LayoutSettings from "../LayoutSettings/Index";
import "./index.scss";
import { DATASET_HUB_TYPE } from "../DataSetHubs/Index";
import FormRender from "../DataSetHubs/FormRender/Index";

type TDataSetOnGitProps = {
  data?: TProjectModel | null;
};

const DataSetOnGit = (props: TDataSetOnGitProps) => {
  const navigate = useNavigate();
  const params = useParams();
  const projectID = parseInt(params.projectID ?? "0");
  const fields = [
    {
      name: "url",
      label: "URL *",
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

  return (
    <div className="m-335">
      <div className="p-dataset-on-git wrapper m-308">
        <div>
          <div className="p-dataset-on-git form">
            <h2 className="p-dataset-on-git__heading">Dataset on Git</h2>
            <FormRender type={DATASET_HUB_TYPE.git} fields={fields} />
          </div>
        </div>
      </div>
      <LayoutSettings.Footer
        prevUrl={"/projects/" + props.data?.id + `/import/dataset_hubs`}
        nextUrl={`/projects/${props?.data?.id}/data`}
        onSkip={() => navigate("/projects/" + projectID + `/data`)}
      />
    </div>
  );
};

export default DataSetOnGit;
