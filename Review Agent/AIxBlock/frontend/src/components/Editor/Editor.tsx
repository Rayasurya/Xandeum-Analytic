import React from "react";
import { TTaskModel } from "@/models/task";
import "./Editor.scss";
import LSF from "./LSF/LSF";
import { TProjectModel } from "@/models/project";
import RIA from "./RIA/RIA";
import TDE from "./TDE/TDE";
import {highestZIndex} from "@/utils/zIndex";
import EmptyContent from "../EmptyContent/EmptyContent";
// import Button from "../Button/Button";
// import IconAnnotations from "@/assets/icons/IconAnnotations";
// import IconPredictions from "@/assets/icons/IconPredictions";
// import IconCancel from "@/assets/icons/IconCancel";
// import { formatDateTime } from "@/utils/formatDate";

export type TProps = {
  project: TProjectModel;
  task?: TTaskModel | null;
  // tasks?: TTaskModel[];
  // onTaskSelect?: (task: TTaskModel) => void;
  onLabelCreated?: (type: string, name: string, label: string) => void;
  onLabelDeleted?: (type: string, name: string, label: string) => void;
  hasMlAssisted?: boolean;
  onPredictConfigChange?: (config: TProjectModel["predict_config"]) => void;
};

type TResizeState = {
  lastX: number,
  mouseDown: boolean,
};

function limitEditorLeft(newLeft: number) {
  return Math.min(window.innerWidth / 2, Math.max(72, newLeft));
}

export default function Editor({ project, task, onLabelCreated, onLabelDeleted, /*tasks, onTaskSelect,*/ hasMlAssisted, onPredictConfigChange }: TProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const resizerRef = React.useRef<HTMLDivElement>(null);
  const resizeState = React.useRef<TResizeState>({
    lastX: 0,
    mouseDown: false,
  });

  const lowerLabelConfig = React.useMemo(
    () => project.label_config.toLowerCase(),
    [project.label_config]
  );

  const useRia = React.useMemo(() => {
    if ("video" in project.data_types || Object.values(project.data_types).includes("Video")) {
      return false;
    }

    if (lowerLabelConfig.indexOf("<brushlabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<rectanglelabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<polygonlabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<keypointlabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<skeletonlabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<cuboidlabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<polylinelabels") > -1) {
      return true;
    }

    if (lowerLabelConfig.indexOf("<eliplabels") > -1) {
      return true;
    }
  }, [lowerLabelConfig, project.data_types]);

  const riaTools = React.useMemo(() => {
    if (!useRia) {
      return [];
    }

    let result = ["brush", "clone"];

    if (lowerLabelConfig.indexOf("<rectanglelabels") > -1) {
      result.push("create-box");
    }

    if (lowerLabelConfig.indexOf("<polygonlabels") > -1) {
      result.push("create-polygon");
    }

    if (lowerLabelConfig.indexOf("<keypointlabels") > -1) {
      result.push("create-point");
    }

    if (lowerLabelConfig.indexOf("<skeletonlabels") > -1) {
      result.push("create-skeleton");
    }

    if (lowerLabelConfig.indexOf("<cuboidlabels") > -1) {
      result.push("create-cuboid");
    }

    if (lowerLabelConfig.indexOf("<polylinelabels") > -1) {
      result.push("create-polyline");
    }

    if (lowerLabelConfig.indexOf("<eliplabels") > -1) {
      result.push("create-oval");
    }

    if (lowerLabelConfig.indexOf("<brushlabels") > -1) {
      result.push("brush-tool");
      result.push("eraser");
    }

    return result;
  }, [lowerLabelConfig, useRia]);

  const editor = React.useMemo(() => {
    if (!task) {
      return <EmptyContent message="Loading..." />
    }

    if (useRia) {
      return <RIA project={project} task={task} tools={riaTools} hasMlAssisted={hasMlAssisted} />;
    } else if (Object.hasOwn(project.data_types, "pcd")) {
      return <TDE project={project} task={task} />;
    } else {
      return <LSF
        project={project}
        task={task}
        onLabelCreated={onLabelCreated}
        onLabelDeleted={onLabelDeleted}
        hasMlAssisted={hasMlAssisted}
        onPredictConfigChange={onPredictConfigChange}
      />;
    }
  }, [onLabelCreated, onLabelDeleted, project, riaTools, task, useRia, hasMlAssisted, onPredictConfigChange]);

  /*const dataType = React.useMemo(() => {
    const types = Object.keys(project.data_types);

    if (types.length === 0) {
      return "(unknown)";
    }

    return types[0].toLowerCase();
  }, [project.data_types]);*/

  React.useEffect(() => {
    document.body.style.overflowY = "hidden";

    function mouseMove(e: MouseEvent) {
      if (!resizeState.current.mouseDown || !editorRef.current || !resizerRef.current) {
        return;
      }

      let newLeft = limitEditorLeft(parseInt(editorRef.current.style.left) + (e.clientX - resizeState.current.lastX));
      localStorage.setItem("aixblock-editor-left", newLeft.toString());
      editorRef.current.style.left = newLeft + "px";
      resizerRef.current.style.left = (newLeft - 4) + "px";
      resizeState.current.lastX = editorRef.current.getBoundingClientRect().x - 2;
    }

    function mouseDown(e: MouseEvent) {
      resizeState.current.lastX = e.clientX;
    }

    function mouseUp(e: MouseEvent) {
      document.body.style.userSelect = "";
      resizeState.current.mouseDown = false;
    }

    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mousedown", mouseDown);
    document.addEventListener("mouseup", mouseUp);

    return () => {
      document.body.style.overflowY = "";
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("mouseup", mouseUp);
    };
  }, []);

  const savedEditorLeft = React.useMemo(() => {
    const oldLeft = localStorage.getItem("aixblock-editor-left");

    if (oldLeft && oldLeft.length > 0) {
      return limitEditorLeft(parseInt(oldLeft));
    }

    return window.innerWidth * 0.2;
  }, []);

  return (
    <>
      <div
        className="c-editor"
        ref={editorRef}
        style={{
          left: savedEditorLeft,
          zIndex: highestZIndex() + 1,
        }}
      >
        {editor}
      </div>
      <div
        className="c-editor__resizer"
        ref={resizerRef}
        style={{
          left: savedEditorLeft - 4,
          zIndex: highestZIndex() + 1,
        }}
        onMouseDown={e => {
          document.body.style.userSelect = "none";
          resizeState.current.mouseDown = true;
        }}
      />
      {/*{tasks && (
        <div className={`c-footer-container`}>
          {tasks.map(function (taskItem, i) {
            return (
              <Button
                className={`footer-item ${task.id === taskItem.id && "active"}`}
                key={"task-" + taskItem.id}
                onClick={() => {
                  onTaskSelect && onTaskSelect(taskItem);
                }}
              >
                <div className="flex-content">
                  <div className="flex-row">
                    <div className="img-tag">{dataType}</div>
                    <div className="task-content">
                      <span>ID: {taskItem.id}</span>
                      <span>
                        Completed: {formatDateTime(taskItem.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div className="task-info">
                    <span className="task-info-item">
                      <IconAnnotations />
                      {taskItem.total_annotations}
                    </span>
                    <span className="task-info-item">
                      <IconCancel />
                      {taskItem.cancelled_annotations}
                    </span>
                    <span className="task-info-item">
                      <IconPredictions />
                      {taskItem.total_predictions}
                    </span>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      )}*/}
    </>
  );
}
