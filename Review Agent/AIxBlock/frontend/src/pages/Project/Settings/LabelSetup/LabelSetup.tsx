import {useMemo} from "react";
import "./LabelSetup.scss";
import LabelManager from "./LableManager/Index";
import { parseLabels } from "@/utils/labelConfig";
import { TProjectModel } from "@/models/project";
import LayoutSettings from "../LayoutSettings/Index";
import { useNavigate } from "react-router-dom";

type TLabelSetupProps = {
  data: TProjectModel;
  setNewDataProject: (data:TProjectModel) => void;
};

const LabelSetup = ({data, setNewDataProject}: TLabelSetupProps) => {
  const navigate = useNavigate();

  const dataLabel = useMemo(() => {
    return parseLabels(data.label_config);
  }, [data.label_config]);

  const labelsRoots = useMemo(() => {
    return Array.from(dataLabel?.labelsRoots ?? []);
  }, [dataLabel?.labelsRoots]);

  return (
    <div className="c-content-settings">
      <div className="c-label-setup m-303">
        <h2 className="c-label-setup__heading">Setup Label</h2>
        <div className="c-label-setup__section">
          {
            labelsRoots.length > 0
              ? (
                <LabelManager
                  labelsRoot={labelsRoots[0]}
                  projectID={data.id}
                  updateLabelConfig={(labelConfig) => {
                    setNewDataProject({...data, label_config: labelConfig});
                  }}
                />
              )
              : <>No label root found</>
          }
        </div>
      </div>
      <LayoutSettings.Footer
        prevUrl={"/projects/" + data.id + `/settings/webhooks`}
        nextUrl={"/projects/" + data.id + `/settings/members`}
        onSkip={() => navigate("/projects/" + data.id + `/settings/members`)}
      />
    </div>
  );
};

export default LabelSetup;
