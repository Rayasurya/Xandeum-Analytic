import React, {useMemo} from "react";
import {FLOW_NAMES, TProjectModel} from "@/models/project";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ProjectItem.scss";
import {IconThreeDot} from "@/assets/icons/Index";
import { formatDateTime } from "@/utils/formatDate";
import Dropdown from "@/components/Dropdown/Dropdown";
import { useCallback } from "react";
import DropdownItem, { TDropdownItem } from "@/components/DropdownItem/DropdownItem";
import { confirmDialog } from "@/components/Dialog";
import {useAuth} from "@/providers/AuthProvider";
import {Tooltip} from "react-tooltip";
import {getDisplayName} from "@/utils/user";
import useProjectPermission from "@/hooks/project/useProjectPermission";

type TProjectItemProps = {
  data: TProjectModel,
  deleteProject: (projectID: number) => void,
};

const ProjectItem = (props: TProjectItemProps) => {
  const {user} = useAuth();
  const { data } = props;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const permission = useProjectPermission({project: props.data, user});
  const currentPage = { state: { currentPage: searchParams.get("page") } }

  const handleDropdownClick = useCallback((e: React.MouseEvent<HTMLElement, MouseEvent>, handler: () => void) => {
    e.stopPropagation();
    handler();
  }, []);

  const urlPrefix = useMemo(() => {
    if (data.flow_type && ["train-and-deploy", "fine-tune-and-deploy", "deploy", "label-and-validate-data"].includes(data.flow_type)) {
      return "/" + data.flow_type + "/";
    }

    return "/projects/";
  }, [data.flow_type]);

  const dataProjectItem: TDropdownItem[] = [
    // {
    //   label: "Demo Environment",
    //   handler: (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
    //     handleDropdownClick(e, () => navigate(`/projects/${data.id}/demo`, currentPage)),
    // },
    ...permission.configure ? [{
      label: "Settings",
      handler: (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
        handleDropdownClick(e, () =>
          navigate(`${urlPrefix}${data.id}/settings`, currentPage)
        ),
    }] : [],
    // {
    //   label: "Labels",
    //   handler: (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
    //     handleDropdownClick(e, () => navigate(`/projects/${data.id}/settings/labels`, currentPage)),
    // },
    ...permission.delete ? [{
      label: "Delete",
      handler: (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
        handleDropdownClick(e, () => {
          confirmDialog({
            message: "Are you sure you want to delete this project?",
            onSubmit() {
              props.deleteProject(props.data.id);
            },
          });
        }),
    }] : [],
  ];

  const tt = React.useCallback((k: string) => "project-" + props.data.id + "-" + k, [props.data.id]);

  return (
    <div
      className="projects__item"
      key={"project-" + data.id}
      onClick={() => navigate(`${urlPrefix}${data.id}`, currentPage)}
      style={data.color ? {borderColor: data.color} : {}}
    >
      <div className="projects__item-top">
        <div className="projects__item-content">
          <span className="projects__item-title">{data.title}</span>
          {dataProjectItem.length > 0 && (
            <Dropdown
              icon={<IconThreeDot />}
              placement="right"
              arrow={true}
              style={{ right: -12, top: 16 }}
            >
              <DropdownItem data={dataProjectItem} />
            </Dropdown>
          )}
        </div>
        <div className="projects__item-config-type" id={tt("config-type")}>
          {data.label_config_title}
        </div>
        <Tooltip place="bottom-start" positionStrategy="fixed" content="Project Type" anchorSelect={`#${tt("config-type")}`} />
        <div className="projects__item-content">
          <span id={tt("tasks")}>
            {props.data.finished_task_number} / {props.data.task_number}
          </span>
          <Tooltip place="top" positionStrategy="fixed" content="Labeled Tasks / Total Tasks" anchorSelect={`#${tt("tasks")}`} />
          <div className="projects__item-content__right">
            <div className="projects__item-content__icon" id={tt("annotations")}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9.99996 1.66663C5.40829 1.66663 1.66663 5.40829 1.66663 9.99996C1.66663 14.5916 5.40829 18.3333 9.99996 18.3333C14.5916 18.3333 18.3333 14.5916 18.3333 9.99996C18.3333 5.40829 14.5916 1.66663 9.99996 1.66663ZM13.9833 8.08329L9.25829 12.8083C9.14163 12.925 8.98329 12.9916 8.81663 12.9916C8.64996 12.9916 8.49163 12.925 8.37496 12.8083L6.01663 10.45C5.77496 10.2083 5.77496 9.80829 6.01663 9.56663C6.25829 9.32496 6.65829 9.32496 6.89996 9.56663L8.81663 11.4833L13.1 7.19996C13.3416 6.95829 13.7416 6.95829 13.9833 7.19996C14.225 7.44163 14.225 7.83329 13.9833 8.08329Z"
                  fill="#27BE69"/>
              </svg>
              <span>{props.data.total_annotations_number}</span>
            </div>
            <Tooltip place="top" positionStrategy="fixed" content="Total Annotations" anchorSelect={`#${tt("annotations")}`} />
            {/*<div className="projects__item-content__icon">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd"
                    d="M9.99996 18.3333C14.6023 18.3333 18.3333 14.6023 18.3333 9.99996C18.3333 5.39759 14.6023 1.66663 9.99996 1.66663C5.39759 1.66663 1.66663 5.39759 1.66663 9.99996C1.66663 14.6023 5.39759 18.3333 9.99996 18.3333ZM14.1666 9.16663L5.83329 9.16663V10.8333H14.1666V9.16663Z"
                    fill="#F2415A"/>
              </svg>
              <span>{props.data.skipped_annotations_number}</span>
            </div>*/}
            <div className="projects__item-content__icon" id={tt("predictions")}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9.975 1.66663C5.375 1.66663 1.64166 5.39996 1.64166 9.99996C1.64166 14.6 5.375 18.3333 9.975 18.3333C14.575 18.3333 18.3083 14.6 18.3083 9.99996C18.3083 5.39996 14.5833 1.66663 9.975 1.66663ZM13.1 10.2916L10 13.8166L9.63333 14.2333C9.125 14.8083 8.70833 14.6583 8.70833 13.8833V10.5833H7.29166C6.65 10.5833 6.475 10.1916 6.9 9.70829L10 6.18329L10.3667 5.76663C10.875 5.19163 11.2917 5.34163 11.2917 6.11663V9.41663H12.7083C13.35 9.41663 13.525 9.80829 13.1 10.2916Z"
                  fill="#5050FF"/>
              </svg>
              <span>{props.data.total_predictions_number}</span>
            </div>
            <Tooltip place="top" positionStrategy="fixed" content="Total Predictions" anchorSelect={`#${tt("predictions")}`} />
          </div>
        </div>
      </div>
      <div className="projects__item-bot">
        <span className="projects__item-created" id={tt("created")}>
          {[
            getDisplayName(data.created_by),
            formatDateTime(data.created_at),
          ].filter(s => s.trim() !== "").join(" @ ")}
        </span>
        <Tooltip place="top" positionStrategy="fixed" content="Author, Date Created" anchorSelect={`#${tt("created")}`} />
        <span className="projects__item-type" id={tt("workflow")}>
          {data.flow_type ? FLOW_NAMES[data.flow_type] : ""}
        </span>
        <Tooltip place="top" positionStrategy="fixed" content="Workflow" anchorSelect={`#${tt("workflow")}`} />
      </div>
    </div>
  );
};

export default ProjectItem;
