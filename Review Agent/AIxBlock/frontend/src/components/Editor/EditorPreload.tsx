import {TProjectModel} from "@/models/project";
import React from "react";
import RIAPreload from "./RIA/RIAPreload";
import LSFPreload from "./LSF/LSFPreload";
import TDEPreload from "./TDE/TDEPreload";

export type TProps = {
  project: TProjectModel,
}

export default function EditorPreload({project}: TProps) {
  return React.useMemo(() => {
    if (Object.hasOwn(project.data_types, "image")) {
      return <RIAPreload />;
    } else if (Object.hasOwn(project.data_types, "pcd")) {
      return <TDEPreload />;
    } else {
      return <LSFPreload />;
    }
  }, [project]);
}
