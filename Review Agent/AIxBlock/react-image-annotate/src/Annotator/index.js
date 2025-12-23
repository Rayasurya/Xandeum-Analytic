// @flow

import type { Action, Image, MainLayoutState } from "../MainLayout/types"
import React, {useCallback, useEffect, useReducer, useRef, MutableRefObject} from "react"
import makeImmutable, { without } from "seamless-immutable"
import type { KeypointsDefinition } from "../ImageCanvas/region-tools"
import MainLayout from "../MainLayout"
import SettingsProvider from "../SettingsProvider"
import combineReducers from "./reducers/combine-reducers.js"
import generalReducer from "./reducers/general-reducer.js"
import historyHandler from "./reducers/history-handler.js"
import imageReducer from "./reducers/image-reducer.js"
import useEventCallback from "use-event-callback"
import videoReducer from "./reducers/video-reducer.js"
import getActiveImage from "./reducers/get-active-image"
import { convertFromRIARegionFmt } from "../utils/ria-format"
import "../bootstrap.scss"
import "../site.scss"
import Predictor from "../Predictor";

type Props = {
  taskDescription?: string,
  allowedArea?: { x: number, y: number, w: number, h: number },
  regionTagList?: Array<string>,
  regionClsList?: Array<string>,
  imageTagList?: Array<string>,
  imageClsList?: Array<string>,
  enabledTools?: Array<string>,
  selectedTool?: String,
  // showTags?: boolean,
  selectedImage?: string | number,
  images?: Array<Image>,
  showPointDistances?: boolean,
  pointDistancePrecision?: number,
  // RegionEditLabel?: Node,
  onExit: (MainLayoutState) => any,
  videoTime?: number,
  videoSrc?: string,
  keyframes?: Object,
  videoName?: string,
  keypointDefinitions: KeypointsDefinition,
  fullImageSegmentationMode?: boolean,
  autoSegmentationOptions?:
    | {| type: "simple" |}
    | {| type: "autoseg", maxClusters?: number, slicWeightFactor?: number |},
  hideHeader?: boolean,
  hideHeaderText?: boolean,
  hideNext?: boolean,
  hidePrev?: boolean,
  hideClone?: boolean,
  hideSettings?: boolean,
  hideFullScreen?: boolean,
  hideSave?: boolean,
  // annotations: Array<{[k:string]: any}>,
  // onSelectAnnotation?: CallableFunction<() => void>,
  // currentAnnotation: {[k:string]: any},
  hideHistory: Boolean,
  // onMenuClick: CallableFunction<() => void>,
  // onDeleteAnnotation: CallableFunction<(id: number) => void>,
  mlBackend: string,
  clsColorsList: { [k: string]: string },
  task: { [k: string]: string } | null,
  tasks: Array<{ [k: string]: string }> | null,
  skeletonList: { [k: string]: object },
  hasMlAssisted?: boolean,
  predictConfigRef: MutableRefObject,
  predictUrlRef: MutableRefObject,
  checkingPredictConfigRef: MutableRefObject,
  getPredictConfigRef: MutableRefObject,
  predictTask: string,
  predictModel: string,
}

export const Annotator = ({
  images,
  allowedArea,
  selectedImage = images && images.length > 0 ? 0 : undefined,
  showPointDistances,
  pointDistancePrecision,
  // showTags = getFromLocalStorage("showTags", false),
  enabledTools = [
    "select",
    "create-point",
    "create-box",
    "create-oval",
    "create-polygon",
    "create-line",
    "create-expanding-line",
    "show-mask",
  ],
  selectedTool = "select",
  regionTagList = [],
  regionClsList = [],
  imageTagList = [],
  imageClsList = [],
  keyframes = {},
  taskDescription = "",
  fullImageSegmentationMode = true,
  // RegionEditLabel,
  videoSrc,
  videoTime = 0,
  videoName,
  onExit,
  onNextImage,
  onPrevImage,
  keypointDefinitions,
  autoSegmentationOptions = { type: "autoseg" },
  hideHeader,
  hideHeaderText,
  hideNext,
  hidePrev,
  hideClone,
  hideSettings,
  hideFullScreen,
  hideSave,
  allowComments,
  // annotations = [],
  // onSelectAnnotation = function () {},
  // currentAnnotation,
  hideHistory = false,
  // onMenuClick = function () {},
  // onDeleteAnnotation = function () {},
  // mlBackend = null,
  clsColorsList = {},
  task = null,
  tasks = [],
  projectId = 0,
  onExpand,
  skeletonList = {},
  hasMlAssisted = false,
  predictConfigRef,
  predictUrlRef,
  checkingPredictConfigRef,
  getPredictConfigRef,
  predictTask,
  predictModel,
}: Props) => {
  let apiHostname = window.APP_SETTINGS?.hostname ?? "/"

  if (!apiHostname.startsWith("http")) {
    // eslint-disable-next-line no-restricted-globals
    apiHostname = location.protocol + "//" + location.host
  }

  if (apiHostname.endsWith("/")) {
    apiHostname = apiHostname.substring(0, apiHostname.length - 1);
  }

  const annotationType = images ? "image" : "video"
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  if (typeof selectedImage === "string") {
    selectedImage = (images || []).findIndex((img) => img.src === selectedImage)
    if (selectedImage === -1) selectedImage = undefined
  }

  // if (annotationType === "image") {
  //   const clsListLower = {};
  //   const clsColorsListLower = {};
  //
  //   for (let i = 0; i < regionClsList; i++) {
  //     clsListLower[regionClsList[i].toLowerCase()] = regionClsList[i];
  //   }
  //
  //   for (const k in clsColorsList) {
  //     clsColorsListLower[k.toLowerCase()] = clsColorsList[k];
  //   }
  //
  //   images = images.map(img => {
  //     img.regions = img.regions
  //       .filter(region => typeof region === "object")
  //       .map(region => {
  //         let clsLower = region?.cls?.toLowerCase();
  //
  //         if (clsLower && typeof clsListLower[clsLower] !== "string") {
  //           regionClsList = [...regionClsList, region.cls];
  //           clsColorsList = {...clsColorsList};
  //           clsColorsList[region.cls] = "#FFFFFF";
  //         }
  //
  //         return {
  //           ...region,
  //           color: clsColorsListLower[clsLower ?? ""] ?? region?.color,
  //         };
  //       });
  //
  //     return img;
  //   });
  // }

  let _dispatcherBridge
  let dispatcherBridge = (action) => _dispatcherBridge(action)

  /**
   * @type {MainLayoutState} state
   * @type {(action: Action) => MainLayoutState} dispatchToReducer
   */
  const [state, dispatchToReducer] = useReducer(
    historyHandler(
      combineReducers(
        annotationType === "image" ? imageReducer : videoReducer,
        generalReducer
      )
    ),
    makeImmutable({
      annotationType,
      showTags: true,
      allowedArea,
      showPointDistances,
      pointDistancePrecision,
      selectedTool,
      fullImageSegmentationMode: fullImageSegmentationMode,
      autoSegmentationOptions,
      mode: null,
      taskDescription,
      showMask: true,
      labelImages: imageClsList.length > 0 || imageTagList.length > 0,
      // labelImages: true,
      regionClsList,
      regionTagList,
      // imageClsList : ["Label 1", "Label 2"],
      imageTagList,
      currentVideoTime: videoTime,
      enabledTools,
      history: [],
      videoName,
      keypointDefinitions,
      allowComments,
      ...(annotationType === "image"
        ? {
            selectedImage,
            images,
            selectedImageFrameTime:
              images && images.length > 0 ? images[0].frameTime : undefined,
          }
        : {
            videoSrc,
            keyframes,
          }),
      dispatch: dispatcherBridge,
      loadingText: null,
      errorText: null,
      mlBackend: "",
      clsColorsList,
      task,
      tasks,
      annotations: task.annotations,
      annotationId: null,
      saveState: null,
      isLoadingImage: true,
      pointRef: null,
      isImageError: false,
      fetchingMlBackend: false,
      skeletonList,
      predicts: [],
      projectId,
      failedToGetMlBackend: false,
    })
  )

  const dispatch = useEventCallback((action: Action) => {
    if (action.type === "HEADER_BUTTON_CLICKED") {
      if (["Exit", "Done", "Complete"].includes(action.buttonName)) {
        return onExit(without(state, "history"))
      } else if (action.buttonName === "Next" && onNextImage) {
        return onNextImage(without(state, "history"))
      } else if (action.buttonName === "Prev" && onPrevImage) {
        return onPrevImage(without(state, "history"))
      } else if (action.buttonName === "Save") {
        dispatchToReducer({ type: "SAVE_REGIONS" })
        return
      } else if (action.buttonName === "Expand") {
        dispatchToReducer({ type: "EXPAND" })
        return
      }
    } else if (action.type === "REFRESH_ANNOTATIONS") {
      dispatchToReducer({
        type: "SHOW_LOADING",
        text: "Loading annotations...",
      })

      fetch(apiHostname + "/api/tasks/" + state.task.id)
        .then(async (res) => {
          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.detail ?? res.message)
          }

          return data
        })
        .then((res) => {
          if (!mountedRef.current) return

          dispatchToReducer({
            type: "SET_ANNOTATIONS",
            annotations: res.annotations,
          })

          dispatchToReducer({ type: "HIDE_LOADING" })
        })
        .catch((e) => {
          if (!mountedRef.current) return
          console.error(e)
          dispatchToReducer({ type: "HIDE_LOADING" })
          dispatchToReducer({ type: "SHOW_ERROR", text: e.message })
        })

      return
    } else if (action.type === "CREATE_ANNOTATION") {
      dispatchToReducer({
        type: "SHOW_LOADING",
        text: "Creating new annotation...",
      })

      fetch(apiHostname + "/api/tasks/" + state.task.id + "/annotations", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          result: action.annotations ?? [],
        }),
      })
        .then(async (res) => {
          const data = await res.json()

          if (!res.ok) {
            console.log(data)
            throw new Error(data.detail ?? res.message)
          }

          return data
        })
        .then((res) => {
          if (!mountedRef.current) return

          dispatchToReducer({
            type: "SET_ANNOTATIONS",
            annotations: [...state.annotations, res],
          })
          dispatchToReducer({ type: "SELECT_ANNOTATION", annotationId: res.id })
          dispatchToReducer({ type: "HIDE_LOADING" })
        })
        .catch((e) => {
          if (!mountedRef.current) return
          console.error(e)
          dispatchToReducer({ type: "HIDE_LOADING" })
          dispatchToReducer({ type: "SHOW_ERROR", text: e.message })
        })

      return
    } else if (action.type === "DELETE_ANNOTATION") {
      const remainAnnotations = state.annotations.filter(
        (a) => a.id !== action.annotationId
      );

      dispatchToReducer({
        type: "SHOW_LOADING",
        text: "Deleting annotation...",
      })

      fetch(apiHostname + "/api/annotations/" + action.annotationId, {
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      })
        .then(async (res) => {
          if (!mountedRef.current) return

          if (!res.ok) {
            throw new Error(res.message ?? res.statusText)
          }

          dispatchToReducer({ type: "HIDE_LOADING" })
          dispatchToReducer({type: "SET_ANNOTATIONS", annotations: remainAnnotations});
          dispatchToReducer({
            type: "SELECT_ANNOTATION",
            annotationId: remainAnnotations.length > 0 ? remainAnnotations[remainAnnotations.length - 1].id : null,
          })

          if (remainAnnotations.length === 0) {
            dispatchToReducer({ type: "CLEAR_ALL_REGIONS" })
          }
        })
        .catch((e) => {
          if (!mountedRef.current) return
          console.error(e)
          dispatchToReducer({ type: "HIDE_LOADING" })
          dispatchToReducer({ type: "SHOW_ERROR", text: e.message })
        })

      return
    } else if (action.type === "LOAD_ML_BACKEND") {
      getPredictConfigRef.current(new AbortController());
    }

    dispatchToReducer(action)
  })

  _dispatcherBridge = dispatch
  window.riaDispatch = dispatch;

  useEffect(() => {
    if (selectedImage === undefined) return
    dispatchToReducer({
      type: "SELECT_IMAGE",
      imageIndex: selectedImage,
      image: state.images[selectedImage],
    })
  }, [selectedImage, state.images])

  useEffect(() => {
    if (!state.task) return
    dispatch({
      type: "SELECT_ANNOTATION",
      annotationId: (task?.annotations ?? []).length === 0 ? null : task.annotations[task.annotations.length - 1].id,
    })
  }, [dispatch, state.task, task.annotations])

  const refSaveAnnotation = useRef();

  useEffect(() => {
    if (state.saveState !== "start") {
      return
    }

    function getRegions() {
      if (state.images) {
        const { activeImage } = getActiveImage(state)
        return activeImage?.regions?.map(convertFromRIARegionFmt) ?? []
      } else if (state.videoSrc) {
        const newKeyframes = {}

        for (const key in state.keyframes) {
          newKeyframes[key] = {
            regions: state.keyframes[key].regions.map(convertFromRIARegionFmt),
          }
        }

        return [{ keyframes: newKeyframes }]
      }
    }

    const regions = getRegions();

    if (!state.annotationId && regions.length === 0) {
      // This condition will prevent creating new annotation after deleted the last annotation
      return;
    }

    clearTimeout(refSaveAnnotation.current);
    const controller = new AbortController();

    refSaveAnnotation.current = setTimeout(() => {
      if (controller.signal.aborted) return;

      if (state.annotationId) {
        fetch(apiHostname + "/api/annotations/" + state.annotationId, {
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
          body: JSON.stringify({
            result: regions,
          }),
          signal: controller.signal,
        })
          .then(() => {
            if (controller.signal.aborted) return;
            if (!mountedRef.current) return
            dispatchToReducer({
              type: "UPDATE_RESULT",
              annotationId: state.annotationId,
              formattedResult: regions,
            })
            dispatchToReducer({ type: "REGIONS_SAVED" });
          })
          .catch((e) => {
            if (controller.signal.aborted) return;
            if (!mountedRef.current) return
            console.error(e)
            dispatchToReducer({ type: "SAVE_FAILED" })
            dispatchToReducer({ type: "HIDE_LOADING" })
            dispatchToReducer({
              type: "SHOW_ERROR",
              text: "An error occurred while saving the annotation. Please try again by pressing the Save button manually.",
            })
          });
      } else {
        dispatchToReducer({ type: "REGIONS_SAVED" });
        dispatch({ type: "CREATE_ANNOTATION", annotations: getRegions() });
      }
    }, 1000);

    return () => {
      controller.abort("Unmounted");
    };
  }, [state.saveState, state.annotationId, state, apiHostname, dispatch])

  useEffect(() => {
    onExpand && onExpand(state.isExpand)
  }, [onExpand, state.isExpand])

  const refreshMlBackendTimeout = useRef();

  const checkMlBackend = useCallback(() => {
    clearTimeout(refreshMlBackendTimeout.current);

    if (!hasMlAssisted) {
      return;
    }

    if (window.APP_SETTINGS.debugPredictUrl && ["127.0.0.1", "localhost", "dev-us-west-1.aixblock.io"].includes(window.location.hostname)) {
      dispatch({ type: "SET_ML_BACKEND", url: window.APP_SETTINGS.debugPredictUrl });
      return;
    }

    function scheduleCheckAgain() {
      clearTimeout(refreshMlBackendTimeout.current);
      refreshMlBackendTimeout.current = setTimeout(() => checkMlBackend(), 1000);
    }

    if (checkingPredictConfigRef.current) {
      dispatch({type: "START_FETCHING_ML_BACKEND"});
    } else {
      dispatch({type: "STOP_FETCHING_ML_BACKEND"});
    }

    if (predictUrlRef.current && predictConfigRef.current) {
      dispatch({ type: "SET_ML_BACKEND", url: predictUrlRef.current });
    } else {
      if (!checkingPredictConfigRef.current) {
        dispatchToReducer({type: "FAILED_TO_GET_ML_BACKEND"});
      }
    }

    scheduleCheckAgain();

    // let error;
    // dispatch({type: "START_FETCHING_ML_BACKEND"});
    //
    // fetch(apiHostname + "/api/projects/" + projectId + "/tensorboard/", {
    //   headers: { "Content-Type": "application/json" },
    //   method: "GET",
    //   signal: controller.signal,
    // })
    //   .then(async r => {
    //     if (controller.signal.aborted) return;
    //     let success = false;
    //
    //     if (r.ok) {
    //       const data = await r.json();
    //
    //       if (typeof data === "object" && typeof data["proxy_url"] === "string") {
    //         data["proxy_url"] = data["proxy_url"].trim();
    //
    //         if (data["proxy_url"].length > 0) {
    //           if (!data["proxy_url"].endsWith("/")) {
    //             data["proxy_url"] = data["proxy_url"] + "/";
    //           }
    //
    //           try {
    //             const r2 = await fetch(data["proxy_url"]);
    //             if (controller.signal.aborted) return;
    //
    //             if (r2.ok) {
    //               dispatch({ type: "SET_ML_BACKEND", url: data["proxy_url"] + "action" });
    //               success = true;
    //             }
    //           } catch (e) {
    //             error = e.toString();
    //           }
    //         }
    //       }
    //     }
    //
    //     if (!success) {
    //       error = "Failed to get ML backend. Error: " + r.statusText;
    //     }
    //   })
    //   .catch(e => {
    //     if (controller.signal.aborted) return;
    //
    //     if (e instanceof Error) {
    //       error = e.message;
    //     } else {
    //       error = "Failed to get ML backend. Error: " + e.toString();
    //     }
    //   })
    //   .finally(() => {
    //     if (controller.signal.aborted) return;
    //     dispatch({type: "STOP_FETCHING_ML_BACKEND"});
    //
    //     if (error) {
    //       clearTimeout(refreshMlBackendTimeout.current);
    //       refreshMlBackendTimeout.current = setTimeout(() => loadMlBackend(controller), 30000);
    //       // dispatchToReducer({type: "SHOW_ERROR", text: error});
    //       dispatchToReducer({type: "FAILED_TO_GET_ML_BACKEND"});
    //     }
    //   });
  }, [ hasMlAssisted, dispatch ]);

  useEffect(() => {
    checkMlBackend();

    return () => {
      dispatchToReducer({ type: "CLEAR_PREDICTS" });
      clearTimeout(refreshMlBackendTimeout.current);
    }
  }, [checkMlBackend, dispatchToReducer]);

  if (!images && !videoSrc) {
    return 'Missing required prop "images" or "videoSrc"'
  }
  

  return (
    <div className="ria">
      <SettingsProvider>
        <MainLayout
          // RegionEditLabel={RegionEditLabel}
          // alwaysShowNextButton={Boolean(onNextImage)}
          // alwaysShowPrevButton={Boolean(onPrevImage)}
          state={state}
          dispatch={dispatch}
          // onRegionClassAdded={onRegionClassAdded}
          hideHeader={hideHeader}
          hideHeaderText={hideHeaderText}
          hideNext={hideNext}
          hidePrev={hidePrev}
          hideClone={hideClone}
          hideSettings={hideSettings}
          hideFullScreen={hideFullScreen}
          hideSave={hideSave}
          // annotations={annotations}
          // onSelectAnnotation={onSelectAnnotation}
          // currentAnnotation={currentAnnotation}
          hideHistory={hideHistory}
          // onMenuClick={onMenuClick}
          // onDeleteAnnotation={onDeleteAnnotation}
          projectId={projectId}
        />
        <Predictor state={state} dispatch={dispatch} predictConfigRef={predictConfigRef} predictTask={predictTask} predictModel={predictModel} />
      </SettingsProvider>
    </div>
  )
}

export default Annotator
