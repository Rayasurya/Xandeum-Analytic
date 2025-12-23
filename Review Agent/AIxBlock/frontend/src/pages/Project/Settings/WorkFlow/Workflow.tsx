import { useCallback, useEffect, useRef, useState } from "react";
import { useCreateProject } from "@/hooks/project/create/useCreateProject";
import { TProjectModel } from "@/models/project";
import { useProjectContext } from "@/providers/ProjectProvider";
import LayoutSettings from "../LayoutSettings/Index";
import WorkFlowItem from "./WorkFlowItem/Index";
import "./Workflow.scss";
import IconArrowDashedRight from "@/assets/icons/IconArrowDashedRight";
import { useNavigate } from "react-router-dom";

type DataWorkFlow = {
  needToQA: boolean;
  needToQC: boolean;
  label_config_title: string;
};

type TWorkflowProps = {
  data?: TProjectModel | null;
  setNewDataProject: ( data:TProjectModel ) => void;
};

const Workflow = (props: TWorkflowProps) => {
  const { data } = props;
  const { state } = useProjectContext();
  const navigate = useNavigate();
  const { dataProject } = state;
  const { need_to_qa, need_to_qc } = dataProject;
  const [flowData, setFlowData] = useState<DataWorkFlow>(() => {
    return {
      needToQA: data ? data?.need_to_qa : need_to_qa,
      needToQC: data ? data?.need_to_qc : need_to_qc,
      label_config_title: data ? data?.label_config_title : "",
    };
  });
  const prevFlowDataRef = useRef<DataWorkFlow>(flowData);
  const { onCreate } = useCreateProject({
    need_to_qa: flowData.needToQA,
    need_to_qc: flowData.needToQC,
    label_config_title: flowData.label_config_title,
  });

  const handleChecked = useCallback(
    (type: string, checked: boolean) => {
      const updatedData = {
        ...flowData,
        [type]: checked,
      };
      setFlowData(updatedData);
    },
    [flowData]
  );

  useEffect(() => {
    // Update Project
    if (prevFlowDataRef.current !== flowData) {
      if (prevFlowDataRef.current !== null) {
        onCreate(data?.id).then((res) => {
          if (res) {
            props.setNewDataProject(res);
          }
        });
      }
      prevFlowDataRef.current = flowData;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowData, onCreate, data?.id, props.setNewDataProject]);

  return (
    <div className="c-content-settings">
      <div className="c-workflow m-303">
        <div className="c-workflow__content">
          <WorkFlowItem label="Labeler" checked={true} />
          <IconArrowDashedRight />
          <WorkFlowItem
            label="QA"
            checked={flowData.needToQA}
            onChange={(val) => handleChecked("needToQA", val)}
          />
          <IconArrowDashedRight />
          <WorkFlowItem
            label="QC"
            checked={flowData.needToQC}
            disabled={!flowData.needToQA}
            onChange={(val) => handleChecked("needToQC", val)}
          />
        </div>
      </div>
      <LayoutSettings.Footer
        prevUrl={"/projects/" + props.data?.id + `/settings/members`}
        nextUrl={"/projects/" + props.data?.id + `/import/local`}
        onSkip={() => navigate("/projects/" + props.data?.id + `/import/local`)}
        // nextUrl={"/projects/" + props.data?.id + `/settings/crowdsource`}
        // onSkip={() => navigate("/projects/" + props.data?.id + `/settings/crowdsource`)}
      />
    </div>
  );
};

export default Workflow;
