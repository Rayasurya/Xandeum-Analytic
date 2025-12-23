import React from "react";
import Pagination from "@/components/Pagination/Pagination";
import "./List.scss";
import { useUserLayout } from "@/layouts/UserLayout";
import EmptyProject from "./EmptyProject";
import ProjectItem from "./ProjectItem/ProjectItem";
import { useApi } from "@/providers/ApiProvider";
import { useSearchParams } from "react-router-dom";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import useProjectsHook from "@/hooks/project/useProjectsHook";
import AppLoading from "@/components/AppLoading/AppLoading";
import { TNavbarBreadcrumb } from "@/components/Navbar/Navbar";
import IconPlay from "@/assets/icons/IconPlay";
import { infoDialog } from "@/components/Dialog";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import { VIDEO_URL } from "@/constants/projectConstants";
import { useCheckVerifyNotification } from "@/hooks/computes/useCheckVerifyNotification";
// import {useGetDataTemplatesGpu} from "@/hooks/settings/general/useGetDataTemplatesGpu";
import {TProjectModel} from "@/models/project";

const FLOW_NAMES = {
  "train-and-deploy": "Train and Deploy",
  "fine-tune-and-deploy": "Fine-tune and Deploy",
  "deploy": "Deploy Only",
  "label-and-validate-data": "Label and Validate Data",
}

export default function List() {
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const projects = useProjectsHook({ page: currentPage ? Number(currentPage) : 1 });
  useCheckVerifyNotification()
  const userLayout = useUserLayout();
  const { call } = useApi();
  const refreshTimeoutRef = React.useRef<NodeJS.Timeout>();
  // const {list: templatesList, loading: loadingTemplates} = useGetDataTemplatesGpu();
  useBooleanLoader(projects.loading /*|| loadingTemplates*/, "Loading projects...");

  const refreshProjects = React.useCallback(() => {
    clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(projects.refresh, 500);
  }, [projects.refresh]);

  const deleteProject = React.useCallback((projectID: number) => {
    const ar = call("deleteProject", { params: { id: projectID.toString() } });
    ar.promise.then(refreshProjects);
  }, [call, refreshProjects]);

  const projectsByGroup = React.useMemo(() => {
    const result: {[k: string]: TProjectModel[]} = {};

    function _add(group: string, project: TProjectModel) {
      if (!(group in result)) {
        result[group] = [];
      }

      result[group].push(project);
    }

    (projects?.list ?? []).forEach(project => {
      // if (!project.template_id || !(project.template_id in templatesList)) {
      //   _add("Other", project);
      //   return;
      // }
      //
      // const group = templatesList[project.template_id].group;
      _add(project.flow_type ? FLOW_NAMES[project.flow_type] : "Other", project);
    });

    return result;
  }, [projects.list/*, templatesList*/]);

  const projectsList = React.useMemo(() => {
    const groups = Object.keys(projectsByGroup).sort();

    return groups.map(group => (
      <div className="page-projects__group-item" key={"group-" + group}>
        <div className="page-projects__group-item__heading">
          <span>{group}</span>
          <div className="line"/>
        </div>
        <div className="page-projects__list">
          {projectsByGroup[group].map(p => (
            <ProjectItem key={"project-" + p.id} data={p} deleteProject={deleteProject}/>
          ))}
        </div>
      </div>
    ));
  }, [deleteProject, projectsByGroup]);

  const actions: TNavbarBreadcrumb[] = React.useMemo(() => [
    // {
    //   icon: <IconCirclePlus />,
    //   label: "Create project",
    //   onClick: () => navigate("/create-project"),
    //   actionType: "danger",
    //   class: "btn-add-new-compute"
    // },
    {
      icon: <IconPlay />,
      label: "Watch demo video",
      onClick: () => {
        infoDialog({
          cancelText: null,
          className: "model-demo-video",
          message: (
            <VideoPlayer url={VIDEO_URL.BUILD_AI} />
          ),
        });
      },
      actionType: "outline",
      class: "watch-demo-video"
    },
  ], []);

  React.useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Projects (" + projects.total + ")" }]);
    userLayout.setActions(projects?.list.length > 0 ? actions : []);

    return () => {
      userLayout.clearBreadcrumbs();
      userLayout.clearActions();
    }
  }, [userLayout, projects?.list, actions, projects.total]);

  if (projects.loading) {
    return (<AppLoading message="Getting projects list..." />);
  }

  if (projects.loadingError) {
    return <EmptyContent message={projects.loadingError} buttons={[
      {
        children: "Retry",
        type: "hot",
        onClick: () => projects.refresh(),
      }
    ]} />
  }

  if (Array.isArray(projects.list) && projects?.list.length === 0) {
    return <EmptyProject />
  }

  return (
    <div className="page-projects">
      {projectsList}
      {projects.list &&
        <Pagination
          disabled={projects.loading}
          page={projects.page}
          pageSize={projects.pageSize}
          total={projects.total}
          setPage={projects.setPage}
          target={"projects"}
        />
      }
    </div>
  )
}
