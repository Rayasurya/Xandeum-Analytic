import {TProjectModel} from "@/models/project";
import {useMemo} from "react";
import {parseLabels} from "@/utils/labelConfig";
import {TUseProjectHook} from "@/hooks/project/useProjectHook";
import LabelManager from "./LabelManager/LabelManager";

export type TProps = {
  project: TProjectModel;
  patchProject: TUseProjectHook["patchProject"];
}

export default function Labels({project, patchProject}: TProps) {
  const dataLabel = useMemo(() => {
    return parseLabels(project.label_config);
  }, [project.label_config]);

  const labelsRoots = useMemo(() => {
    return Array.from(dataLabel?.labelsRoots ?? []);
  }, [dataLabel?.labelsRoots]);

  return (
    <>
      {
        labelsRoots.length > 0
          ? (
            <LabelManager
              labelsRoot={labelsRoots[0]}
              projectID={project.id}
              updateLabelConfig={(labelConfig) => {
                patchProject({label_config: labelConfig}, true);
              }}
            />
          )
          : <>No label root found</>
      }
    </>
  );
}
