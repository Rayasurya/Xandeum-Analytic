import React, {useCallback, useMemo, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import IconArrowLeftTail from "@/assets/icons/IconArrowLeftTail";
import IconArrowSquareRight from "@/assets/icons/IconArrowSquareRight";
import LLM, { TLLMProps } from "@/components/Editor/LLM/LLM";
import { useUserLayout } from "@/layouts/UserLayout";
import "./index.scss";
import useProjectHook from "@/hooks/project/useProjectHook";
import {TProjectModel} from "@/models/project";
import {useCreateProject} from "@/hooks/project/create/useCreateProject";
import {usePromiseLoader} from "@/providers/LoaderProvider";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

function LLMEditorInternal({project}: {
  project: TProjectModel,
}) {
  const userLayout = useUserLayout();
  const navigate = useNavigate();
  const [editorType, setEditorType] = React.useState<TLLMProps["type"]>("editor");
  const [data, setData] = useState<TProjectModel>(project);
  const {onCreate} = useCreateProject(data);
  const {addPromise} = usePromiseLoader();

  const onChangeEditorView = useCallback(
    (type: TLLMProps["type"]) => {
      setEditorType(type);
    },
    [setEditorType]
  );

  const preloadData = useMemo(() => {
    const config = data.label_config
        .replace('<View id="llm-custom"><!--', '')
        .replace('--></View>', '')
        .replace('<View id="llm-custom">', '')
        .replace('</View>', '');

    if (config.length > 0) {
      return JSON.parse(config);
    }

    return null;
  }, [data.label_config]);

  React.useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "LLM Custom Editor" }]);
    userLayout.setCloseCallback(`/projects/${project.id}/settings/ml`);

    if (editorType === "preview") {
      userLayout.hideInfo();
      userLayout.setLeftActions([
        {
          icon: <IconArrowLeftTail />,
          label: "Back to UI Builder",
          onClick: () => {
            onChangeEditorView("editor");
          },
          actionType: "link",
        },
      ]);
      userLayout.setActions([
        // {
        //   icon: <IconExport2 />,
        //   label: "",
        //   onClick: () => {},
        //   actionType: "link",
        // },
        // {
        //   icon: <IconImport />,
        //   label: "",
        //   onClick: () => {},
        //   actionType: "link",
        // },
        // {
        //   label: "Save as draft",
        //   onClick: () => {},
        //   actionType: "outline",
        // },
        // {
        //   label: "Close",
        //   onClick: () => navigate(`/projects/${project.id}/settings/ml`),
        //   actionType: "danger",
        // },
        {
          label: "Save",
          onClick: () => {
            const promise = onCreate(project.id);
            addPromise(promise, "Saving configuration...");
            promise.then(() => {
              navigate("/projects/" + project.id + "/settings/ml");
            });
          },
          actionType: "primary",
        },
      ]);
    }
    if (editorType === "editor") {
      userLayout.showInfo();
      userLayout.setActions([
        {
          icon: <IconArrowSquareRight />,
          label: "Next",
          onClick: () => {
            onChangeEditorView("preview");
          },
          actionType: "primary",
        },
      ]);
    }

    return () => {
      userLayout.clearBreadcrumbs();
      userLayout.clearActions();
      userLayout.clearLeftActions();
      userLayout.showInfo();
    };
  }, [navigate, userLayout, onChangeEditorView, editorType, project.id, onCreate, addPromise]);

  return <LLM
    type={editorType}
    preloadData={preloadData}
    onLayoutUpdate={data => {
      setData(d => ({
        ...d,
        label_config: '<View id="llm-custom"><!--' + JSON.stringify(data) + '--></View>',
      }));
    }}
  />;
}

export default function LLMEditor() {
  const {projectID} = useParams();
  const {detail: project, loading, refresh} = useProjectHook(parseInt(projectID ?? "0"));

  if (loading) {
    return <EmptyContent message="Loading config..." />;
  }

  if (!project) {
    return <EmptyContent
      message="Could not load project, please try again."
      buttons={[{
        children: "Retry",
        onClick: () => refresh(),
      }]}
    />;
  }

  return <LLMEditorInternal project={project} />;
}
