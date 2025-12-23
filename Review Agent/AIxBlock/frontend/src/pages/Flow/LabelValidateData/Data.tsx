import {useFlowProvider} from "../FlowProvider";
import {default as BaseData} from "../Shared/Data/Data";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

export default function Data() {
  const {project, patchProject, flowStatus, permission} = useFlowProvider();

  if (!project) {
    return <EmptyContent message="Project is not found" />;
  }

  return (
    <BaseData
      baseUrl={"/label-and-validate-data/" + project.id}
      project={project}
      patchProject={patchProject}
      noTraining={true}
      noDeploy={true}
      hasMlAssisted={flowStatus.hasMlAssisted}
      permission={permission}
    />
  );
}
