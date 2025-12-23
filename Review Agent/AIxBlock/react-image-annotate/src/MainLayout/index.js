// @flow

import { ConfirmDialog } from "../ConfirmDialog"
import type { Action, MainLayoutState } from "./types"
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { makeStyles } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { styled } from "@mui/material/styles"
// import ClassSelectionMenu from "../ClassSelectionMenu"
// import DebugBox from "../DebugSidebarBox"
import HistorySidebarBox from "../HistorySidebarBox"
import ImageCanvas from "../ImageCanvas"
// import KeyframeTimeline from "../KeyframeTimeline"
// import KeyframesSelector from "../KeyframesSelectorSidebarBox"
// import type { Node } from "react"
// import RegionSelector from "../RegionSelectorSidebarBox"
import SettingsDialog from "../SettingsDialog"
// import TagsSidebarBox from "../TagsSidebarBox"
// import TaskDescription from "../TaskDescriptionSidebarBox"
import Workspace from "../Workspace"
import classnames from "classnames"
import getActiveImage from "../Annotator/reducers/get-active-image"
import getHotkeyHelpText from "../utils/get-hotkey-help-text"
import iconDictionary from "./icon-dictionary"
import styles from "./styles"
import { useDispatchHotkeyHandlers } from "../ShortcutsManager"
import useEventCallback from "use-event-callback"
import useImpliedVideoRegions from "./use-implied-video-regions"
import useKey from "use-key-hook"
import { useSettings } from "../SettingsProvider"
import { withHotKeys } from "react-hotkeys"
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap"
import {Button, CircularProgress, Dialog, DialogActions} from "@mui/material"
import DialogContent from "@mui/material/DialogContent"
import { TextareaAutosize } from "@mui/material"
import PredictAudioRecorder from "../PredictAudioRecorder"
import PredictImageChooser from "../PredictImageChooser"
import { getPrompt, setPrompt } from "../utils/predict-prompt"
import CommentBox from "../CommentBox"
// import { IconFolder } from "../IconEditor"
import AllAnnotationBox from "../AllAnnotationBox"
// import { stateMock } from "./mock"
import { /*Icon2Point,*/ IconArrowDown/*, IconPoint, IconStop*/ } from "../CustomIcon"
import {getClsColor} from "../Annotator/reducers/general-reducer"
import DialogTitle from "@mui/material/DialogTitle";

// import Fullscreen from "../Fullscreen"

const emptyArr = []
import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const useStyles = makeStyles(() => styles)

const HotkeyDiv = withHotKeys(({ hotKeys, children, divRef, ...props }) => (
  <div {...{ ...hotKeys, ...props }} ref={divRef}>
    {children}
  </div>
))

const FullScreenContainer = styled("div")(() => ({
  width: "100%",
  height: "100%",
  position: "relative",
  "& .fullscreen": {
    width: "100%",
    height: "100%",
  },
}))

type Props = {
  state: MainLayoutState,
  dispatch: (Action) => any,
  // alwaysShowNextButton?: boolean,
  // alwaysShowPrevButton?: boolean,
  // RegionEditLabel?: Node,
  // onRegionClassAdded: () => {},
  hideHeader?: boolean,
  hideHeaderText?: boolean,
  hideNext?: boolean,
  hidePrev?: boolean,
  hideClone?: boolean,
  hideSettings?: boolean,
  hideFullscreen?: boolean,
  hideSave?: boolean,
  // annotations: Array<{[k:string]: any}>,
  // onSelectAnnotation: CallableFunction,
  // currentAnnotation: {[k:string]: any},
  hideHistory: boolean,
  // onMenuClick: CallableFunction,
  // onDeleteAnnotation: CallableFunction<(id: number) => void>,
  // action: Action,
  projectId: any,
  // onTaskSelect: CallableFunction<(task: any) => void>,
}

// const state = stateMock

export const MainLayout = ({
  state,
  dispatch,
  // alwaysShowNextButton = false,
  // alwaysShowPrevButton = false,
  // RegionEditLabel,
  // onRegionClassAdded,
  hideHeader,
  hideHeaderText,
  hideNext = false,
  hidePrev = false,
  hideClone = false,
  hideSettings = false,
  hideFullScreen = false,
  hideSave = false,
  // annotations,
  // onSelectAnnotation,
  // currentAnnotation,
  hideHistory = false,
  // onMenuClick = function () {},
  // onDeleteAnnotation = () => {},
  projectId,
  // onTaskSelect = (_task) => {},
}: Props) => {
  const classes = useStyles()
  const settings = useSettings()
  const fullScreenHandle = useFullScreenHandle()
  const [isClearRegionsConfirm, setIsClearRegionsConfirm] = useState(false)
  const [isDeleteAnnotationConfirm, setIsDeleteAnnotationConfirm] =
    useState(false)
  const [isOpen, setOpen] = useState(false)
  // const [showTasks, setShowTasks] = useState(true)
  const [predictPrompt, setPredictPrompt] = useState(
    getPrompt(projectId, state.regionClsList.join(", "))
  )
  const [predictAudio, setPredictAudio] = useState("")
  const [predictImageRef, setPredictImageRef] = useState("")
  const [predictImageRefLabel, setPredictImageRefLabel] = useState("")
  const [predictPointRef, setPredictPointRef] = useState(null)

  const memoizedActionFns = useRef({})
  const action = useCallback((type: string, ...params: Array<string>) => {
    const fnKey = `${type}(${params.join(",")})`
    if (memoizedActionFns.current[fnKey])
      return memoizedActionFns.current[fnKey]

    const fn = (...args: any) =>
      params.length > 0
        ? dispatch(
            ({
              type,
              ...params.reduce((acc, p, i) => ((acc[p] = args[i]), acc), {}),
            }: any)
          )
        : dispatch({ type, ...args[0] })
    memoizedActionFns.current[fnKey] = fn
    return fn
  }, [dispatch])

  const { currentImageIndex, activeImage } = getActiveImage(state)
  let nextImage
  if (currentImageIndex !== null) {
    nextImage = state.images[currentImageIndex + 1]
  }

  useKey(() => dispatch({ type: "CANCEL" }), {
    detectKeys: [27],
  })

  useKey(() => dispatch({ type: "DRAGGING_START" }), {
    detectKeys: [32],
    keyevent: "keydown",
  })

  useKey(() => dispatch({ type: "DRAGGING_STOP" }), {
    detectKeys: [32],
    keyevent: "keyup",
  })

  useKey(
    (key, event) => {
      if (event.ctrlKey) {
        if (key === 67 || key === 99) {
          dispatch({ type: "COPY_SELECTED_REGION" })
        } else if (key === 86 || key === 118) {
          dispatch({ type: "PASTE_COPIED_REGION" })
        }
      }
    },
    {
      detectKeys: ["c", "C", "v", "V"],
      keyevent: "keyup",
    }
  )

  useKey(() => dispatch({ type: "DELETE_SELECTED_REGION" }), {
    detectKeys: [46],
    keyevent: "keyup",
  })
  // const isAVideoFrame = activeImage && activeImage.frameTime !== undefined
  const innerContainerRef = useRef()
  const hotkeyHandlers = useDispatchHotkeyHandlers({ dispatch })
  const nextImageHasRegions =
    !nextImage || (nextImage.regions && nextImage.regions.length > 0)
  let impliedVideoRegions = useImpliedVideoRegions(state)

  const refocusOnMouseEvent = useCallback((e) => {
    if (!innerContainerRef.current) return
    if (innerContainerRef.current.contains(document.activeElement)) return
    if (innerContainerRef.current.contains(e.target)) {
      innerContainerRef.current.focus()
      e.target.focus()
    }
  }, [])

  const canvas = useMemo(
    () => (
      <ImageCanvas
        {...settings}
        showCrosshairs={
          settings.showCrosshairs &&
          !["select", "pan", "zoom"].includes(state.selectedTool)
        }
        key={state.selectedImage}
        // showMask={state.showMask}
        fullImageSegmentationMode={state.fullImageSegmentationMode}
        // autoSegmentationOptions={state.autoSegmentationOptions}
        showTags={state.showTags}
        allowedArea={state.allowedArea}
        modifyingAllowedArea={state.selectedTool === "modify-allowed-area"}
        // regionClsList={state.regionClsList}
        // regionTagList={state.regionTagList}
        regions={
          state.annotationType === "image"
            ? activeImage.regions.filter((f) => !f?.hidden) || []
            : impliedVideoRegions
        }
        realSize={activeImage ? activeImage.realSize : undefined}
        videoPlaying={state.videoPlaying}
        imageSrc={state.annotationType === "image" ? activeImage.src : null}
        videoSrc={state.annotationType === "video" ? state.videoSrc : null}
        pointDistancePrecision={state.pointDistancePrecision}
        createWithPrimary={state.selectedTool.includes("create")}
        dragWithPrimary={state.selectedTool === "pan"}
        zoomWithPrimary={state.selectedTool === "zoom"}
        brushWithPrimary={["brush-tool", "eraser"].includes(state.selectedTool)}
        showPointDistances={state.showPointDistances}
        videoTime={
          state.annotationType === "image"
            ? state.selectedImageFrameTime
            : state.currentVideoTime
        }
        keypointDefinitions={state.keypointDefinitions}
        onMouseMove={action("MOUSE_MOVE")}
        onMouseDown={action("MOUSE_DOWN")}
        onMouseUp={action("MOUSE_UP")}
        // onChangeRegion={action("CHANGE_REGION", "region")}
        // onBeginRegionEdit={action("OPEN_REGION_EDITOR", "region")}
        // onCloseRegionEdit={action("CLOSE_REGION_EDITOR", "region")}
        // onDeleteRegion={action("DELETE_REGION", "region")}
        onContextMenu={action("MOUSE_RIGHT_CLICK", "event")}
        onBeginBoxTransform={action("BEGIN_BOX_TRANSFORM", "box", "directions")}
        onBeginMovePolygonPoint={action(
          "BEGIN_MOVE_POLYGON_POINT",
          "polygon",
          "pointIndex"
        )}
        onBeginMoveKeypoint={action(
          "BEGIN_MOVE_KEYPOINT",
          "region",
          "keypointId"
        )}
        onAddPolygonPoint={action(
          "ADD_POLYGON_POINT",
          "polygon",
          "point",
          "pointIndex"
        )}
        onSelectRegion={action("SELECT_REGION", "region")}
        onBeginMovePoint={action("BEGIN_MOVE_POINT", "point")}
        onImageLoaded={action("IMAGE_LOADED", "image")}
        // RegionEditLabel={RegionEditLabel}
        onImageOrVideoLoaded={action("IMAGE_OR_VIDEO_LOADED", "metadata")}
        onChangeVideoTime={action("CHANGE_VIDEO_TIME", "newTime")}
        onChangeVideoPlaying={action("CHANGE_VIDEO_PLAYING", "isPlaying")}
        // onRegionClassAdded={onRegionClassAdded}
        // allowComments={state.allowComments}
        allowFreeDrawing={state.selectedTool === "brush"}
        dispatch={dispatch}
        keyDraggingEnabled={state.dragging}
        // showTasks={showTasks}
        pointRef={state.pointRef}
        mode={state.mode}
        // isFullScreen={state.fullScreen}
        // isExpand={state.isExpand}
        onImageError={action("IMAGE_ERROR")}
        isImageError={state.isImageError}
        currentTool={state.selectedTool}
        selectedClsColor={getClsColor(state, state.selectedCls)}
        selectedRegion={state.selectedRegion}
        onBeginMoveSkeletonPoint={action(
          "MOVE_SKELETON_POINT",
          "regionId",
          "pointIndex"
        )}
        mouseDownAt={state.mouseDownAt}
      />
    ),
    [
      action,
      activeImage,
      dispatch,
      impliedVideoRegions,
      settings,
      state,
      state.selectedImage,
      state.fullImageSegmentationMode,
      state.showTags,
      state.allowedArea,
      state.annotationType,
      state.videoPlaying,
      state.videoSrc,
      state.pointDistancePrecision,
      state.showPointDistances,
      state.currentVideoTime,
      state.keypointDefinitions,
      state.dragging,
      state.pointRef,
      state.mode,
      state.isImageError,
    ]
  )

  const onClickIconSidebarItem = useEventCallback((item) => {
    dispatch({ type: "SELECT_TOOL", selectedTool: item.name })
  })

  const onClickHeaderItem = useEventCallback((item) => {
    if (item.name === "Fullscreen") {
      fullScreenHandle.enter()
    } else if (item.name === "Window") {
      fullScreenHandle.exit()
    } else if (item.name === "Cancel") {
      setIsClearRegionsConfirm(true)
      return
    } else if (item.name === "Delete") {
      setIsDeleteAnnotationConfirm(true)
    }
    if (item.name === "undo") {
      dispatch({ type: "UNDO_HISTORY" })
    } else if (item.name === "redo") {
      dispatch({ type: "REDO_HISTORY" })
    } else dispatch({ type: "HEADER_BUTTON_CLICKED", buttonName: item.name })
  })

  const getHeaderItems = useCallback(() => {
    return [
      !hidePrev && { name: "Prev" },
      !hideNext && { name: "Next" },
      { name: "undo", tooltip: "Undo" },
      { name: "redo", tooltip: "Redo" },
      state.annotationType !== "video"
        ? null
        : !state.videoPlaying
        ? { name: "Play" }
        : { name: "Pause" },
      !hideClone &&
        !nextImageHasRegions &&
        activeImage.regions && { name: "Clone" },
      !hideSettings && { name: "Settings" },
      // !state.fullScreen && {name: "Expand", tooltip: "Expand editor"},
      !hideFullScreen &&
        (state.fullScreen
          ? { name: "Window", tooltip: "Exit Full-Screen Mode" }
          : { name: "Fullscreen", tooltip: "Enter Full-Screen Mode" }),
      { name: "Cancel", tooltip: "Clear all regions" },
      state.annotationId && { name: "Delete", tooltip: "Delete annotation" },
      !hideSave &&
        state.saveState === "failed" && {
          name: "Save",
          tooltip: "Save annotation",
        },
    ].filter(Boolean)
  }, [
    hidePrev,
    hideNext,
    state.annotationType,
    hideClone,
    activeImage.regions,
    hideSettings,
    hideFullScreen,
    state.fullScreen,
    hideSave,
    state.annotationId,
    state.saveState,
    state.videoPlaying,
  ])

  // function getimgBase64(url, callback) {
  //   const xhr = new XMLHttpRequest()
  //
  //   xhr.onload = function () {
  //     const reader = new FileReader()
  //
  //     reader.onloadend = function () {
  //       callback(reader.result)
  //     }
  //
  //     reader.readAsDataURL(xhr.response)
  //   }
  //
  //   xhr.open("GET", url)
  //   xhr.responseType = "blob"
  //   xhr.send()
  // }

  // const debugModeOn = useMemo(() => Boolean(window.localStorage.$ANNOTATE_DEBUG_MODE && state), [state]);
  const annotation = useMemo(() => (state?.annotations ?? []).filter(
    (a) => a.id === state.annotationId
  ), [state.annotations, state.annotationId]);

  const iconsSidebar = useMemo(() => {
    return [
      {
        name: "select",
        helperText: "Select" + getHotkeyHelpText("select_tool"),
        alwaysShowing: true,
      },
      {
        name: "pan",
        helperText:
          "Drag/Pan (right or middle click)" +
          getHotkeyHelpText("pan_tool"),
        alwaysShowing: true,
      },
      {
        name: "zoom",
        helperText:
          "Zoom In/Out (scroll)" + getHotkeyHelpText("zoom_tool"),
        alwaysShowing: true,
      },
      {
        name: "-",
        alwaysShowing: true,
      },
      {
        name: "show-tags",
        helperText: "Show / Hide Labels",
        alwaysShowing: true,
      } /*, {
                      name: "clone",
                      helperText: "Clone"
                    }*/,
      state.fullImageSegmentationMode && {
        name: "show-mask",
        alwaysShowing: false,
        helperText: "Show / Hide Mask",
      },
      {
        name: "modify-allowed-area",
        helperText: "Modify Allowed Area",
      },
      {
        name: "-",
        alwaysShowing: true,
      },
      state.mlBackend && {
        name: "auto-annotate",
        helperText:
          "Auto Annotate Rectangle Region" +
          getHotkeyHelpText("auto_annotate_rectangle"),
          requireMlBackend: false,
          alwaysShowing: true,
      },
      state.mlBackend && {
        name: "brush",
        helperText:
          "Auto Annotate Free-Drawing Region" +
          getHotkeyHelpText("auto_annotate_free_drawing"),
          requireMlBackend: false,
          alwaysShowing: true,
      },
      {
        name: "pen",
        helperText: "Pen",
      },
      {
        name: "-",
        alwaysShowing: true,
      },
      {
        name: "create-point",
        helperText:
          "Add Point" + getHotkeyHelpText("create_point"),
      },
      {
        name: "create-box",
        helperText:
          "Add Bounding Box" +
          getHotkeyHelpText("create_bounding_box"),
      },
      {
        name: "create-oval",
        helperText:
          "Add Circle/Oval" + getHotkeyHelpText("create_circle"),
      },
      {
        name: "create-polygon",
        helperText:
          "Add Polygon" + getHotkeyHelpText("create_polygon"),
      },
      {
        name: "create-line",
        helperText: "Add Line",
      },
      {
        name: "create-expanding-line",
        helperText: "Add Expanding Line",
      },
      {
        name: "create-keypoints",
        helperText: "Add Keypoints (Pose)",
      },
      {
        name: "create-polyline",
        helperText: "Polyline",
      },
      {
        name: "brush-tool",
        helperText: "Brush",
      },
      {
        name: "eraser",
        helperText: "Eraser",
      },
      {
        name: "create-skeleton",
        helperText: "Add skeleton",
      },
      {
        name: "create-cuboid",
        helperText: "Add cuboid",
      },
      /*{
        name: "create-link",
        helperText: "Create Link",
        alwaysShowing: true,
      },
      {
        name: "search",
        helperText: "Search",
        alwaysShowing: true,
      },*/ {
        name: "-",
        alwaysShowing: true,
      },
      /*state.mlBackend && {
        name: "prompt",
        helperText:
          "Annotate objects described in a prompt string",
        requireMlBackend: false,
        alwaysShowing: true,
      },
      state.mlBackend && {
        name: "voice",
        helperText: "Annotate objects described by a speech",
        requireMlBackend: false,
        alwaysShowing: true,
      },
      state.mlBackend && {
        name: "image-ref",
        helperText: "Annotate objects described in another image",
        requireMlBackend: false,
        alwaysShowing: true,
      },
      state.mlBackend && {
        name: "point-ref",
        helperText: "Annotate object that pointed out by a point",
        requireMlBackend: false,
        alwaysShowing: true,
      },*/
    ]
      .filter(Boolean)
      .filter(
        (a) => a.alwaysShowing || state.enabledTools.includes(a.name) //|| (a.requireMlBackend && state.mlBackend.length > 0)
      )
  }, [state.enabledTools, state.fullImageSegmentationMode, state.mlBackend]);

  const rightSidebarAllAnnotationBox = useMemo(() => {
    return (
      <AllAnnotationBox
        key="right-sidebar-AllAnnotationBox"
        visible={true}
        regionVisible={
          activeImage ? activeImage.regionVisible : true
        }
        regions={activeImage && !state.isLoadingImage ? activeImage.regions : emptyArr}
        onSelectRegion={action("SELECT_REGION", "region")}
        onDeleteRegion={action("DELETE_REGION", "region")}
        onChangeRegion={action("CHANGE_REGION", "region")}
        onChangeAllRegion={() => {
          action("CHANGE_ALL_REGION")()
        }}
        onDeleteRegionGroup={action(
          "DELETE_GROUP_REGION",
          "group"
        )}
        onChangeRegionGroup={action(
          "CHANGE_GROUP_REGION",
          "group"
        )}
      />
    );
  }, [activeImage, action, state.isLoadingImage]);

  const commentBox = useMemo(() => {
    if (!state.annotationId) {
      return null;
    }

    return (
      <CommentBox
        key="right-sidebar-CommentBox"
        annotationId={state.annotationId}
        projectId={projectId}
      />
    );
  }, [state.annotationId, projectId]);

  const historyBox = useMemo(() => {
    if (hideHistory) {
      return null;
    }

    return (
      <HistorySidebarBox
        key="right-sidebar-HistorySidebarBox"
        history={state.history}
        onRestoreHistory={action("RESTORE_HISTORY")}
      />
    );
  }, [action, hideHistory, state.history]);

  const rightSidebarItems = useMemo(() => {
    return [
      // debugModeOn && (
      //   <DebugBox
      //     key="right-sidebar-DebugBox"
      //     state={debugModeOn}
      //     lastAction={state.lastAction}
      //   />
      // ),
      // state.taskDescription && (
      //   <TaskDescription
      //     key="right-sidebar-TaskDescription"
      //     description={state.taskDescription}
      //   />
      // ),
      rightSidebarAllAnnotationBox,
      // state.regionClsList && (
      //   <ClassSelectionMenu
      //     key="right-sidebar-ClassSelectionMenu"
      //     selectedCls={state.selectedCls}
      //     regionClsList={state.regionClsList}
      //     onSelectCls={action("SELECT_CLASSIFICATION", "cls")}
      //     clsColorsList={state.clsColorsList ?? {}}
      //   />
      // ),
      // state.labelImages && (
      //   <TagsSidebarBox
      //     key="right-sidebar-TagsSidebarBox"
      //     currentImage={activeImage}
      //     imageClsList={state.imageClsList}
      //     // imageTagList={state.imageTagList}
      //     // imageTagList={["Label 1", "Label 2"]}
      //     onChangeImage={action("CHANGE_IMAGE", "delta")}
      //     expandedByDefault
      //   />
      // ),
      // (state.images?.length || 0) > 1 && (
      //   <ImageSelector
      //     onSelect={action("SELECT_REGION", "region")}
      //     images={state.images}
      //   />
      // ),
      // <RegionSelector
      //   key="right-sidebar-RegionSelector"
      //   regions={activeImage ? activeImage.regions : emptyArr}
      //   onSelectRegion={action("SELECT_REGION", "region")}
      //   onDeleteRegion={action("DELETE_REGION", "region")}
      //   onChangeRegion={action("CHANGE_REGION", "region")}
      // />,
      // state.keyframes && (
      //   <KeyframesSelector
      //     key="right-sidebar-KeyframesSelector"
      //     onChangeVideoTime={action(
      //       "CHANGE_VIDEO_TIME",
      //       "newTime"
      //     )}
      //     onDeleteKeyframe={action("DELETE_KEYFRAME", "time")}
      //     onChangeCurrentTime={action(
      //       "CHANGE_VIDEO_TIME",
      //       "newTime"
      //     )}
      //     currentTime={state.currentVideoTime}
      //     duration={state.videoDuration}
      //     keyframes={state.keyframes}
      //   />
      // ),
      commentBox,
      historyBox,
    ];
  }, [
    rightSidebarAllAnnotationBox,
    commentBox,
    historyBox,
  ]);

  return (
    <ThemeProvider theme={theme}>
      <FullScreenContainer>
        <FullScreen
          handle={fullScreenHandle}
          onChange={(open) => {
            if (!open) {
              fullScreenHandle.exit()
              action("HEADER_BUTTON_CLICKED", "buttonName")("Window")
            }
          }}
        >
          <HotkeyDiv
            tabIndex={-1}
            divRef={innerContainerRef}
            onMouseDown={refocusOnMouseEvent}
            onMouseOver={refocusOnMouseEvent}
            allowChanges
            handlers={hotkeyHandlers}
            className={classnames(
              classes.container,
              state.fullScreen && "Fullscreen"
            )}
          >
            <Workspace
              allowFullscreen
              iconDictionary={iconDictionary}
              hideHeader={hideHeader || state.isImageError}
              hideHeaderText={hideHeaderText}
              isFullscreen={state.fullScreen}
              regionClsList={state.regionClsList}
              clsColorsList={state.clsColorsList}
              selectedCls={state.selectedCls}
              dispatch={dispatch}
              regions={activeImage.regions}
              headerLeftSide={
                <div
                  key="header-left-container"
                  className={classes.headerLeftContainer}
                >
                  {/* <Tooltip title="Toggle tasks list" placement="bottom-start">
                    <div
                      style={{ padding: 12, cursor: "pointer" }}
                      onClick={(e) => {
                        onMenuClick(e)
                        setShowTasks(!showTasks)
                      }}
                    >
                      <IconFolder />
                    </div>
                  </Tooltip> */}
                  {/* {state.annotationType === "video" ? (
                    <KeyframeTimeline
                      key="header-left-KeyframeTimeline"
                      currentTime={state.currentVideoTime}
                      duration={state.videoDuration}
                      onChangeCurrentTime={action(
                        "CHANGE_VIDEO_TIME",
                        "newTime"
                      )}
                      keyframes={state.keyframes}
                    />
                  ) : (
                    activeImage && (
                      <div
                        className={classes.headerTitle}
                        style={{
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          minWidth: 0,
                          flex: 1,
                          color: "#000",
                          fontSize: "18px",
                        }}
                      >
                        {activeImage.name}
                      </div>
                    )
                  )} */}
                  <ButtonDropdown
                    isOpen={isOpen}
                    toggle={() => setOpen(!isOpen)}
                  >
                    <DropdownToggle color="black" className="drop-down">
                      {annotation.length === 0 ? (
                        "Select annotation"
                      ) : (
                        <div className="drop-down-content">
                          <div className="avatar"></div>
                          {annotation[0].id && (
                            <>
                              <em>#{annotation[0].id}</em>
                              <div className="spacer"/>
                            </>
                          )}
                          <b>{annotation[0].created_username ?? "???"}</b>
                          <div className="spacer"/>
                          <i>{`${annotation[0].created_ago ?? "???"} ago`}</i>
                        </div>
                      )}
                      <IconArrowDown/>
                    </DropdownToggle>
                    <DropdownMenu>
                      {(state?.annotations ?? []).map(function (a, i) {
                        return (
                          <DropdownItem
                            key={"annotation-" + a.id}
                            onClick={() =>
                              dispatch({
                                type: "SELECT_ANNOTATION",
                                annotationId: a.id,
                              })
                            }
                          >
                            {"#" +
                              (a.id ?? "???") +
                              " / " +
                              (a.created_ago ?? "???") +
                              " / " +
                              (a.created_username ?? "???")}
                          </DropdownItem>
                        )
                      })}
                      {(state?.annotations ?? []).length > 0 && <DropdownItem key="annotation-divider" divider/>}
                      <DropdownItem
                        key="annotation-new"
                        onClick={() => dispatch({type: "CREATE_ANNOTATION"})}
                      >
                        New annotation
                      </DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                  <div style={{
                    display: state.saveState === "start" ? "inline-flex" : "none",
                    marginLeft: 16,
                    alignItems: "center",
                  }}>
                    <CircularProgress size={16} sx={{marginRight: "8px"}} />
                    Saving...
                  </div>
                  <div style={{
                    display: state.predicts.length > 0 ? "inline-flex" : "none",
                    marginLeft: 16,
                    alignItems: "center",
                  }}>
                    Predicting: {state.predicts.length} request{state.predicts.length > 1 ? "s" : ""}...
                  </div>
                  <div style={{
                    display: state.fetchingMlBackend ? "inline-flex" : "none",
                    marginLeft: 16,
                    alignItems: "center",
                  }}>
                    <CircularProgress size={16} sx={{marginRight: "8px"}} />
                    Loading ML backend...
                  </div>
                  <div style={{
                    display: !state.fetchingMlBackend ? "inline-flex" : "none",
                    marginLeft: 16,
                    alignItems: "center",
                  }}>
                    {state.failedToGetMlBackend && <>Failed to load ML backend.</>}
                    <Button
                      onClick={() => dispatch({type: "LOAD_ML_BACKEND"})}
                      color="primary"
                      size="small"
                      disableElevation
                    >
                      Refresh ML backend
                    </Button>
                  </div>
                </div>
              }
              headerItems={getHeaderItems()}
              onClickHeaderItem={onClickHeaderItem}
              onClickIconSidebarItem={onClickIconSidebarItem}
              selectedTools={[
                state.selectedTool,
                state.showTags && "show-tags",
                state.showMask && "show-mask",
              ].filter(Boolean)}
              isLoadingImage={state.isLoadingImage}
              iconSidebarItems={iconsSidebar}
              rightSidebarItems={rightSidebarItems}
              isExpand={state.isExpand}
              // footer={
              //   <div className={classes.footerContainer}>
              //     {state.tasks.map(function (task, i) {
              //       return (
              //         <Button
              //           className="footer-item"
              //           key={"task-" + task.id}
              //           onClick={() => {
              //             onTaskSelect(task)
              //           }}
              //         >
              //           <div className="flex-content">
              //             <div className="flex-row">
              //               <div className="img-tag">Img</div>
              //               <div className="task-content">
              //                 <span>ID: {task.id}</span>
              //                 <span>Completed: {task.updated_at}</span>
              //               </div>
              //             </div>
              //             <div className="task-info">
              //               <span className="task-info-item">
              //                 <IconPoint />
              //                 {task.total_annotations}
              //               </span>
              //               <span className="task-info-item">
              //                 <IconStop />
              //                 {task.cancelled_annotations}
              //               </span>
              //               <span className="task-info-item">
              //                 <Icon2Point />
              //                 {task.total_predictions}
              //               </span>
              //             </div>
              //           </div>
              //         </Button>
              //       )
              //     })}
              //   </div>
              // }
              skeletonList={state.skeletonList}
            >
              {canvas}
            </Workspace>
            <SettingsDialog
              open={state.settingsOpen}
              onClose={() =>
                dispatch({
                  type: "HEADER_BUTTON_CLICKED",
                  buttonName: "Settings",
                })
              }
            />
          </HotkeyDiv>
        </FullScreen>
      </FullScreenContainer>
      <ConfirmDialog
        title="Clear all regions"
        open={isClearRegionsConfirm}
        onCancel={() => setIsClearRegionsConfirm(false)}
        onConfirm={() => {
          dispatch({ type: "CLEAR_ALL_REGIONS" })
          setIsClearRegionsConfirm(false)
        }}
      >
        Are you sure you want to clear all regions?
      </ConfirmDialog>
      <ConfirmDialog
        title="Delete annotation"
        open={isDeleteAnnotationConfirm}
        onCancel={() => setIsDeleteAnnotationConfirm(false)}
        onConfirm={() => {
          setIsDeleteAnnotationConfirm(false)
          dispatch({
            type: "DELETE_ANNOTATION",
            annotationId: state.annotationId,
					})
        }}
      >
        Are you sure you want to delete current annotation?
      </ConfirmDialog>
      <ConfirmDialog
        title="Annotate using prompt"
        confirmLabel="Predict"
        maxWidth="md"
        open={state.selectedTool === "prompt"}
        onCancel={() =>
          dispatch({ type: "SELECT_TOOL", selectedTool: "select" })
        }
        onConfirm={() => {
          if (predictPrompt && predictPrompt.trim().length > 0) {
            dispatch({type: "PREDICT_PROMPT", prompt: predictPrompt});
            dispatch({type: "SELECT_TOOL", selectedTool: "select"});
          } else {
            state.dispatch({
              type: "SHOW_ERROR",
              text: "Please enter your prompt",
            })
          }
        }}
      >
        <div>
          Enter your prompt to describe objects that need to be annotated
        </div>
        <TextareaAutosize
          autoFocus={true}
          onChange={(ev) => setPredictPrompt(ev.target.value)}
          style={{ width: "100%", marginTop: 16, padding: 8, borderRadius: 8, boxSizing: "border-box" }}
          value={predictPrompt}
          onKeyDown={e => {
            e.stopPropagation();
          }}
        />
      </ConfirmDialog>
      <ConfirmDialog
        title="Annotate using speech"
        confirmLabel={window.location.protocol === "https:" ? "Predict" : "Unavailable"}
        maxWidth="md"
        open={state.selectedTool === "voice"}
        onCancel={() =>
          dispatch({ type: "SELECT_TOOL", selectedTool: "select" })
        }
        onConfirm={() => {
          if (window.location.protocol === "https:") {
            if (predictAudio && predictAudio.length > 0) {
              dispatch({type: "PREDICT_VOICE", voice: predictAudio.substring(predictAudio.indexOf(";base64,") + 8)});
              dispatch({type: "SELECT_TOOL", selectedTool: "select"});
              setPredictAudio(null);
            } else {
              state.dispatch({
                type: "SHOW_ERROR",
                text: "Please record an instruction first",
              })
            }
          }
        }}
      >
        {
          window.location.protocol === "https:"
            ? <PredictAudioRecorder onRecorded={(audio) => setPredictAudio(audio)} />
            : "This function can only be used on HTTPS websites."
        }
      </ConfirmDialog>
      <ConfirmDialog
        title="Annotate using reference image"
        confirmLabel="Predict"
        maxWidth="md"
        open={state.selectedTool === "image-ref"}
        onCancel={() =>
          dispatch({ type: "SELECT_TOOL", selectedTool: "select" })
        }
        onConfirm={() => {
          if (
            predictImageRef &&
            predictImageRef.length > 0 &&
            predictImageRefLabel &&
            predictImageRefLabel.length > 0
          ) {
            dispatch({
              type: "PREDICT_IMAGE_PREF",
              image_pref: predictImageRef.substring(predictImageRef.indexOf(";base64,") + 8),
              image_pref_label: predictImageRefLabel,
            });
            dispatch({type: "SELECT_TOOL", selectedTool: "select"});
            setPredictImageRef(null);
            setPredictImageRefLabel(null);
          } else {
            state.dispatch({
              type: "SHOW_ERROR",
              text: "Please select a sample image and the label",
            })
          }
        }}
      >
        <PredictImageChooser
          labels={state.regionClsList}
          labelColors={state.clsColorsList}
          onSelectImage={(image) => setPredictImageRef(image)}
          onSelectLabel={(label) => setPredictImageRefLabel(label)}
        />
      </ConfirmDialog>
      {state.loadingText && (
        <Dialog
          maxWidth="xs"
          open={true}
          disablePortal={false}
        >
          <DialogContent dividers>{state.loadingText}</DialogContent>
        </Dialog>
      )}
      {state.errorText !== null && (
        <Dialog
          maxWidth="xs"
          open={true}
          disablePortal={false}
        >
          <DialogTitle>Error</DialogTitle>
          <DialogContent dividers>
            {state.errorText.split("\n").map((txt, idx) => <p key={"error-line-" + idx}>{txt}</p>)}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => dispatch({ type: "HIDE_ERROR" })} variant="contained" color="error">
              Close
            </Button>
            {state.errorActions}
          </DialogActions>
        </Dialog>
      )}
    </ThemeProvider>
  )
}

export default MainLayout
