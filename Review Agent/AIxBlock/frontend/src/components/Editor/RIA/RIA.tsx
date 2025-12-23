import React, { memo } from "react";
import { TTaskModel } from "@/models/task";
import { TProjectModel } from "@/models/project";
import useLibraryHook from "@/hooks/editor/useLibraryHook";
import AppLoading from "../../AppLoading/AppLoading";
import { parseLabels } from "@/utils/labelConfig";
import usePredictConfigHook from "@/pages/Flow/usePredictConfigHook";
import {getPredictModel, getPredictTask} from "@/utils/models";

export type TProps = {
  rootElement?: HTMLDivElement | null;
  project: TProjectModel;
  task: TTaskModel;
  tools: string[];
  tasks?: TTaskModel[];
  onTaskSelect?: (task: TTaskModel) => void;
  hasMlAssisted?: boolean;
};

const Editor = ({
  project,
  task,
  tools,
  hasMlAssisted,
}: TProps) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { isLoading, isLoaded, error } = useLibraryHook({
    scripts: window.APP_SETTINGS.riaJS ? [window.APP_SETTINGS.riaJS] : [],
    styles: window.APP_SETTINGS.riaCSS ? [window.APP_SETTINGS.riaCSS] : [],
    isAvailable: () => Object.hasOwn(window, "RIA"),
  });

  const {predictUrlRef, predictConfigRef, checkingPredictConfigRef, getPredictConfigRef} = usePredictConfigHook({
    projectPredictConfig: project.predict_config,
    hasMlAssisted: !!hasMlAssisted,
    predictTask: getPredictTask(project.label_config_title),
    projectId: project.id,
  });

  const labels: {
    clsColorsList: { [k: string]: string };
    skeletonList: { [k: string]: any };
    regionClsList: string[];
  } = React.useMemo(() => {
    const { labels, labelsColorMap, skeletonList } = parseLabels(project.label_config);
    // @ts-ignore
    return {
      clsColorsList: labelsColorMap,
      regionClsList: labels,
      skeletonList,
    };
    // @ts-ignore
  }, [project.label_config]);

  React.useEffect(() => {
    if (!isLoaded || !rootRef.current || !window.RIA) {
      return;
    }

    const closeEditor = window.RIA(
      {
        images: [
          {
            src: task.data.image,
            name: `Task #${task.id}`,
            regions: [],
          },
        ],
        enabledTools: tools,
        // mlBackend: mlBackend,
        selectedImage: undefined,
        showTags: false,
        regionClsList: labels.regionClsList,
        hideNext: true,
        hidePrev: true,
        clsColorsList: labels.clsColorsList,
        task,
        projectId: project.id,
        skeletonList: labels.skeletonList,
        hasMlAssisted,
        predictConfigRef,
        predictUrlRef,
        checkingPredictConfigRef,
        getPredictConfigRef,
        predictTask: getPredictTask(project.label_config_title),
        predictModel: getPredictModel(project.label_config_title),
      },
      rootRef.current
    );

    return () => {
      closeEditor();
    }
    // eslint-disable-next-line
  }, [
    labels,
    isLoaded,
    rootRef,
    tools,
    /*mlBackend,*/ project.id,
    task.id,
    hasMlAssisted,
    project.label_config_title,
  ]);

  if (isLoading) {
    return <AppLoading message={"Loading editor..."} />;
  }

  if (error) {
    return <>{error}</>;
  }

  return <div ref={rootRef} style={{ height: "100%" }} />;
}

const RIA = memo(Editor, (p, n) => {
  return p.task.id === n.task.id
    && p.project.id === n.project.id
    && p.project.label_config === n.project.label_config;
});

export default RIA;
