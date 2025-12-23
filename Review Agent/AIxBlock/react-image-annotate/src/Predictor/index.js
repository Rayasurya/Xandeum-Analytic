import { MainLayoutState } from "../MainLayout/types";
import type { Action } from "../MainLayout/types";
import { MutableRefObject, useMemo } from "react";
import Runner from "./runner";
// import Params from "./params";

export default function Predictor({state, dispatch, predictConfigRef, predictTask, predictModel}: {
  state: MainLayoutState,
  dispatch: (action: Action) => MainLayoutState,
  predictConfigRef: MutableRefObject,
  predictTask: string,
  predictModel: string,
}) {
  const image = useMemo(() => {
    try {
      return state.images[state.selectedImage]
    } catch {
      return null;
    }
  }, [state.images, state.selectedImage]);

  const imageBase64 = useMemo(() => {
    return image?.base64;
  }, [image.base64]);

  const predicts = useMemo(() => {
    if (!state.mlBackend || state.predicts.length === 0 || !image || !imageBase64 || !image.pixelSize) {
      return [];
    }

    return state.predicts;
  }, [state.mlBackend, image, state.predicts]);

  // const readyPredicts = useMemo(() => {
  //   return predicts.filter(p => !!p.confidence_threshold && !!p.iou_threshold);
  // }, [predicts]);
  //
  // const notReadyPredicts = useMemo(() => {
  //   return predicts.filter(p => !p.confidence_threshold || !p.iou_threshold);
  // }, [predicts]);

  return (
    <>
      {predicts.length > 0 && (
        <Runner
          key={predicts[0].id}
          url={state.mlBackend}
          predict={predicts[0]}
          imageBase64={imageBase64}
          imageW={image.pixelSize.w}
          imageH={image.pixelSize.h}
          dispatch={dispatch}
          projectId={state.projectId}
          regionClsList={state.regionClsList}
          enabledTools={state.enabledTools}
          taskId={state.task.id}
          predictConfigRef={predictConfigRef}
          predictTask={predictTask}
          predictModel={predictModel}
        />
      )}
      {/*{notReadyPredicts.length > 0 && (
        <Params
          predict={notReadyPredicts[0]}
          dispatch={dispatch}
          projectId={state.projectId}
        />
      )}*/}
    </>
  );
}
