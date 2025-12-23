import Data from "../Flow/Shared/Data/Data";
import {usePageProjectDetail} from "./Detail";
import useProjectPermission from "@/hooks/project/useProjectPermission";
import {useAuth} from "@/providers/AuthProvider";
import {Navigate} from "react-router-dom";

export default function DataV2() {
  const {project, patchProject} = usePageProjectDetail();
  const {user} = useAuth();
  const permission = useProjectPermission({project, user});

  return (
    <>
      <Data
        baseUrl={"/projects/" + project.id}
        project={project}
        patchProject={patchProject}
        permission={permission}
        noTraining={true}
        noDeploy={true}
      />
    </>
  )
}

export function GotoLegacyDataUpload() {
  const {project} = usePageProjectDetail();
  return <Navigate to={`/projects/${project.id}/import/local`} replace={true} />
}
