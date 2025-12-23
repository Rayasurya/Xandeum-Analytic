// @flow
// noinspection JSUnresolvedVariable,UnnecessaryLocalVariableJS,JSUnusedLocalSymbols,SpellCheckingInspection

import type { MainLayoutState, Action } from "../../MainLayout/types"
import { moveRegion } from "../../ImageCanvas/region-tools.js"
import { getIn, setIn } from "seamless-immutable"
import isEqual from "lodash/isEqual"
import {normalizedPointToRealPoint} from "../../utils/calculationPolylineHighlightBox";
import getActiveImage from "./get-active-image"
import { saveToHistory } from "./history-handler.js"
import colors from "../../colors"
import fixTwisted from "./fix-twisted"
import convertExpandingLineToPolygon from "./convert-expanding-line-to-polygon"
import clamp from "clamp"
import getLandmarksWithTransform from "../../utils/get-landmarks-with-transform"
import setInLocalStorage from "../../utils/set-in-local-storage"
import {
  convertToRIAKeyframes,
  convertToRIARegionFmt,
} from "../../utils/ria-format"
import { filter } from "lodash"
import {addMidpoint} from "../../utils/addCurvaturePointForPolyline"


// let processingImage = null
let predictingImage = null
let copiedRegion = null
const getRandomId = () => Math.random().toString().split(".")[1]

export const getClsColor = (state, cls) => {
  if (typeof cls !== "string") {
    return "#FF0000";
  }

  const labelColors = typeof state.clsColorsList === "object" ? {...state.clsColorsList} : {};

  for (const lc in labelColors) {
    labelColors[lc.toLowerCase()] = labelColors[lc];
  }

  cls = cls.toLowerCase();
  return Object.hasOwn(labelColors, cls) ? labelColors[cls] : "#FF0000";
}


export default (state: MainLayoutState, action: Action) => {
  if (
    state.allowedArea &&
    state.selectedTool !== "modify-allowed-area" &&
    ["MOUSE_DOWN", "MOUSE_UP", "MOUSE_MOVE"].includes(action.type)
  ) {
    const aa = state.allowedArea
    action.x = clamp(action.x, aa.x, aa.x + aa.w)
    action.y = clamp(action.y, aa.y, aa.y + aa.h)
  }

  if (action.type === "ON_CLS_ADDED" && action.cls && action.cls !== "") {
    const oldRegionClsList = state.regionClsList
    const newState = {
      ...state,
      regionClsList: oldRegionClsList.concat(action.cls),
    }
    return newState
  }

  // Throttle certain actions
  if (action.type === "MOUSE_MOVE") {
    if (Date.now() - ((state: any).lastMouseMoveCall || 0) < 16) return state
    state = setIn(state, ["lastMouseMoveCall"], Date.now())
  }
  if (!action.type.includes("MOUSE")) {
    state = setIn(state, ["lastAction"], action)
  }

  if (
    (state.selectedTool === "brush-tool" || state.selectedTool === "eraser") &&
    ["MOUSE_DOWN", "MOUSE_MOVE", "MOUSE_UP"].includes(action.type)
  ) {
    return state;
  }

  const { currentImageIndex, pathToActiveImage, activeImage } =
    getActiveImage(state)

  const getRegionIndex = (region) => {
    const regionId =
      typeof region === "string" || typeof region === "number"
        ? region
        : region.id
    if (!activeImage) return null
    const regionIndex = (activeImage.regions || []).findIndex(
      (r) => r.id === regionId
    )
    return regionIndex === -1 ? null : regionIndex
  }

  const getRegion = (regionId) => {
    if (!activeImage) return null
    const regionIndex = getRegionIndex(regionId)
    if (regionIndex === null) return [null, null]
    const region = activeImage.regions[regionIndex]
    return [region, regionIndex]
  }

  const modifyRegion = (regionId, obj) => {
    const [region, regionIndex] = getRegion(regionId)
    if (!region) return state
    if (obj !== null) {
      return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
        ...region,
        ...obj,
      })
    } else {
      // delete region
      const regions = activeImage.regions
      return setIn(
        state,
        [...pathToActiveImage, "regions"],
        (regions || []).filter((r) => r.id !== region.id)
      )
    }
  }

  const unselectRegions = (state: MainLayoutState) => {
    if (!activeImage) return state
    return setIn(
      state,
      [...pathToActiveImage, "regions"],
      (activeImage.regions || []).map((r) => ({
        ...r,
        highlighted: false,
      }))
    )
  }

  const closeEditors = (state: MainLayoutState) => {
    if (currentImageIndex === null) return state
    return setIn(
      state,
      [...pathToActiveImage, "regions"],
      (activeImage.regions || []).map((r) => ({
        ...r,
        editingLabels: false,
      }))
    )
  }

  const setNewImage = (img: string | Object, index: number) => {
    let { src, frameTime } = typeof img === "object" ? img : { src: img }
    return setIn(
      setIn(state, ["selectedImage"], index),
      ["selectedImageFrameTime"],
      frameTime
    )
  }



  const changeAnnotation = (
    state: MainLayoutState,
    annotationId: number | null
  ) => {
    let annotation = state.annotations.filter((a) => a.id === annotationId)
    if (annotation.length > 0) {
      if (state.images) {
        const regions = (annotation[0].result ?? []).map(convertToRIARegionFmt);
        state = setIn(
          state,
          [...pathToActiveImage, "regions"],
          regions.map((r) => {
            if (typeof r?.cls === "string") {
              return { ...r, color: getClsColor(state, r.cls) };
            } else {
              return { ...r, color: "#FF0000" }
            }
          })
        )
      } else if (state.videoSrc) {
        state = setIn(
          setIn(state, ["currentVideoTime"], 0),
          ["keyframes"],
          convertToRIAKeyframes(
            typeof annotation[0].result === "object"
              ? annotation[0].result[0]?.keyframes
              : {}
          )
        )
      }
    }

    return setIn(state, ["annotationId"], annotationId)
  }

  const requestSave = (state) => {
    return setIn(state, ["saveState"], "start")
  }

  const showLoading = (state, content) => setIn(state, ["loadingText"], content);
  const hideLoading = (state) => setIn(state, ["loadingText"], null);
  const showError = (state, content, actions) => setIn(
    setIn(state, ["errorText"], content),
    ["errorActions"],
    actions,
  );
  const hideError = (state) => setIn(
    setIn(state, ["errorText"], null),
    ["errorActions"],
    null,
  );
  const saveRegion = (state) => setIn(state, ["saveState"], "start");

  switch (action.type) {
    case "@@INIT": {
      return state
    }
    case "SELECT_IMAGE": {
      return setNewImage(action.image, action.imageIndex)
    }
    case "SELECT_CLASSIFICATION": {
      return setIn(state, ["selectedCls"], action.cls)
    }
    case "CHANGE_REGION": {
      if (typeof action.region !== "object") {
        return state
      }

      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      const oldRegion = activeImage.regions[regionIndex]

      if (oldRegion.cls !== action.region.cls) {
        state = saveToHistory(state, "Change Region Classification")

        if (
          action.region.cls &&
          state.regionClsList.indexOf(action.region.cls) > -1
        ) {
          state = setIn(state, ["selectedCls"], action.region.cls)
          action.region.color = Object.hasOwn(
            state.clsColorsList,
            action.region.cls
          )
            ? state.clsColorsList[action.region.cls]
            : "#ff0000"
        }
      }

      if (!isEqual(oldRegion.tags, action.region.tags)) {
        state = saveToHistory(state, "Change Region Tags")
      }

      if (!isEqual(oldRegion.comment, action.region.comment)) {
        state = saveToHistory(state, "Change Region Comment")
      }

      return saveRegion(
        setIn(
          state,
          [...pathToActiveImage, "regions", regionIndex],
          action.region
        )
      )
    }
    case "CHANGE_ALL_REGION": {
      const regionVisible =
        typeof activeImage.regionVisible === "undefined"
          ? true
          : activeImage.regionVisible
      const oldRegion = activeImage.regions
      const newRegion = oldRegion.map((region) => ({
        ...region,
        visible: !regionVisible,
      }))
      state = saveToHistory(
        state,
        `${regionVisible ? "Hide" : "Show"} All Region Classification`
      )
      return setIn(state, [...pathToActiveImage], {
        ...activeImage,
        regions: newRegion,
        regionVisible: !regionVisible,
      })
    }
    case "CHANGE_GROUP_REGION": {
      if (action.group) {
        const oldRegion = activeImage.regions
        const newRegion = oldRegion.map((region) => ({
          ...region,
          ...(action.group.cls === region.cls && {
            visible: action.group.visible,
          }),
          ...(action.group.cls === region.cls && {
            locked: action.group.locked,
          }),
        }))
        state = saveToHistory(
          state,
          `Change "${action.group.cls}" Region Classification`
        )
        return setIn(state, [...pathToActiveImage], {
          ...activeImage,
          regions: newRegion,
          regionVisible: filter(newRegion, { visible: true }).length !== 0,
        })
        // return state
      }
      break
    }
    case "DELETE_GROUP_REGION": {
      if (action.group) {
        const regions = activeImage.regions || [];
        const newRegions = filter(
          regions,
          (region) => region.cls !== action.group.cls
        )
        state = saveToHistory(
          state,
          `Delete "${action.group.cls}" Region Classification`
        )

        state = setIn(state, ["selectedRegion"], newRegions.find(r => !!r.highlighted));

        return setIn(requestSave(state), [...pathToActiveImage], {
          ...activeImage,
          regions: newRegions,
        })
      }
      break
    }
    case "CHANGE_IMAGE": {
      if (!activeImage) return state
      const { delta } = action
      for (const key of Object.keys(delta)) {
        if (key === "cls") saveToHistory(state, "Change Image Class")
        if (key === "tags") saveToHistory(state, "Change Image Tags")
        state = setIn(state, [...pathToActiveImage, key], delta[key])
      }
      return setIn(state, ["isLoadingImage"], true)
    }
    case "SELECT_REGION": {
      const { region } = action
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      const regions = [...(activeImage.regions || [])].map((r) => ({
        ...r,
        highlighted: r.id === region.id,
        editingLabels: r.id === region.id,
      }))
      state =  setIn(state, [...pathToActiveImage, "regions"], regions)
      state = setIn(state, ["selectedRegion"], {
          ...region,
      })
      return state;
    }

    case "UNSELECT_REGION": {
      const regions = [...(getIn(state, pathToActiveImage).regions || [])]
      .map((r) =>
        setIn(r, ["editingLabels"], false).setIn(["highlighted"], false)
      )
    state =  setIn(state, [...pathToActiveImage, "regions"], regions)
    state = setIn(state, ["selectedRegion"],null)
    return state;
    }

    case "BEGIN_MOVE_POINT": {
      state = closeEditors(state)
      return setIn(state, ["mode"], {
        mode: "MOVE_REGION",
        regionId: action.point.id,
      })
    }
    case "BEGIN_BOX_TRANSFORM": {
      const { box, directions } = action
      state = closeEditors(state)
      if (directions[0] === 0 && directions[1] === 0) {
        return setIn(state, ["mode"], { mode: "MOVE_REGION", regionId: box.id })
      } else {
        return setIn(state, ["mode"], {
          mode: "RESIZE_BOX",
          regionId: box.id,
          freedom: directions,
          original: { x: box.x, y: box.y, w: box.w, h: box.h },
        })
      }
    }
    case "BEGIN_MOVE_POLYGON_POINT": {
      const { polygon, pointIndex } = action
      state = closeEditors(state)
      if (
        state.mode &&
        state.mode.mode === "DRAW_POLYGON" &&
        pointIndex === 0
      ) {
        return setIn(
          modifyRegion(polygon, {
            points: polygon.points.slice(0, -1),
            open: false,
            highlighted: false,
          }),
          ["mode"],
          null
        )
      } else {
        state = saveToHistory(state, "Move Polygon Point")
      }
      return setIn(state, ["mode"], {
        mode: "MOVE_POLYGON_POINT",
        regionId: polygon.id,
        pointIndex,
      })
    }
    case "BEGIN_MOVE_KEYPOINT": {
      const { region, keypointId } = action;
      state = closeEditors(state)
      state = saveToHistory(state, "Move Keypoint")
      if(region.type === "polyline") {
        return setIn(state, ["mode"], {
          mode: "MOVE_POLYLINE_POINT",
          regionId: region.id,
          keypointId,
        })
      }else{
        return setIn(state, ["mode"], {
          mode: "MOVE_KEYPOINT",
          regionId: region.id,
          keypointId,
        })
      }

    }
    case "ADD_POLYGON_POINT": {
      const { polygon, point, pointIndex } = action
      const regionIndex = getRegionIndex(polygon)
      if (regionIndex === null) return state
      const points = [...polygon.points]
      points.splice(pointIndex, 0, point)
      return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
        ...polygon,
        points,
      })
    }
    case "MOUSE_MOVE": {
      const { x, y } = action

      if (!state.mode) return state
      if (!activeImage) return state
      const { mouseDownAt } = state
      switch (state.mode.mode) {
        case "MOVE_POLYGON_POINT": {
          const { pointIndex, regionId } = state.mode
          const regionIndex = getRegionIndex(regionId)
          if (regionIndex === null) return state
          return setIn(
            state,
            [
              ...pathToActiveImage,
              "regions",
              regionIndex,
              "points",
              pointIndex,
            ],
            [x, y]
          )
        }
        case "MOVE_KEYPOINT": {
          const { keypointId, regionId } = state.mode
          const [region, regionIndex] = getRegion(regionId)
          if (regionIndex === null) return state
          return setIn(
            state,
            [
              ...pathToActiveImage,
              "regions",
              regionIndex,
              "points",
              keypointId,
            ],
            { ...(region: any).points[keypointId], x, y }
          )
        }
        case "MOVE_REGION": {
          const { regionId } = state.mode
          if (regionId === "$$allowed_area") {
            const {
              allowedArea: { w, h },
            } = state
            return setIn(state, ["allowedArea"], {
              x: x - w / 2,
              y: y - h / 2,
              w,
              h,
            })
          }
          const regionIndex = getRegionIndex(regionId)
          if (regionIndex === null) return state
          return setIn(
            state,
            [...pathToActiveImage, "regions", regionIndex],
            moveRegion(activeImage.regions[regionIndex], x, y)
          )
        }
        case "RESIZE_CUBOID":
        case "RESIZE_SKELETON":
        case "RESIZE_BOX": {
          const {
            regionId,
            freedom: [xFree, yFree],
            original: { x: ox, y: oy, w: ow, h: oh },
          } = state.mode

          const dx = xFree === 0 ? ox : xFree === -1 ? Math.min(ox + ow, x) : ox
          const dw =
            xFree === 0
              ? ow
              : xFree === -1
              ? ow + (ox - dx)
              : Math.max(0, ow + (x - ox - ow))
          const dy = yFree === 0 ? oy : yFree === -1 ? Math.min(oy + oh, y) : oy
          const dh =
            yFree === 0
              ? oh
              : yFree === -1
              ? oh + (oy - dy)
              : Math.max(0, oh + (y - oy - oh))

          // determine if we should switch the freedom
          if (dw <= 0.001) {
            state = setIn(state, ["mode", "freedom"], [xFree * -1, yFree])
          }
          if (dh <= 0.001) {
            state = setIn(state, ["mode", "freedom"], [xFree, yFree * -1])
          }

          if (regionId === "$$allowed_area") {
            return setIn(state, ["allowedArea"], {
              x: dx,
              w: dw,
              y: dy,
              h: dh,
            })
          }

          const regionIndex = getRegionIndex(regionId)
          if (regionIndex === null) return state
          const box = activeImage.regions[regionIndex]

          return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
            ...box,
            x: dx,
            w: dw,
            y: dy,
            h: dh,
          })
        }
        case "RESIZE_KEYPOINTS": {
          const { regionId, landmarks, centerX, centerY } = state.mode
          const distFromCenter = Math.sqrt(
            (centerX - x) ** 2 + (centerY - y) ** 2
          )
          const scale = distFromCenter / 0.15
          return modifyRegion(regionId, {
            points: getLandmarksWithTransform({
              landmarks,
              center: { x: centerX, y: centerY },
              scale,
            }),
          })
        }
        case "DRAW_POLYGON": {
          const { regionId } = state.mode
          const [region, regionIndex] = getRegion(regionId)
          if (!region) return setIn(state, ["mode"], null)
          return setIn(
            state,
            [
              ...pathToActiveImage,
              "regions",
              regionIndex,
              "points",
              (region: any).points.length - 1,
            ],
            [x, y]
          )
        }
        case "DRAW_LINE": {
          const { regionId } = state.mode
          const [region, regionIndex] = getRegion(regionId)
          if (!region) return setIn(state, ["mode"], null)
          return setIn(state, [...pathToActiveImage, "regions", regionIndex], {
            ...region,
            x2: x,
            y2: y,
          })
        }
        case "DRAW_EXPANDING_LINE": {
          const { regionId } = state.mode
          const [expandingLine, regionIndex] = getRegion(regionId)
          if (!expandingLine) return state
          const isMouseDown = Boolean(state.mouseDownAt)
          if (isMouseDown) {
            // If the mouse is down, set width/angle
            const lastPoint = expandingLine.points.slice(-1)[0]
            const mouseDistFromLastPoint = Math.sqrt(
              (lastPoint.x - x) ** 2 + (lastPoint.y - y) ** 2
            )
            if (mouseDistFromLastPoint < 0.002 && !lastPoint.width) return state

            const newState = setIn(
              state,
              [...pathToActiveImage, "regions", regionIndex, "points"],
              expandingLine.points.slice(0, -1).concat([
                {
                  ...lastPoint,
                  width: mouseDistFromLastPoint * 2,
                  angle: Math.atan2(lastPoint.x - x, lastPoint.y - y),
                },
              ])
            )
            return newState
          } else {
            // If mouse is up, move the next candidate point
            return setIn(
              state,
              [...pathToActiveImage, "regions", regionIndex],
              {
                ...expandingLine,
                candidatePoint: { x, y },
              }
            )
          }
        }
        case "SET_EXPANDING_LINE_WIDTH": {
          const { regionId } = state.mode
          const [expandingLine, regionIndex] = getRegion(regionId)
          if (!expandingLine) return state
          const lastPoint = expandingLine.points.slice(-1)[0]
          const { mouseDownAt } = state
          return setIn(
            state,
            [...pathToActiveImage, "regions", regionIndex, "expandingWidth"],
            Math.sqrt((lastPoint.x - x) ** 2 + (lastPoint.y - y) ** 2)
          )
        }

        case "DRAW_POLYLINE": {
          const { regionId } = state.mode;
          const [region, regionIndex] = getRegion(regionId);
          if (!region) return state;
          return setIn(
            state,
            [...pathToActiveImage, "regions", regionIndex],
            {
              ...region,
              expandingPoint: [x, y],
            }
          );
        }

        case "MOVE_POLYLINE_POINT": {
          const { regionId, keypointId } = state.mode;
          if (!regionId) return state;
          const [region, regionIndex] = getRegion(regionId);
          const coords = keypointId % 2 === 1
            ? normalizedPointToRealPoint(region.points[parseInt(keypointId) - 1], [x, y], region.points[parseInt(keypointId) + 1])
            : [x, y];

          return setIn(
            state,
            [...pathToActiveImage, "regions", regionIndex, "points", keypointId],
            coords,
          );

        }

        case "MOVE_SKELETON_POINT":
          const {regionId, pointIndex} = state.mode;
          if (!regionId) return state;
          const [region, regionIndex] = getRegion(regionId);
          return setIn(
            state,
            [...pathToActiveImage, "regions", regionIndex, "points", pointIndex],
            {
              ...region.points[pointIndex],
              x: x,
              y: y,
            }
          );

        default:
          return state
      }
    }
    case "MOUSE_DOWN": {
      if (!activeImage) return state
      const { x, y } = action
      if(state.selectedTool === "move"){
        state = setIn(state, ["selectedRegion"], null)
      }
      state = setIn(state, ["mouseDownAt"], { x, y })
      if (state.mode) {
        switch (state.mode.mode) {
          case "DRAW_POLYGON": {
            const [polygon, regionIndex] = getRegion(state.mode.regionId)
            if (!polygon) break
            return setIn(
              state,
              [...pathToActiveImage, "regions", regionIndex],
              { ...polygon, points: polygon.points.concat([[x, y]]) }
            )
          }
          case "DRAW_LINE": {
            const [line, regionIndex] = getRegion(state.mode.regionId)
            if (!line) break
            setIn(state, [...pathToActiveImage, "regions", regionIndex], {
              ...line,
              x2: x,
              y2: y,
            })
            return setIn(state, ["mode"], null)
          }
          case "DRAW_EXPANDING_LINE": {
            const [expandingLine, regionIndex] = getRegion(state.mode.regionId)
            if (!expandingLine) break
            const lastPoint = expandingLine.points.slice(-1)[0]
            if (
              expandingLine.points.length > 1 &&
              Math.sqrt((lastPoint.x - x) ** 2 + (lastPoint.y - y) ** 2) < 0.002
            ) {
              if (!lastPoint.width) {
                return setIn(state, ["mode"], {
                  mode: "SET_EXPANDING_LINE_WIDTH",
                  regionId: state.mode.regionId,
                })
              } else {
                return requestSave(state)
                  .setIn(
                    [...pathToActiveImage, "regions", regionIndex],
                    {
                      ...convertExpandingLineToPolygon(expandingLine),
                      highlighted: false,
                    }
                  )
                  .setIn(["mode"], null)
              }
            }

            // Create new point
            return setIn(
              requestSave(state),
              [...pathToActiveImage, "regions", regionIndex, "points"],
              expandingLine.points.concat([{ x, y, angle: null, width: null }])
            )
          }
          case "SET_EXPANDING_LINE_WIDTH": {
            const [expandingLine, regionIndex] = getRegion(state.mode.regionId)
            if (!expandingLine) break
            const { expandingWidth } = expandingLine
            return requestSave(state)
              .setIn(
                [...pathToActiveImage, "regions", regionIndex],
                {
                  ...convertExpandingLineToPolygon({
                    ...expandingLine,
                    points: expandingLine.points.map((p) =>
                      p.width ? p : { ...p, width: expandingWidth }
                    ),
                    expandingWidth: undefined,
                  }),
                  highlighted: false,
                }
              )
              .setIn(["mode"], null)
          }
          default:
            break
        }
      }
      let newRegion
      let defaultRegionCls = state.selectedCls,
        defaultRegionColor = getClsColor(state, state.selectedCls)
      switch (state.selectedTool) {
        case "create-point": {
          state = saveToHistory(requestSave(state), "Create Point")

          newRegion = {
            type: "point",
            x,
            y,
            highlighted: false,
            editingLabels: false,
            color: defaultRegionColor,
            id: getRandomId(),
            cls: defaultRegionCls,
          }
          break
        }
        case "auto-annotate":
        case "create-oval":
        case "create-box": {
          state = saveToHistory(state, "Create Box")
          newRegion = {
            type: state.selectedTool === "create-oval" ? "oval" : "box",
            x: x,
            y: y,
            w: 0,
            h: 0,
            highlighted: true,
            editingLabels: false,
            color: defaultRegionColor,
            cls: defaultRegionCls,
            id: getRandomId(),
          }
          state = setIn(state, ["mode"], {
            mode: "RESIZE_BOX",
            editLabelEditorAfter: true,
            regionId: newRegion.id,
            freedom: [1, 1],
            original: { x, y, w: newRegion.w, h: newRegion.h },
            isNew: true,
          })
          break
        }
        case "create-skeleton": {
          if (typeof state.selectedCls !== "string" || !state.skeletonList.hasOwnProperty(state.selectedCls)) {
            return state;
          }

          const points = state.skeletonList[state.selectedCls].points;

          state = saveToHistory(state, "Create Skeleton")
          newRegion = {
            type: "skeleton",
            x: x,
            y: y,
            w: 0,
            h: 0,
            points,
            position: "relative",
            highlighted: true,
            editingLabels: false,
            color: defaultRegionColor,
            cls: defaultRegionCls,
            id: getRandomId(),
          }
          state = setIn(state, ["mode"], {
            mode: "RESIZE_SKELETON",
            editLabelEditorAfter: true,
            regionId: newRegion.id,
            freedom: [1, 1],
            original: { x, y, w: newRegion.w, h: newRegion.h },
            isNew: true,
          })
          break
        }
        case "create-polygon": {
          if (state.mode && state.mode.mode === "DRAW_POLYGON") break
          state = saveToHistory(state, "Create Polygon")
          newRegion = {
            type: "polygon",
            points: [
              [x, y],
              [x, y],
            ],
            open: true,
            highlighted: true,
            color: defaultRegionColor,
            cls: defaultRegionCls,
            id: getRandomId(),
          }
          state = setIn(state, ["mode"], {
            mode: "DRAW_POLYGON",
            regionId: newRegion.id,
          })
          break
        }
        case "create-expanding-line": {
          state = saveToHistory(state, "Create Expanding Line")
          newRegion = {
            type: "expanding-line",
            unfinished: true,
            points: [{ x, y, angle: null, width: null }],
            open: true,
            highlighted: true,
            color: defaultRegionColor,
            cls: defaultRegionCls,
            id: getRandomId(),
          }
          state = setIn(state, ["mode"], {
            mode: "DRAW_EXPANDING_LINE",
            regionId: newRegion.id,
          })
          break
        }
        case "create-line": {
          if (state.mode && state.mode.mode === "DRAW_LINE") break
          state = saveToHistory(state, "Create Line")
          newRegion = {
            type: "line",
            x1: x,
            y1: y,
            x2: x,
            y2: y,
            highlighted: true,
            editingLabels: false,
            color: defaultRegionColor,
            cls: defaultRegionCls,
            id: getRandomId(),
          }
          state = setIn(state, ["mode"], {
            mode: "DRAW_LINE",
            regionId: newRegion.id,
          })
          break
        }
        case "create-keypoints": {
          state = saveToHistory(state, "Create Keypoints")
          const [[keypointsDefinitionId, { landmarks, connections }]] =
            (Object.entries(state.keypointDefinitions): any)

          newRegion = {
            type: "keypoints",
            keypointsDefinitionId,
            points: getLandmarksWithTransform({
              landmarks,
              center: { x, y },
              scale: 1,
            }),
            highlighted: false,
            editingLabels: false,
            id: getRandomId(),
          }
          state = setIn(state, ["mode"], {
            mode: "RESIZE_KEYPOINTS",
            landmarks,
            centerX: x,
            centerY: y,
            regionId: newRegion.id,
            isNew: true,
          })
          break
        }
        case "point-ref": {
          const imgW = state.images[state.selectedImage].pixelSize.w
          const imgH = state.images[state.selectedImage].pixelSize.h

          return setIn(
              state,
              ["predicts"], [
                ...state.predicts,
                {id: getRandomId(), type: "point", x: x * imgW, y: y * imgH},
              ]
            );
        }
        // case "brush-tool":
        // case "eraser":
        // {
        //   if ((state.mode && state.mode.mode === "DRAW_BRUSH") || (state.selectRegion && state.selectRegion.type === "brush") ) break
        //   state = saveToHistory(state, "Create Brush");
        //   if(!state.selectedRegion){
        //     newRegion = {
        //       type: "brush",
        //       highlighted: true,
        //       color: defaultRegionColor,
        //       cls: defaultRegionCls,
        //       id: getRandomId(),
        //       sparse_rle: [],
        //       hidden:true,
        //     }
        //     state = setIn(state, ["mode"], {
        //       mode: "DRAW_BRUSH",
        //       regionId: newRegion.id,
        //     })
        //     state = setIn(state, ["selectRegion"], {
        //       ...newRegion,
        //     })
        //   }else{
        //     state = setIn(state, ["mode"], {
        //       mode: "DRAW_BRUSH",
        //       regionId: state.selectedRegion.id,
        //     })
        //   }
        //   break
        // }

        case "create-polyline":
          const regionId = state?.mode?.regionId
          const [region] = regionId ? getRegion(regionId) : [null]

          if (region) {
            const regionIndex = getRegionIndex(regionId);
            const currentPoints = region?.points ?? [];
            const lastPoint = currentPoints[currentPoints.length - 1];
            const newPoint = [x,y];
            const middleLastPoint = addMidpoint(lastPoint, newPoint);
            state = setIn(
              state,
              [...pathToActiveImage, "regions", regionIndex, ],
              {...region,
                points: [...currentPoints, middleLastPoint, newPoint],
              }
            );
          } else {
            newRegion = {
              type: "polyline",
              open: true,
              highlighted: true,
              color: defaultRegionColor,
              cls: defaultRegionCls,
              id: getRandomId(),
              hidden:false,
              points: [[x, y]],
              expandingPoint: [x, y],
              isNew: true,
            }
            state = setIn(state, ["mode"], {
              mode: "DRAW_POLYLINE",
              regionId: newRegion.id,
            })
            state = setIn(state, ["selectRegion"], {
              ...newRegion,
            })
          }

          break

        case "create-cuboid": {
          state = saveToHistory(state, "Create Cuboid")
          newRegion = {
            type: "cuboid",
            x: x,
            y: y,
            w: 0,
            h: 0,
            points: [
              {x: 0, y: 0, name: "top-1", to: ["top-2", "bottom-1"]},
              {x: 0.6, y: 0, name: "top-2", to: ["top-3", "bottom-2"]},
              {x: 1, y: 0.3, name: "top-3", to: ["top-4", "bottom-3"]},
              {x: 0.4, y: 0.3, name: "top-4", to: ["top-1", "bottom-4"]},
              {x: 0, y: 0.7, name: "bottom-1", to: ["bottom-2"]},
              {x: 0.6, y: 0.7, name: "bottom-2", to: ["bottom-3"]},
              {x: 1, y: 1, name: "bottom-3", to: ["bottom-4"]},
              {x: 0.4, y: 1, name: "bottom-4", to: ["bottom-1"]},
            ],
            position: "relative",
            highlighted: true,
            editingLabels: false,
            color: defaultRegionColor,
            cls: defaultRegionCls,
            id: getRandomId(),
          }
          state = setIn(state, ["mode"], {
            mode: "RESIZE_CUBOID",
            editLabelEditorAfter: true,
            regionId: newRegion.id,
            freedom: [1, 1],
            original: { x, y, w: newRegion.w, h: newRegion.h },
            isNew: true,
          })
          break
        }

        default:
          break
      }

      const regions = getIn(state, pathToActiveImage).regions;
      // const unselectOnly = !!regions.find(r => r.editingLabels || r.highlighted);

      if (newRegion) {
        const regions = [...(getIn(state, pathToActiveImage).regions || [])]
          .map((r) =>
            setIn(r, ["editingLabels"], false).setIn(["highlighted"], false)
          )
          .concat([newRegion])

        return setIn(state, [...pathToActiveImage, "regions"], regions)
      } else if (!!regions.find(r => r.editingLabels || r.highlighted)) {
        const regions = [...(getIn(state, pathToActiveImage).regions || [])]
          .map((r) =>
            setIn(r, ["editingLabels"], false).setIn(["highlighted"], false)
          )

        return setIn(state, [...pathToActiveImage, "regions"], regions)
      }

      return state;
    }
    case "MOUSE_UP": {
      const { x, y } = action

      const { mouseDownAt = { x, y } } = state

      if (!state.mode) {
        if (state.selectedTool === "create-polygon") {
          state = requestSave(state)
        }

        return state
      }

      state = setIn(state, ["mouseDownAt"], null)
      switch (state.mode.mode) {
        case "RESIZE_CUBOID":
        case "RESIZE_SKELETON":
        case "RESIZE_BOX": {
          if (
            state.annotationType === "image" &&
            state.selectedTool === "auto-annotate"
          ) {
            if (
              Math.abs(state.mode.original.x - x) < 0.002 ||
              Math.abs(state.mode.original.y - y) < 0.002
            ) {
              return setIn(
                modifyRegion(state.mode.regionId, null),
                ["mode"],
                null
              )
            }

            // if (state.images[state.selectedImage].src === processingImage) {
            //   return setIn(
            //     modifyRegion(state.mode.regionId, null),
            //     ["mode"],
            //     null
            //   )
            // }

            const region = getRegion(state.mode.regionId)[0]
            const imgW = state.images[state.selectedImage].pixelSize.w
            const imgH = state.images[state.selectedImage].pixelSize.h

            return setIn(
              setIn(
                modifyRegion(state.mode.regionId, null),
                ["mode"],
                null,
              ),
              ["predicts"], [
                ...state.predicts,
                {id: getRandomId(), type: "rect", x: region.x * imgW, y: region.y * imgH, w: region.w * imgW, h: region.h * imgH}
              ]
            );
          }

          const updatedRegionData = {};

          if (state.mode.isNew) {
            if (
              Math.abs(state.mode.original.x - x) < 0.002 ||
              Math.abs(state.mode.original.y - y) < 0.002
            ) {
              return requestSave(
                setIn(modifyRegion(state.mode.regionId), ["mode"], null)
              )
            }

            if (state.mode.mode === "RESIZE_SKELETON" || state.mode.mode === "RESIZE_CUBOID") {
              const [region, regionIndex] = getRegion(state.mode.regionId);

              if (region.position === "relative") {
                updatedRegionData["position"] = "absolute"
                updatedRegionData["points"] = region.points.map(p => {
                  return {
                    ...p,
                    x: region.x + (p.x * region.w),
                    y: region.y + (p.y * region.h),
                  };
                });
              }
            }
          }

          state = modifyRegion(state.mode.regionId, {
            editingLabels: state.mode.editLabelEditorAfter,
            // Skeleton need to be moved to its correct position, so keep it highlighted after drawn.
            ...state.mode.isNew && state.selectedTool !== "create-skeleton" && state.selectedTool !== "create-cuboid" ? { highlighted: false } : {},
            ...updatedRegionData,
          })
            .setIn(["mode"], null)
            .setIn(["saveState"], "start")
            // Keep current selected tool after drawn
            //.setIn(["selectedTool"], "select");

          return state;
        }
        case "MOVE_REGION":
        case "RESIZE_KEYPOINTS":
        case "MOVE_POLYGON_POINT": {
          return { ...requestSave(state), mode: null }
        }
        case "MOVE_KEYPOINT": {
          return { ...requestSave(state), mode: null }
        }
        case "CREATE_POINT_LINE": {
          return requestSave(state)
        }
        case "DRAW_EXPANDING_LINE": {
          const [expandingLine, regionIndex] = getRegion(state.mode.regionId)
          if (!expandingLine) return state
          let newExpandingLine = expandingLine
          const lastPoint =
            expandingLine.points.length !== 0
              ? expandingLine.points.slice(-1)[0]
              : mouseDownAt
          let jointStart
          if (expandingLine.points.length > 1) {
            jointStart = expandingLine.points.slice(-2)[0]
          } else {
            jointStart = lastPoint
          }
          const mouseDistFromLastPoint = Math.sqrt(
            (lastPoint.x - x) ** 2 + (lastPoint.y - y) ** 2
          )
          if (mouseDistFromLastPoint > 0.002) {
            // The user is drawing has drawn the width for the last point
            const newPoints = [...expandingLine.points]
            for (let i = 0; i < newPoints.length - 1; i++) {
              if (newPoints[i].width) continue
              newPoints[i] = {
                ...newPoints[i],
                width: lastPoint.width,
              }
            }
            newExpandingLine = setIn(
              expandingLine,
              ["points"],
              fixTwisted(newPoints)
            )
          } else {
            return state
          }
          return setIn(
            requestSave(state),
            [...pathToActiveImage, "regions", regionIndex],
            newExpandingLine
          )
        }
        case "MOVE_POLYLINE_POINT":{
          const [region] = getRegion(state.mode.regionId);

          if (region.isNew) {
            return setIn(state, ["mode"], {
              mode: "DRAW_POLYLINE",
              regionId: region.id,
            });
          } else {
            return requestSave(state).setIn(["mode"], null);
          }
        }
        case "MOVE_SKELETON_POINT": {
          return requestSave(state).setIn(["mode"], null);
        }
        default:
          return state
      }
    }
    case "ADD_AUTO_ANNOTATE_REGIONS": {
      let newRegions = []
      let clsList = [...state.regionClsList]
      let clsLowerMap = {}
      let clsColorsList = { ...state.clsColorsList }

      for (let i = 0; i < clsList.length; i++) {
        clsLowerMap[clsList[i].toLowerCase()] = clsList[i]
      }

      for (let i = 0; i < action.data.length; i++) {
        let label = null

        if (action.data[i]["type"] === "rectanglelabels") {
          if (action.data[i]["value"]["rectanglelabels"].length > 0) {
            label = action.data[i]["value"]["rectanglelabels"][0].toLowerCase();
          } else {
            label = "(unknown)";
          }

          newRegions.push({
            type: "box",
            x:
              (action.regionX +
                (parseFloat(action.data[i]["value"]["x"]) * action.regionW) /
                  100) /
              action.imageW,
            y:
              (action.regionY +
                (parseFloat(action.data[i]["value"]["y"]) * action.regionH) /
                  100) /
              action.imageH,
            w:
              (parseFloat(action.data[i]["value"]["width"]) * action.regionW) /
              100 /
              action.imageW,
            h:
              (parseFloat(action.data[i]["value"]["height"]) * action.regionH) /
              100 /
              action.imageH,
            highlighted: false,
            editingLabels: false,
            color: clsColorsList[label] ?? "#FFFFFF",
            cls: label,
            id: getRandomId(),
          })
        } else if (action.data[i]["type"] === "polygonlabels") {
          if (action.data[i]["value"]["polygonlabels"].length > 0) {
            label = action.data[i]["value"]["polygonlabels"][0].toLowerCase();
          } else {
            label = "(unknown)";
          }

          const points = action.data[i]["value"]["points"].map((p) => {
            return [
              ((p[0] * action.regionW) / 100 + action.regionX) / action.imageW,
              ((p[1] * action.regionH) / 100 + action.regionY) / action.imageH,
            ];
            // return [p[0]/100, p[1]/100];
          })

          // const result = []
          //
          // Array.from(points).forEach((p) => {
          //   if (result.length === 0) {
          //     result.push(p)
          //     return
          //   }
          //
          //   if (
          //     Math.abs(p[0] - result[result.length - 1][0]) < 0.007 &&
          //     Math.abs(p[1] - result[result.length - 1][1]) < 0.007
          //   ) {
          //     return
          //   }
          //
          //   result.push(p)
          // })

          newRegions.push({
            type: "polygon",
            points: points,
            open: false,
            highlighted: false,
            color: clsColorsList[label] ?? "#FF0000",
            cls: label,
            id: getRandomId(),
            editingLabels: false,
          })
        }
      }

      return requestSave(
        setIn(
          setIn(
            setIn(
              // setIn(
                setIn(state, ["loadingText"], null),
                // ["selectedTool"],
                // "select"
              // ),
              ["regionClsList"],
              [...clsList]
            ),
            ["clsColorsList"],
            clsColorsList
          ),
          [...pathToActiveImage, "regions"],
          [...activeImage.regions, ...newRegions]
        )
      )
    }
    case "OPEN_REGION_EDITOR": {
      const { region } = action
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      const newRegions = setIn(
        activeImage.regions.map((r) => ({
          ...r,
          highlighted: false,
          editingLabels: false,
        })),
        [regionIndex],
        {
          ...(activeImage.regions || [])[regionIndex],
          highlighted: true,
          editingLabels: true,
        }
      )
      return setIn(state, [...pathToActiveImage, "regions"], newRegions)
    }
    case "CLOSE_REGION_EDITOR": {
      const { region } = action
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      return requestSave(
        setIn(state, [...pathToActiveImage, "regions", regionIndex], {
          ...(activeImage.regions || [])[regionIndex],
          editingLabels: false,
        })
      )
    }
    case "DELETE_REGION": {
      const regionIndex = getRegionIndex(action.region)
      if (regionIndex === null) return state
      const newRegions = (activeImage.regions || []).filter((r) => r.id !== action.region.id);
      state = setIn(state, ["selectedRegion"], newRegions.find(r => !!r.highlighted));
      return setIn(
        requestSave(state),
        [...pathToActiveImage, "regions"],
        newRegions
      )
    }
    case "DELETE_SELECTED_REGION": {
      state =  setIn(
        requestSave(state),
        [...pathToActiveImage, "regions"],
        (activeImage.regions || []).filter((r) => !r.highlighted)
      )
      state = setIn(state, ["selectedRegion"], null)
      return state
    }
    case "HEADER_BUTTON_CLICKED": {
      const buttonName = action.buttonName.toLowerCase()
      switch (buttonName) {
        case "prev": {
          if (currentImageIndex === null) return state
          if (currentImageIndex === 0) return state
          return setNewImage(
            state.images[currentImageIndex - 1],
            currentImageIndex - 1
          )
        }
        case "next": {
          if (currentImageIndex === null) return state
          if (currentImageIndex === state.images.length - 1) return state
          return setNewImage(
            state.images[currentImageIndex + 1],
            currentImageIndex + 1
          )
        }
        case "clone": {
          if (currentImageIndex === null) return state
          if (currentImageIndex === state.images.length - 1) return state
          return setIn(
            setNewImage(
              state.images[currentImageIndex + 1],
              currentImageIndex + 1
            ),
            ["images", currentImageIndex + 1, "regions"],
            activeImage.regions
          )
        }
        case "settings": {
          return setIn(state, ["settingsOpen"], !state.settingsOpen)
        }
        case "help": {
          return state
        }
        case "fullscreen": {
          return setIn(setIn(state, ["isExpand"], false), ["fullScreen"], true)
        }
        case "exit fullscreen":
        case "window": {
          return setIn(state, ["fullScreen"], false)
        }
        case "hotkeys": {
          return state
        }
        case "exit":
        case "done": {
          return state
        }
        // case "undo": {
        //   return state
        // }
        // case "redo": {
        //   return state
        // }
        default:
          return state
      }
    }
    case "SELECT_TOOL": {
      if(action.selectedTool === "select" && state?.mode?.mode === "DRAW_POLYLINE" && state?.mode?.regionId){
        const regions = activeImage.regions.map((i) => i.id === state.mode.regionId ? {...i, expandingPoint:null} : i)
        state = setIn(
          requestSave(state),
          [...pathToActiveImage, "regions"],
          regions
        )
        state = setIn(state, ["mode"], null)
      }
      if (action.selectedTool === "show-tags") {
        setInLocalStorage("showTags", !state.showTags)
        return setIn(state, ["showTags"], !state.showTags)
      } else if (action.selectedTool === "show-mask") {
        return setIn(state, ["showMask"], !state.showMask)
      }
      if (action.selectedTool === "modify-allowed-area" && !state.allowedArea) {
        state = setIn(state, ["allowedArea"], { x: 0, y: 0, w: 1, h: 1 })
      }
      if (action.selectedTool !== "point-ref") {
        state = setIn(state, ["pointRef"], null)
      }
      if (action.selectedTool === "create-skeleton") {
        state = setIn(state, ["selectedRegion"], null)
      }
      // if(action.selectTool !== "brush-tool" && action.selectedTool !== "eraser" && state.mode && state.mode.mode === "DRAW_BRUSH"){
      //   const regions = activeImage.regions
      //   state = setIn(
      //     requestSave(state),
      //     [...pathToActiveImage, "regions"],
      //     (regions || []).map((r) => r.type == "brush" ? {...r, hidden:false} : r )
      //   )
      // }
      // if((action.selectedTool === "brush-tool" || action.selectedTool === "eraser") && state.selectedRegion){
      //   const regionId = state.selectedRegion.id
      //   const regionIndex = getRegionIndex(regionId)
      //   if (regionIndex === undefined) return state;
      //   state = setIn(
      //     state,
      //     [...pathToActiveImage, "regions", regionIndex, "hidden"],
      //     true
      //   );
      // }
        // state = setIn(state, ["mode"], null)
      return setIn(state ,["selectedTool"], action.selectedTool)
    }
    case "CANCEL": {
      const { mode } = state
      if (mode) {
        switch (mode.mode) {
          case "DRAW_EXPANDING_LINE":
          case "SET_EXPANDING_LINE_WIDTH":
          case "DRAW_POLYLINE":
          case "DRAW_POLYGON": {
            const { regionId } = mode
            return modifyRegion(regionId, null)
          }
          case "MOVE_POLYLINE_POINT":
          case "MOVE_POLYGON_POINT":
          case "RESIZE_BOX":
          case "MOVE_REGION": {
            return setIn(state, ["mode"], null)
          }
          default:
            return state
        }
      }
      // Close any open boxes
      const regions: any = activeImage.regions
      if (regions && regions.some((r) => r.editingLabels)) {
        return setIn(
          state,
          [...pathToActiveImage, "regions"],
          regions.map((r) => ({
            ...r,
            editingLabels: false,
          }))
        )
      } else if (regions) {
        return setIn(
          state,
          [...pathToActiveImage, "regions"],
          regions.map((r) => ({
            ...r,
            highlighted: false,
          }))
        )
      }
      break
    }
    case "CLEAR_ALL_REGIONS":
      return setIn(requestSave(state), [...pathToActiveImage, "regions"], [])
    case "SHOW_LOADING":
      return showLoading(state, action.text)
    case "HIDE_LOADING":
      return hideLoading(state)
    case "SHOW_ERROR":
      return showError(state, action.text, action.actions)
    case "HIDE_ERROR":
      return hideError(state)
    case "DRAGGING_START":
      if (state.selectedTool === "brush") return state
      return setIn(state, ["dragging"], true)
    case "DRAGGING_STOP":
      return setIn(state, ["dragging"], false)
    case "COPY_SELECTED_REGION":
      if (state.selectedTool === "brush") {
        return state
      }

      const highlightedRegion = activeImage.regions.filter((r) => r.highlighted)

      if (highlightedRegion.length === 0) {
        return state
      }

      copiedRegion = { ...highlightedRegion[0] }
      return state
    case "PASTE_COPIED_REGION":
      if (typeof copiedRegion !== "object") return state

      return setIn(
        state,
        [...pathToActiveImage, "regions"],
        [
          ...activeImage.regions.map((r) => {
            return { ...r, highlighted: false, editingLabels: false }
          }),
          { ...copiedRegion, id: getRandomId() },
        ]
      )
    case "SET_ANNOTATIONS": {
      state = setIn(state, ["annotations"], action.annotations)

      if (!state.annotationId && action.annotations.length > 0) {
        state = changeAnnotation(
          state,
          action.annotations[action.annotations.length - 1].id
        )
      }

      return state
    }
    case "SELECT_ANNOTATION": {
      return changeAnnotation(state, action.annotationId)
    }
    case "UPDATE_RESULT": {
      for (let i = 0; i < state.annotations.length; i++) {
        if (state.annotations[i].id !== action.annotationId) {
          continue
        }

        state = setIn(
          state,
          ["annotations", i, "result"],
          action.formattedResult
        )
        break
      }

      return state
    }
    case "SAVE_REGIONS": {
      return saveRegion(state)
    }
    case "REGIONS_SAVED": {
      return setIn(state, ["saveState"], null)
    }
    case "SAVE_FAILED": {
      return setIn(state, ["saveState"], "failed")
    }
    case "IMAGE_LOADED": {
      return setIn(state, ["isLoadingImage"], false)
    }
    case "EXPAND": {
      return setIn(state, ["isExpand"], !state.isExpand)
    }
    case "IMAGE_ERROR": {
      return setIn(state, ["isImageError"], true)
    }
    case "START_FETCHING_ML_BACKEND": {
      return setIn(state, ["fetchingMlBackend"], true)
    }
    case "STOP_FETCHING_ML_BACKEND": {
      return setIn(state, ["fetchingMlBackend"], false)
    }
    case "SET_ML_BACKEND": {
      return setIn(setIn(state, ["failedToGetMlBackend"], false), ["mlBackend"], action.url)
    }
    case "MOUSE_RIGHT_CLICK": {
      if (state.mode && state.mode.mode === "DRAW_POLYLINE") {
        const [region, regionIndex] = getRegion(state.mode.regionId);
        if (region.points?.length > 1) {
          return requestSave(state)
            .setIn(
              [...pathToActiveImage, "regions", regionIndex],
              { ...region, expandingPoint: null, isNew: false }
            )
            .setIn(["mode"], null)
        } else {
          const currentPoints = region.points;
          const lastPoint = currentPoints[currentPoints.length - 1];
          const newPoint = [action.event.x, action.event.y];
          const middleLastPoint = addMidpoint(lastPoint, newPoint);
          return requestSave(state)
          .setIn(
            [...pathToActiveImage, "regions", regionIndex],
            {...region, expandingPoint: null, isNew: false, points: [...currentPoints, middleLastPoint,newPoint]}

          )
          .setIn(["mode"], null)
        }
      }

      return state;
    }
    case "MOVE_SKELETON_POINT": {
      return setIn(state, ["mode"], {
        mode: "MOVE_SKELETON_POINT",
        regionId: action.regionId,
        pointIndex: action.pointIndex,
      });
    }
    case "CREATE_BRUSH_REGION": {
      const {rle, width, height} = action;
      let defaultRegionCls = state.selectedCls,
        defaultRegionColor = getClsColor(state, state.selectedCls)

      const newRegion = {
        type: "brush",
        highlighted: true,
        color: defaultRegionColor,
        cls: defaultRegionCls,
        id: getRandomId(),
        sparse_rle: rle,
        visible: true,
        width,
        height,
      }

      const regions = [...(getIn(state, pathToActiveImage).regions || [])]
        .map((r) =>
          setIn(r, ["editingLabels"], false).setIn(["highlighted"], false)
        )
        .concat([newRegion])

      return requestSave(
        setIn(
          setIn(state, [...pathToActiveImage, "regions"], regions),
          ["selectedRegion"],
          newRegion,
        )
      );
    }
    case "UPDATE_BRUSH_REGION": {
      const { rle, regionId } = action;
      const [region, regionIndex] = getRegion(regionId)

      if (!region) {
        return state;
      }

      return requestSave(
        setIn(
          setIn(
            state,
            [...pathToActiveImage, "regions", regionIndex, "sparse_rle"],
            rle,
          ),
          ["selectedRegion", "sparse_rle"],
          rle
        )
      );
    }
    case "POP_PREDICT":
      if (state.predicts.length === 0) {
        return state;
      }

      return setIn(state, ["predicts"], state.predicts.slice(1));
    case "PREDICT_PROMPT":
      return setIn(
        state,
        ["predicts"],
        [
          ...state.predicts,
          { id: getRandomId(), type: "prompt", prompt: action.prompt },
        ]
      )
    case "PREDICT_VOICE":
      return setIn(
        state,
        ["predicts"],
        [
          ...state.predicts,
          { id: getRandomId(), type: "voice", voice: action.voice },
        ]
      )
    case "PREDICT_IMAGE_PREF":
      return setIn(
        state,
        ["predicts"],
        [
          ...state.predicts,
          { id: getRandomId(), type: "image_pref", image_pref: action.image_pref, image_pref_label: action.image_pref_label },
        ]
      )
    case "FAILED_TO_GET_ML_BACKEND":
      return setIn(state, ["failedToGetMlBackend"], true);
    case "UPDATE_PREDICT_PARAMS":
      return setIn(
        state,
        ["predicts"],
        state.predicts.map(p => {
          if (p.id !== action.id) return p;

          return {...p, confidence_threshold: action.confidence_threshold, iou_threshold: action.iou_threshold};
        }),
      );
    case "REMOVE_PREDICT":
      return setIn(
        state,
        ["predicts"],
        state.predicts.filter(p => p.id !== action.id),
      );
    case "PREDICT_BRUSH":
      return setIn(
        state,
        ["predicts"],
        [
          ...state.predicts,
          {
            id: getRandomId(),
            type: "brush",
            image: action.image,
            x: action.x,
            y: action.y,
            w: action.w,
            h: action.h,
          },
        ]
      )
    default:
      break
  }
  return state
}
