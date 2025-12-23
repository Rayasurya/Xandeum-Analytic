import React from "react";
import {TTaskModel} from "@/models/task";
import {TProjectModel} from "@/models/project";
import useLibraryHook from "@/hooks/editor/useLibraryHook";
import AppLoading from "../../AppLoading/AppLoading";

export type TProps = {
  rootElement?: HTMLDivElement | null,
  project: TProjectModel,
  task: TTaskModel,
}

export default function TDE({project, task}: TProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const {isLoading, isLoaded, error} = useLibraryHook({
    scripts: window.APP_SETTINGS.tdeJS ? [window.APP_SETTINGS.tdeJS] : [],
    styles: window.APP_SETTINGS.tdeCSS ? [window.APP_SETTINGS.tdeCSS] : [],
    isAvailable: () => Object.hasOwn(window, "TDE"),
  });

  const labels = React.useMemo(() => {
    // @ts-ignore
    const labelsAttrs: {background: string}[] = project.parsed_label_config?.label?.labels_attrs ?? {};
    const list = Object.keys(labelsAttrs);

    return list.map(l => {
      // @ts-ignore
      return {label: l, color: (labelsAttrs[l] ?? {background: "red"}).background}
    });
    // @ts-ignore
  }, [project.parsed_label_config?.label?.labels_attrs]);

  React.useEffect(() => {
    if (!isLoaded || !rootRef.current || !window.TDE) {
      return;
    }

    window.TDE({
      classes: labels,
      imageUrl: task.data.pcd,
      onClose: () => void 0,
      task,
    }, rootRef.current);
  }, [labels, isLoaded, rootRef, project, task]);

  if (isLoading) {
    return <AppLoading message={"Loading editor..."}/>;
  }

  if (error) {
    return <>{error}</>;
  }

  return (
    <div className="tde-editor" ref={rootRef}/>
  );
}
