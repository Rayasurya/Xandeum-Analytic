import React from "react";
import {Outlet, useNavigate, useParams} from "react-router-dom";
import "./Detail.scss"
import useProjectHook from "@/hooks/project/useProjectHook";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import {TProjectModel} from "@/models/project";
import {createAlert} from "@/utils/createAlert";
import {useUserLayout} from "@/layouts/UserLayout";
import {useCentrifuge} from "@/providers/CentrifugoProvider";

export type TPageProjectDetailProvider = {
  project: TProjectModel,
  patchProject: (data: Partial<TProjectModel>, dryRun?: boolean, onCompleted?: () => void) => void,
}

export const PageProjectDetailContext = React.createContext<TPageProjectDetailProvider>({
  project: {} as unknown as TProjectModel,
  patchProject: () => void 0,
})

export default function Detail() {
  const params = useParams();
  const projectID = parseInt(params.projectID ?? "0");
  const project = useProjectHook(projectID);
  const navigate = useNavigate();
  const {setNavDataProject} = useUserLayout();
  const {onProjectMessage} = useCentrifuge();
  useBooleanLoader(project.loading, "Loading...");

  React.useEffect(() => {
    if (projectID < 1) {
      navigate("/projects/");
    }
  }, [navigate, projectID]);

  React.useEffect(() => {
    setNavDataProject(project.detail);

    return () => {
      setNavDataProject(null);
    }
  }, [project.detail, setNavDataProject]);

  const handleProjectMessage = React.useCallback((data: object) => {
    if ("label_config" in data) {
      project.patchProject({label_config: String(data["label_config"])}, true);
    }
  }, [project]);

  React.useEffect(() => {
    if (projectID <= 0) {
      return;
    }

    const unsubscribe = onProjectMessage(projectID, handleProjectMessage);

    return () => {
      unsubscribe();
    }
  }, [handleProjectMessage, onProjectMessage, projectID]);

  if (projectID < 1) {
    return null;
  }

  if(!project.initialized){
    return null;
  }

  if (project.loadingError) {
    return <div className="project-detail__error-wrapper">{createAlert(project.loadingError, project.refresh)}</div>;
  }

  if (!project.detail) {
    return <div className="project-detail__error-wrapper">{createAlert("Can not get project information. Please try again!", project.refresh)}</div>;
  }

  return (
    <PageProjectDetailContext.Provider value={{
      project: project.detail,
      patchProject: project.patchProject,
    }}>
      <div className="project-detail">
        <Outlet/>
      </div>
    </PageProjectDetailContext.Provider>
  );
}

export function usePageProjectDetail(): TPageProjectDetailProvider {
  return React.useContext(PageProjectDetailContext);
}
