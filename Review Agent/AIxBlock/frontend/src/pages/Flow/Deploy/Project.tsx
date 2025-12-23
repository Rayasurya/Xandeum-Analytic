import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProject } from "@/hooks/project/create/useCreateProject";
import { TProjectModel } from "@/models/project";
import { useFlowProvider } from "../FlowProvider";
import CreateProject from "../Shared/CreateProject";
import DeployLayout from "./DeployLayout";
import {useLoader} from "@/providers/LoaderProvider";
import { getDefaultProjectData } from "../defaultProjectData";

export default function Project() {
  const {project, patchProject} = useFlowProvider();
  const navigate = useNavigate();
  const {waitingForPromise} = useLoader();

  const initialProjectData = useMemo(() => {
    return getDefaultProjectData({
      flow: "deploy",
      title: project?.title,
      color: project?.color,
      config: project?.label_config,
      configTitle: project?.label_config_title,
      annotationTemplateId: project?.annotation_template,
    });
  }, [project?.title, project?.color, project?.label_config, project?.label_config_title, project?.annotation_template]);

  const [generalData, setGeneralData] = useState<Partial<TProjectModel>>(initialProjectData);

  const { error, loading, validationErrors, onCreate } = useCreateProject(generalData);

  const createProject = useCallback(() => {
    if (project && project.title === generalData.title && project.color === generalData.color) {
      navigate("/deploy/" + project.id + "/setup-infrastructure/gpu");
      return;
    }

    waitingForPromise(
      onCreate(project?.id).then(res => {
        if (!res) {
          return;
        }

        patchProject(res, true);
        navigate("/deploy/" + res.id + "/setup-infrastructure/gpu");
      }),
      project ? "Saving project..." : "Creating project...",
    );
  }, [project, generalData.title, generalData.color, waitingForPromise, onCreate, navigate, patchProject]);

  return (
    <DeployLayout
      onBack={() => {
        if (project) {
          navigate("/deploy/" + project.id + "/");
        } else {
          navigate("/deploy/");
        }
      }}
      onNext={createProject}
    >
      <CreateProject
        project={project}
        generalData={generalData}
        error={error}
        loading={loading}
        validationErrors={validationErrors}
        setGeneralData={setGeneralData}
      />
    </DeployLayout>
  );
}
