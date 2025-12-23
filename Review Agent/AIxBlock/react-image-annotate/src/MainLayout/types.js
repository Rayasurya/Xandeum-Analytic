// @flow

import type {
  Region,
  Polygon,
  Box,
  Point,
  KeypointsDefinition,
  Keypoints,
  KeypointDefinition,
  RegionGroup,
  Skeleton,
} from "../ImageCanvas/region-tools.js"

export type ToolEnum =
  | "select"
  | "pan"
  | "zoom"
  | "create-point"
  | "create-box"
  | "create-polygon"
  | "create-pixel"
  | "create-expanding-line"
  | "create-keypoints"
  | "auto-annotate"
  | "create-oval"
  | "create-line"
  | "point-ref"
  | "brush"
  | "skeleton"
  | "create-polyline"
  | "brush-tool"
  | "eraser"
  | "create-skeleton"
  | "create-cuboid"


export type Image = {
  src: string,
  thumbnailSrc?: string,
  name: string,
  regions?: Array<Region>,
  pixelSize?: { w: number, h: number },
  realSize?: { w: number, h: number, unitName: string },
  frameTime?: number,
  base64?: string,
}

export type Mode =
  | null
  | {| mode: "DRAW_POLYGON", regionId: string |}
  | {| mode: "MOVE_POLYGON_POINT", regionId: string, pointIndex: number |}
  | {|
      mode: "RESIZE_BOX",
      editLabelEditorAfter?: boolean,
      regionId: string,
      freedom: [number, number],
      original: { x: number, y: number, w: number, h: number },
      isNew?: boolean,
    |}
  | {| mode: "MOVE_REGION" |}
  | {| mode: "MOVE_KEYPOINT", regionId: string, keypointId: string |}
  | {|
      mode: "RESIZE_KEYPOINTS",
      landmarks: {
        [string]: KeypointDefinition,
      },
      centerX: number,
      centerY: number,
      regionId: string,
      isNew: boolean,
    |}
  | {|
      mode: "MOVE_SKELETON_POINT",
      regionId: string,
      pointIndex: number,
  |}

export type PredictRequest = {
  id: string,
  confidence_threshold?: number | null,
  iou_threshold?: number | null,
} & (
  | { type: "rect", x: number, y: number, w: number, h: number }
  | { type: "point", x: number, y: number }
  | { type: "prompt", prompt: string }
  | { type: "voice", voice: string }
  | { type: "image_pref", image_pref: string, image_pref_label: string }
  | { type: "brush", image: string, x: number, y: number, w: number, h: number }
)

export type MainLayoutStateBase = {|
  annotationType: "video" | "image",
  mouseDownAt?: ?{ x: number, y: number },
  fullScreen?: boolean,
  settingsOpen?: boolean,
  minRegionSize?: number,
  showTags: boolean,
  showMask: boolean,
  showPointDistances?: boolean,
  pointDistancePrecision?: number,
  selectedTool: ToolEnum,
  selectedCls?: string,
  mode: Mode,
  taskDescription: string,
  allowedArea?: { x: number, y: number, w: number, h: number },
  regionClsList?: Array<string>,
  regionTagList?: Array<string>,
  imageClsList?: Array<string>,
  imageTagList?: Array<string>,
  enabledTools: Array<string>,
  history: Array<{ time: Date, state: MainLayoutState, name: string }>,
  redoHistory: Array<{ time: Date, state: MainLayoutState, name: string }>,
  keypointDefinitions: KeypointsDefinition,
  dragging: boolean,
  loadingText: string | null,
  errorText: string | null,
  errorActions: string | null,
  mlBackend: string,
  clsColorsList: { [k: string]: string },
  task: { [k: string]: string } | null,
  annotations: Array<{ [k: string]: any }>,
  annotationId: number | null,
  saveState: string,
  isLoadingImage: boolean,
  pointRef: { x: number, y: number } | null,
  isExpand: boolean,
  isImageError: boolean,
  fetchingMlBackend: boolean,
  skeletonList: { [k: string]: object },
  predicts: PredictRequest[],
  projectId: number,
  failedToGetMlBackend: boolean,
|}

export type MainLayoutImageAnnotationState = MainLayoutStateBase & {|
  annotationType: "image",

  selectedImage?: string,
  images: Array<Image>,
  labelImages?: boolean,

  // If the selectedImage corresponds to a frame of a video
  selectedImageFrameTime?: number,
|}

export type MainLayoutVideoAnnotationState = MainLayoutStateBase & {|
  annotationType: "video",

  videoSrc: string,
  currentVideoTime: number,
  videoName?: string,
  videoPlaying: boolean,
  videoDuration?: number,
  keyframes: {
    [time: number]: {|
      time: number,
      regions: Array<Region>,
    |},
  },
  pixelSize?: { w: number, h: number },
  realSize?: { w: number, h: number, unitName: string },
|}

export type Action =
  | {| type: "@@INIT" |}
  | {| type: "SELECT_IMAGE", image: Image, imageIndex: number |}
  | {|
      type: "IMAGE_OR_VIDEO_LOADED",
      metadata: {
        naturalWidth: number,
        naturalHeight: number,
        duration?: number,
        base64?: string,
      },
    |}
  | {| type: "RESTORE_HISTORY" |}
  | {| type: "UNDO_HISTORY" |}
  | {| type: "REDO_HISTORY" |}
  | {| type: "CLOSE_POLYGON", polygon: Polygon |}
  | {| type: "SELECT_REGION", region: Region |}
  | {| type: "BEGIN_MOVE_POINT", point: Point |}
  | {| type: "BEGIN_BOX_TRANSFORM", box: Box, directions: [number, number] |}
  | {| type: "BEGIN_MOVE_POLYGON_POINT", polygon: Polygon, pointIndex: number |}
  | {| type: "BEGIN_MOVE_KEYPOINT", region: Keypoints, keypointId: string |}
  | {|
      type: "ADD_POLYGON_POINT",
      polygon: Polygon,
      point: { x: number, y: number },
      pointIndex: number,
    |}
  | {| type: "MOUSE_MOVE", x: number, y: number |}
  | {| type: "MOUSE_DOWN", x: number, y: number |}
  | {| type: "MOUSE_UP", x: number, y: number |}
  | {| type: "CHANGE_REGION", region: Region |}
  | {| type: "CHANGE_ALL_REGION" |}
  | {| type: "CHANGE_GROUP_REGION", group: RegionGroup |}
  | {| type: "DELETE_GROUP_REGION", group: RegionGroup |}
  | {| type: "OPEN_REGION_EDITOR", region: Region |}
  | {| type: "CLOSE_REGION_EDITOR", region: Region |}
  | {| type: "DELETE_REGION", region: Region |}
  | {| type: "DELETE_SELECTED_REGION" |}
  | {| type: "HEADER_BUTTON_CLICKED", buttonName: string |}
  | {| type: "SELECT_TOOL", selectedTool: ToolEnum |}
  | {| type: "CANCEL" |}
  | {| type: "SELECT_CLASSIFICATION", cls: string |}
  | {| type: "DRAGGING_START" |}
  | {| type: "DRAGGING_STOP" |}
  | {| type: "CLEAR_ALL_REGIONS" |}
  | {| type: "SHOW_LOADING", text: string |}
  | {| type: "HIDE_LOADING" |}
  | {| type: "SHOW_ERROR", text: string, actions: React$Node[] |}
  | {| type: "HIDE_ERROR" |}
  | {| type: "COPY_SELECTED_REGION" |}
  | {| type: "PASTE_COPIED_REGION" |}
  | {|
      type: "ADD_AUTO_ANNOTATE_REGIONS",
      imageW: number,
      imageH: number,
      regionX: number,
      regionY: number,
      regionW: number,
      regionH: number,
      data: Array<{ [k: string]: any }>,
    |}
  | {| type: "REFRESH_ANNOTATIONS" |}
  | {| type: "SET_ANNOTATIONS", annotations: Array<{ [k: string]: any }> |}
  | {| type: "SELECT_ANNOTATION", annotationId: number | null |}
  | {|
      type: "CREATE_ANNOTATION",
      annotations: Array<{ [k: string]: any }> | null,
    |}
  | {| type: "DELETE_ANNOTATION", annotationId: number | null |}
  | {|
      type: "UPDATE_RESULT",
      annotationId: number,
      formattedResult: Array<{ [k: string]: any }>,
    |}
  | {| type: "SAVE_REGIONS" |}
  | {| type: "REGIONS_SAVED" |}
  | {| type: "SAVE_FAILED" |}
  | {| type: "IMAGE_LOADED" |}
  | {| type: "EXPAND" |}
  | {| type: "IMAGE_ERROR" |}
  | {| type: "START_FETCHING_ML_BACKEND" |}
  | {| type: "STOP_FETCHING_ML_BACKEND" |}
  | {| type: "SET_ML_BACKEND", url: string |}
  | {| type: "MOVE_SKELETON_POINT", point: number |}
  | {| type: "CREATE_BRUSH_REGION", rle: number[] |}
  | {| type: "UPDATE_BRUSH_REGION", rle: number[], regionId: string |}
  | {| type: "POP_PREDICT" |}
  | {| type: "PREDICT_PROMPT", prompt: string |}
  | {| type: "PREDICT_VOICE", voice: string |} // Voice data in base64 encoded without "...;base64," prefix
  | {| type: "PREDICT_IMAGE_PREF", image_pref: string, image_pref_label: string |} // Image data in base64 encoded without "...;base64," prefix
  | {| type: "FAILED_TO_GET_ML_BACKEND" |}
  | {| type: "LOAD_ML_BACKEND" |}
  | {| type: "UPDATE_PREDICT_PARAMS", id: string, confidence_threshold: number, iou_threshold: number |}
  | {| type: "REMOVE_PREDICT", id: string |}
  | {| type: "PREDICT_BRUSH", image: string, x: number, y: number, w: number, h: number |}

export type MainLayoutState =
  | MainLayoutImageAnnotationState
  | MainLayoutVideoAnnotationState
  | { dispatch: (action: Action) => MainLayoutState }
