import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Navigate, useLocation, useParams} from "react-router-dom";
import useProjectHook from "@/hooks/project/useProjectHook";
import { ProjectProvider } from "@/providers/ProjectProvider";
import General from "./General/General";
import { getPath } from "./LayoutSettings/utils";
import ML from "./ML/ML";
import Webhooks from "./Webhooks/Webhooks";
import LabelSetup from "./LabelSetup/LabelSetup";
import Members from "./Members/Members";
import Workflow from "./WorkFlow/Workflow";
// import Crowds from "./Crowds/Crowds";
import LocalUpload from "./LocalUpload/LocalUpload";
import CloudStorage from "./CloudStorage/CloudStorage";
import CrawlData from "./CrawlData/CrawlData";
import ContactUs from "./ContactUs/ContactUs";
import LayoutSettings from "./LayoutSettings/Index";
import { useUserLayout } from "@/layouts/UserLayout";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import {usePageProjectDetail} from "../Detail";
import {TProjectModel} from "@/models/project";
import DataSetHubs from "./DataSetHubs/Index";
import {useCentrifuge} from "@/providers/CentrifugoProvider";

export enum DATATYPE {
  RAWDATA = "RAWDATA",
  DATASET = "DATASET",
}

const LayoutStepsSettings = () => {
  const params = useParams();
  const projectID = parseInt(params.projectID ?? "0");
  const { detail, initialized, fetchData, loading, loadingError, setDetail } = useProjectHook(projectID);
  const location = useLocation();
  const userLayout = useUserLayout();
  const activeStep = getPath(location.pathname, 1);
  const [importDataType, setImportDataType] = useState<DATATYPE>(DATATYPE.RAWDATA);
  const {patchProject} = usePageProjectDetail();
  const {onProjectMessage} = useCentrifuge();

  useBooleanLoader(!initialized || loading, "Loading project information...");

  const updateProjectInfo = useCallback((project: TProjectModel) => {
    setDetail(project);
    patchProject(project, true);
  }, [patchProject, setDetail]);

  const settings = useMemo(() => {
    if (!detail) {
      return <></>;
    }

    switch (true) {
      case activeStep === "general":
        return <General data={detail} refetch={fetchData} />;
      case activeStep === "ml":
        return <ML data={detail} />;
      case activeStep === "webhooks":
        return <Webhooks data={detail} />;
      case activeStep === "labels":
        return <LabelSetup data={detail} setNewDataProject={updateProjectInfo} />;
      case activeStep === "members":
        return <Members data={detail} />;
      case activeStep === "workflow":
        return <Workflow data={detail} setNewDataProject={updateProjectInfo} />;
      // case activeStep === "crowdsource":
      //   return <Crowds data={detail} />;
      default:
        return <></>;
    }
  }, [activeStep, detail, fetchData, updateProjectInfo]);

  const imports = useMemo(() => {
    switch (true) {
      case activeStep === "local":
        return <LocalUpload data={detail} importDataType={importDataType} />;
      case activeStep === "cloud":
        return <CloudStorage data={detail} importDataType={importDataType} />;
      case activeStep === "internet":
        return <CrawlData data={detail} />;
      case activeStep === "contact_us":
        return <ContactUs data={detail} />;
      case activeStep === "dataset_hubs":
        return <DataSetHubs data={detail} />;
      // case activeStep === "dataset_on_git":
      //   return <DataSetOnGit data={detail} />;
      default:
        return <></>;
    }
  }, [activeStep, detail, importDataType]);

  const layout = useMemo(() => {
    return (
      <LayoutSettings.Container projectId={projectID}>
        <LayoutSettings.Header importDataType={importDataType} setImportDataType={setImportDataType} />
        {getPath(location.pathname, 2) === "settings" ? settings : imports}
      </LayoutSettings.Container>
    );
  }, [settings, imports, location.pathname, projectID, importDataType]);

  const handleProjectMessage = React.useCallback((data: object) => {
    if (!detail) {
      return;
    }

    if ("label_config" in data) {
      setDetail({...detail, label_config: String(data["label_config"])});
    }
  }, [detail, setDetail]);

  React.useEffect(() => {
    if (projectID <= 0) {
      return;
    }

    const unsubscribe = onProjectMessage(projectID, handleProjectMessage);

    return () => {
      unsubscribe();
    }
  }, [handleProjectMessage, onProjectMessage, projectID]);

  useEffect(() => {
    userLayout.setNavDataProject(detail);

    if (Number(projectID) > 0) {
      userLayout.setCloseCallback("/projects/" + projectID + "/data");
    } else {
      userLayout.setCloseCallback("/projects");
    }

    return () => {
      userLayout.clearNavDataProject();
      userLayout.clearCloseCallback();
    };
  }, [userLayout, detail, projectID]);

  useEffect(() => {
    if (activeStep && (activeStep === "dataset_hubs" || activeStep === "dataset_on_git")) {
      setImportDataType(DATATYPE.DATASET)
    }
  }, [activeStep]);

  if (loading) {
    return <p className="no-results">Loading project...</p>;
  }

  if (loadingError && !detail) {
    return <p className="no-results">{loadingError}</p>;
  }

  return <>{layout}</>;
};

const ProjectSettings = () => {
  return (
    <ProjectProvider>
      <LayoutStepsSettings />
    </ProjectProvider>
  );
};

export const GotoGeneralSettings = () => {
  const {project} = usePageProjectDetail();
  return <Navigate to={`/projects/${project.id}/settings/general`} replace={true} />
}

export default ProjectSettings;
