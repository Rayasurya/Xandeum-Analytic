// @flow weak

import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect, useMemo,
} from "react"
import { Matrix } from "transformation-matrix-js"
import Crosshairs from "../Crosshairs"
import type {
  Region,
  Point,
  Polygon,
  Box,
  Keypoints,
  // KeypointsDefinition,
} from "./region-tools.js"
import { makeStyles } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import styles from "./styles"
import PreventScrollToParents from "../PreventScrollToParents"
import useWindowSize from "../hooks/use-window-size.js"
import useMouse from "./use-mouse"
import useProjectRegionBox from "./use-project-box"
import useExcludePattern from "../hooks/use-exclude-pattern"
import { useRafState } from "react-use"
import PointDistances from "../PointDistances"
// import RegionTags from "../RegionTags"
// import RegionLabel from "../RegionLabel"
// import ImageMask from "../ImageMask"
import RegionSelectAndTransformBoxes from "../RegionSelectAndTransformBoxes"
import VideoOrImageCanvasBackground from "../VideoOrImageCanvasBackground"
import useEventCallback from "use-event-callback"
import RegionShapes from "../RegionShapes"
import useWasdMode from "./use-wasd-mode"
import { fabric } from "fabric"
// import { debounce } from "lodash";
import { getRleFromCanvas } from "../utils/getRleFromCanvas.js"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const useStyles = makeStyles(() => styles)
fabric.Object.prototype.objectCaching = false

//brushCanvas
// let brushDrawingCanvas
// let mousecursor
// const cursorOpacity = 0.5;
const brush_width = 10;
const parseColorRgba = (hex,opacity) =>{
  let bigint = parseInt(hex.replace("#", ""), 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  return [r, g, b, opacity];
}

// draw selected brush base on rle data
/**
 *
 * @param {number[]} rle
 * @param {fabric.Canvas} canvas
 * @param {[number, number, number, number]} color
 * @param {number} regionWidth
 * @param {AbortSignal} abortSignal
 */
const drawRleDataOnCanvas = (rle, canvas, color, regionWidth, abortSignal) => {
  try {
    // const ratio = renderWidth / regionWidth;
    // console.log("Render RLE ratio:", ratio);
    color = "rgba(" + color.join(",") + ")";
    // const ctx = canvas.getContext("2d");
    // ctx.fillStyle = "rgba(" + color.join(",") + ")";

    for (let i = 0; i < rle.length; i = i + 2) {
      // const start = rle[i];
      // const runLength = rle[i + 1];
      // const x = Math.floor(start % regionWidth);
      // const y = Math.floor(start / regionWidth);
      // const x2 = Math.floor(x + runLength);

      // const line = new fabric.Line([x * ratio, y * ratio, x2 * ratio, y * ratio], {
      //   width: 1,
      //   stroke: color,
      //   selectable: false
      // });
      //
      // canvas.add(line);

      let latestIndex = rle[i];

      for (let j = rle[i]; j <= rle[i] + rle[i + 1]; j++) {
        if (abortSignal.aborted) {
          return;
        }

        if (j % regionWidth === 0) {
          const x1 = latestIndex % regionWidth;
          const x2 = regionWidth;
          const y = Math.floor(latestIndex / regionWidth);
          const line = new fabric.Line([x1, y, x2, y], {width: 1, stroke: color, selectable: false});
          canvas.add(line);
          latestIndex = j + 1;
        }

        // const rect = new fabric.Rect({
        //   left: Math.floor(j % regionWidth),
        //   top: Math.floor(j / regionWidth),
        //   fill: color,
        //   width: 1,
        //   height: 1,
        //   selectable: false
        // });
        //
        // canvas.add(rect);

        // ctx.fillRect(Math.floor(j % regionWidth), Math.floor(j / regionWidth), 1, 1);
      }

      const x1 = latestIndex % regionWidth;
      const x2 = (rle[i] + rle[i + 1]) % regionWidth;
      const y = Math.floor(latestIndex / regionWidth);
      const line = new fabric.Line([x1, y, x2, y], {width: 1, stroke: color, selectable: false});
      canvas.add(line);
    }
  } catch(e) {
    console.error(e);
  }
}


type Props = {
  regions: Array<Region>,
  imageSrc?: string,
  videoSrc?: string,
  videoTime?: number,
  keypointDefinitions?: KeypointDefinitions,
  onMouseMove?: ({ x: number, y: number }) => any,
  onMouseDown?: ({ x: number, y: number }) => any,
  onMouseUp?: ({ x: number, y: number }) => any,
  onContextMenu?: ({ x: number, y: number }) => any,
  dragWithPrimary?: boolean,
  zoomWithPrimary?: boolean,
  createWithPrimary?: boolean,
  brushWithPrimary?: boolean,
  showTags?: boolean,
  realSize?: { width: number, height: number, unitName: string },
  showCrosshairs?: boolean,
  // showMask?: boolean,
  showHighlightBox?: boolean,
  showPointDistances?: boolean,
  pointDistancePrecision?: number,
  // regionClsList?: Array<string>,
  // regionTagList?: Array<string>,
  allowedArea?: { x: number, y: number, w: number, h: number },
  // RegionEditLabel?: Node,
  videoPlaying?: boolean,
  zoomOnAllowedArea?: boolean,
  fullImageSegmentationMode?: boolean,
  // autoSegmentationOptions?: Object,
  modifyingAllowedArea?: boolean,
  // allowComments?: Boolean,
  // onChangeRegion: (Region) => any,
  // onBeginRegionEdit: (Region) => any,
  // onCloseRegionEdit: (Region) => any,
  // onDeleteRegion: (Region) => any,
  onBeginBoxTransform: (Box, [number, number]) => any,
  onBeginMovePolygonPoint: (Polygon, index: number) => any,
  onBeginMoveKeypoint: (Keypoints, index: number) => any,
  onAddPolygonPoint: (Polygon, point: [number, number], index: number) => any,
  onSelectRegion: (Region) => any,
  onBeginMovePoint: (Point) => any,
  onImageOrVideoLoaded: ({
    naturalWidth: number,
    naturalHeight: number,
    duration?: number,
  }) => any,
  onChangeVideoTime: (number) => any,
  onRegionClassAdded: () => {},
  onChangeVideoPlaying?: Function,
  allowFreeDrawing: Boolean,
  // mode: boolean,
  // isFullScreen: boolean,
  pointRef: { x: number, y: number } | null,
  onImageError: () => void,
  isImageError: boolean,
  currentTool: string,
  selectedClsColor?: string,
  selectedRegion?: Region,
  mouseDownAt: {x: number, y: number} | null,
}

const getDefaultMat = (allowedArea = null, { iw, ih } = {}) => {
  let mat = Matrix.from(1, 0, 0, 1, -10, -10)
  if (allowedArea && iw) {
    mat = mat
      .translate(allowedArea.x * iw, allowedArea.y * ih)
      .scaleU(allowedArea.w + 0.05)
  }
  return mat
}

export const ImageCanvas = ({
  regions,
  imageSrc,
  videoSrc,
  videoTime,
  realSize,
  showTags,
  onMouseMove = () => null,
  onMouseDown = () => null,
  onMouseUp = () => null,
  onContextMenu = () => null,
  dragWithPrimary = false,
  zoomWithPrimary = false,
  createWithPrimary = false,
  brushWithPrimary = false,
  pointDistancePrecision = 0,
  // regionClsList,
  // regionTagList,
  showCrosshairs,
  showHighlightBox = true,
  showPointDistances,
  allowedArea,
  // RegionEditLabel = null,
  videoPlaying = false,
  // showMask = true,
  fullImageSegmentationMode,
  // autoSegmentationOptions,
  onImageOrVideoLoaded,
  // onChangeRegion,
  // onBeginRegionEdit,
  // onCloseRegionEdit,
  onBeginBoxTransform,
  onBeginMovePolygonPoint,
  onAddPolygonPoint,
  onBeginMoveKeypoint,
  onSelectRegion,
  onBeginMovePoint,
  // onDeleteRegion,
  onChangeVideoTime,
  onChangeVideoPlaying,
  // onRegionClassAdded,
  zoomOnAllowedArea = true,
  modifyingAllowedArea = false,
  keypointDefinitions,
  // allowComments,
  allowFreeDrawing,
  dispatch,
  // onBrushSelected,
  keyDraggingEnabled,
  // showTasks = true,
  pointRef = null,
  mode = null,
  // isFullScreen = false,
  // isExpand = false,
  onImageError,
  isImageError,
  currentTool,
  selectedClsColor,
  selectedRegion,
  onBeginMoveSkeletonPoint,
}: Props) => {
  const classes = useStyles()
  const canvasEl = useRef(null)
  const fCanvasEl = useRef(null)
  // const cursorCanvasEl = useRef(null)
  const brushDrawingCanvasEl = useRef(null)
  const layoutParams = useRef({})
  const [dragging, changeDragging] = useRafState(false)
  // const [maskImagesLoaded, changeMaskImagesLoaded] = useRafState(0)
  const [zoomStart, changeZoomStart] = useRafState(null)
  const [zoomEnd, changeZoomEnd] = useRafState(null)
  const [mat, changeMat] = useRafState(getDefaultMat())
  // const maskImages = useRef({})
  const windowSize = useWindowSize()
  const getLatestMat = useEventCallback(() => mat)
  const { mouseEvents, mousePosition, setMousePosition } = useMouse({
    canvasEl,
    dragging,
    mat,
    layoutParams,
    changeMat,
    zoomStart,
    zoomEnd,
    changeZoomStart,
    changeZoomEnd,
    changeDragging,
    zoomWithPrimary,
    dragWithPrimary,
    onMouseMove,
    onMouseDown,
    onMouseUp,
    onContextMenu
  })
  const [imageId] = useState("_" + Math.random().toString().substring(2))
  const unmounted = useRef(false);
  const [brushDrawingCanvas, setBrushDrawingCanvas] = useState<fabric.Canvas>(null);
  const isBrushUpdated = useRef(false);
  useWasdMode({ getLatestMat, changeMat })
  useLayoutEffect(() => changeMat(mat.clone()), [changeMat, mat, windowSize])

  useEffect(() => {
    return () => {
      unmounted.current = true;
    }
  })

  // const innerMousePos = mat.applyToPoint(
  //   mousePosition.current.x,
  //   mousePosition.current.y
  // )

  const projectRegionBox = useProjectRegionBox({ layoutParams, mat })

  const [imageDimensions, changeImageDimensions] = useState()
  const imageLoaded = useMemo(() => Boolean(imageDimensions && imageDimensions.naturalWidth), [imageDimensions]);

  const onVideoOrImageLoaded = useEventCallback(
    ({ naturalWidth, naturalHeight, base64, duration }) => {
      const dims = { naturalWidth, naturalHeight, base64, duration }

      if (onImageOrVideoLoaded) {
        onImageOrVideoLoaded(dims)
      }

      changeImageDimensions(dims)

      // Redundant update to fix rerendering issues
      setTimeout(() => {
        if (unmounted.current) return
        changeImageDimensions(dims)
      }, 10)
    }
  )

  const excludePattern = useExcludePattern()

  const canvas = canvasEl.current
  if (canvas && imageLoaded) {
    const { clientWidth, clientHeight } = canvas

    const fitScale = Math.max(
      imageDimensions.naturalWidth / (clientWidth - 20),
      imageDimensions.naturalHeight / (clientHeight - 20)
    )

    const [iw, ih] = [
      imageDimensions.naturalWidth / fitScale,
      imageDimensions.naturalHeight / fitScale,
    ]

    layoutParams.current = {
      iw,
      ih,
      fitScale,
      canvasWidth: clientWidth,
      canvasHeight: clientHeight,
    }
  }

  const { iw, ih } = layoutParams.current
  const imagePosition = {
    topLeft: mat.clone().inverse().applyToPoint(0, 0),
    bottomRight: mat.clone().inverse().applyToPoint(iw, ih),
  }

  const stylePosition = useMemo(() => {
    let width = imagePosition.bottomRight.x - imagePosition.topLeft.x
    let height = imagePosition.bottomRight.y - imagePosition.topLeft.y
    return {
      // imageRendering: "pixelated",
      left: imagePosition.topLeft.x,
      top: imagePosition.topLeft.y,
      width: isNaN(width) ? 0 : width,
      height: isNaN(height) ? 0 : height,
    }
  }, [
    imagePosition.topLeft.x,
    imagePosition.topLeft.y,
    imagePosition.bottomRight.x,
    imagePosition.bottomRight.y,
  ])

  const viewportCanvasSize = useMemo(() => {
    return {
      width: stylePosition.width,
      height: stylePosition.height,
    }
  }, [stylePosition.width, stylePosition.height]);

  useEffect(
    function () {
      if (!imageLoaded || !allowFreeDrawing) return
      let fCanvas

      fCanvas = new fabric.Canvas(fCanvasEl.current, {
        backgroundColor: "#FFFFFF",
        width: fCanvasEl.current.parentElement.clientWidth,
        height: fCanvasEl.current.parentElement.clientHeight,
        preserveObjectStacking: true,
        selection: false,
      })

      fCanvas.isDrawingMode = true
      fCanvas.freeDrawingBrush.color = "red"
      fCanvas.freeDrawingBrush.width = 2
      fCanvas.wrapperEl.style.position = "absolute"
      fCanvas.wrapperEl.style.left = 0
      fCanvas.wrapperEl.style.top = 0
      fCanvas.wrapperEl.style.zIndex = 4

      const eleImage = document.getElementById(imageId)
      const scaleRatio = fCanvas.wrapperEl.clientHeight / eleImage.naturalHeight
      const fImage = new fabric.Image(eleImage, {
        left: 0,
        top: 0,
        width: eleImage.naturalWidth,
        height: eleImage.naturalHeight,
      })

      fImage.scale(scaleRatio)
      fCanvas.add(fImage)
      fCanvas.renderAll()

      fCanvas.on("path:created", function (options) {
        fImage.set({
          clipTo: function (ctx) {
            const retina = fCanvas.getRetinaScaling()
            ctx.save()
            ctx.setTransform(retina, 0, 0, retina, 0, 0)
            ctx.beginPath()
            options.path._renderPathCommands(ctx)
            options.path.render(ctx)
            ctx.restore()
          },
        })

        fCanvas.renderAll()

        fabric.Image.fromURL(fCanvas.toDataURL(), function (fNewImage) {
          const tmpImg = fNewImage.toDataURL({
            type: "image/jpeg",
            left: options.path.left,
            top: options.path.top,
            width: options.path.width + 2,
            height: options.path.height + 2,
          });

          dispatch({
            type: "PREDICT_BRUSH",
            image: tmpImg.substring(tmpImg.indexOf(";base64,") + 8),
            x: options.path.left / scaleRatio,
            y: options.path.top / scaleRatio,
            w: (options.path.width + 2) / scaleRatio,
            h: (options.path.height + 2) / scaleRatio,
          });

          dispatch({type: "SELECT_TOOL", selectedTool: "select"});
        })
      })

      return function () {
        fCanvas.dispose()
      }
    },
    [imageLoaded, allowFreeDrawing, imageId, dispatch]
  )

  useEffect(() => {
    if (!imageLoaded) return
    changeMat(
      getDefaultMat(
        zoomOnAllowedArea ? allowedArea : null,
        layoutParams.current
      )
    )

    // @TODO: Reenable
    dispatch({ type: "IMAGE_LOADED" })
    // eslint-disable-next-line
  }, [imageLoaded])

  useLayoutEffect(() => {
    if (!imageDimensions) return
    const { clientWidth, clientHeight } = canvas
    canvas.width = clientWidth
    canvas.height = clientHeight
    const context = canvas.getContext("2d")

    context.save()
    context.transform(...mat.clone().inverse().toArray())

    const { iw, ih } = layoutParams.current

    if (allowedArea) {
      // Pattern to indicate the NOT allowed areas
      const { x, y, w, h } = allowedArea
      context.save()
      context.globalAlpha = 1
      const outer = [
        [0, 0],
        [iw, 0],
        [iw, ih],
        [0, ih],
      ]
      const inner = [
        [x * iw, y * ih],
        [x * iw + w * iw, y * ih],
        [x * iw + w * iw, y * ih + h * ih],
        [x * iw, y * ih + h * ih],
      ]
      context.moveTo(...outer[0])
      outer.forEach((p) => context.lineTo(...p))
      context.lineTo(...outer[0])
      context.closePath()

      inner.reverse()
      context.moveTo(...inner[0])
      inner.forEach((p) => context.lineTo(...p))
      context.lineTo(...inner[0])

      context.fillStyle = excludePattern || "#f00"
      context.fill()

      context.restore()
    }

    context.restore()
  })

  let zoomBox =
    !zoomStart || !zoomEnd
      ? null
      : {
          ...mat.clone().inverse().applyToPoint(zoomStart.x, zoomStart.y),
          w: (zoomEnd.x - zoomStart.x) / mat.a,
          h: (zoomEnd.y - zoomStart.y) / mat.d,
        }
  if (zoomBox) {
    if (zoomBox.w < 0) {
      zoomBox.x += zoomBox.w
      zoomBox.w *= -1
    }
    if (zoomBox.h < 0) {
      zoomBox.y += zoomBox.h
      zoomBox.h *= -1
    }
  }

  // const highlightedRegion = useMemo(() => {
  //   const highlightedRegions = regions.filter((r) => !!r?.highlighted)
  //   if (highlightedRegions.length !== 1) return null
  //   return highlightedRegions[0]
  // }, [regions])
  //
  // const tasksHeight = useMemo(() => {
  //   return !isFullScreen && showTasks ? 252 : 0
  // }, [isFullScreen, showTasks, isExpand])

  useEffect(() => {
    changeDragging(keyDraggingEnabled)
  }, [changeDragging, keyDraggingEnabled])

  const visibleRegions = useMemo(() => regions.filter((r) => r.visible !== false), [regions]);
  const selectableRegions = useMemo(() => visibleRegions.filter((r) => r.locked !== true), [visibleRegions]);

  const getCursorType = () => {
    if (createWithPrimary) {
      return "crosshair"
    } else if (dragging) {
      return "grabbing"
    } else if (dragWithPrimary) {
      return "grab"
    } else if (zoomWithPrimary) {
      return mat.a < 1 ? "zoom-out" : "zoom-in"
    } else {
      return undefined
    }
  }

  // const isBrushRendered = useRef(false);

  useEffect(function () {
    if (!imageLoaded || !brushWithPrimary || !brushDrawingCanvasEl.current || brushDrawingCanvas) return

    const canvas = new fabric.Canvas(brushDrawingCanvasEl.current, {
      backgroundColor: "transparent",
      // width: brushDrawingCanvasEl.current.parentElement.clientWidth,
      // height: brushDrawingCanvasEl.current.parentElement.clientHeight,
      // preserveObjectStacking: true,
      selection: false,
      isDrawingMode: true,
      // freeDrawingCursor: "none",
      width: imageDimensions.naturalWidth,
      height: imageDimensions.naturalHeight,
      willReadFrequently: true,
      renderOnAddRemove: false,
      skipTargetFind: true,
    });

    canvas.freeDrawingBrush.width = brush_width;
    canvas.isDrawingMode = true;

    window.canvas = canvas;
    setBrushDrawingCanvas(canvas);
    console.log("New fabric");

    return function () {
      if (!brushDrawingCanvas) {
        return;
      }

      brushDrawingCanvas.dispose();
      setBrushDrawingCanvas(null);
    }
  },
  [imageLoaded, brushWithPrimary, brushDrawingCanvas, imageDimensions?.naturalWidth, imageDimensions?.naturalHeight]);

  useEffect(() => {
    if (!brushWithPrimary || !brushDrawingCanvas || !imageDimensions?.naturalWidth) {
      return;
    }

    if (!selectedRegion) {
      try {
        brushDrawingCanvas.clear();
        brushDrawingCanvas.requestRenderAll();
      } catch (e) {
      }

      return;
    }

    let abortController ;

    fabric.util.requestAnimFrame(() => {
      // isBrushRendered.current = true;
      console.log("Resize before render RLE to image");
      const oldWidth = brushDrawingCanvas.width;
      const oldHeight = brushDrawingCanvas.height;
      brushDrawingCanvas.clear();
      brushDrawingCanvas.setWidth(imageDimensions.naturalWidth);
      brushDrawingCanvas.setHeight(imageDimensions.naturalHeight);
      // brushDrawingCanvas.renderAll();

      console.log("Rendering RLE to image");
      console.log(selectedRegion.sparse_rle);
      abortController = new AbortController();
      drawRleDataOnCanvas(
        selectedRegion.sparse_rle,
        brushDrawingCanvas,
        parseColorRgba(selectedRegion.color,0.5),
        selectedRegion.width,
        abortController.signal,
      );
      // setRleToCanvas(selectedRegion.sparse_rle, brushDrawingCanvas, parseColorRgba(selectedRegion.color, 0.5), abortController.signal);

      if (abortController?.signal.aborted) {
        return;
      }

      abortController = null;

      console.log("Rendered RLE to image");
      console.log("Resize after render RLE to image");

      brushDrawingCanvas.setWidth(oldWidth);
      brushDrawingCanvas.setHeight(oldHeight);
      // brushDrawingCanvas.setZoom(1 / mat.a);
      // console.log("Render completed");
      brushDrawingCanvas.requestRenderAll();
    });

    return () => {
      abortController?.abort("Unmounted");
    };
  }, [selectedRegion?.id, brushWithPrimary, brushDrawingCanvas, imageDimensions?.naturalWidth, imageDimensions?.naturalHeight]);

  useEffect(() => {
    if (!brushWithPrimary || !brushDrawingCanvas || !imageLoaded) {
      return;
    }

    brushDrawingCanvas?.setZoom(1 / mat.a);
  }, [selectedRegion?.id, mat.a, brushDrawingCanvas]);

  useEffect(() => {
    console.log("Region changed", selectedRegion?.id);
  }, [selectedRegion?.id]);

  useEffect(() => {
    if (!brushWithPrimary || !brushDrawingCanvas || !imageLoaded) {
      return;
    }

    let abortController;

    function mouseDown() {
      if (selectedRegion) {
        return;
      }

      dispatch({
        type: "CREATE_BRUSH_REGION",
        rle: [],
        width: imageDimensions.naturalWidth,
        height: imageDimensions.naturalHeight,
      })
    }

    function mouseUp() {
      isBrushUpdated.current = true;
      brushDrawingCanvas.requestRenderAll();
    }

    function mouseMove(e) {
      dispatch({
        type: "MOUSE_MOVE",
        x: e.pointer.x / brushDrawingCanvas.width,
        y: e.pointer.y / brushDrawingCanvas.height,
      });
    }

    function updateData() {
      if (!isBrushUpdated.current) {
        return;
      }

      isBrushUpdated.current = false;

      if (abortController) {
        abortController.abort("Update new data");
      }

      abortController = new AbortController();

      brushDrawingCanvas.clone(canvas => {
        fabric.util.requestAnimFrame(() => {
          const rle = getRleFromCanvas(canvas, imageDimensions?.naturalWidth, imageDimensions?.naturalHeight, abortController.signal);

          if (abortController?.signal.aborted) {
            return;
          }

          abortController = null;
          console.log('Update RLE data', selectedRegion?.id);
          console.log(rle);

          if (selectedRegion) {
            dispatch({
              type: "UPDATE_BRUSH_REGION",
              rle,
              regionId: selectedRegion.id,
            })
          } else {
            dispatch({
              type: "CREATE_BRUSH_REGION",
              rle,
              width: imageDimensions.naturalWidth,
              height: imageDimensions.naturalHeight,
            })
          }
        });
      });
    }

    brushDrawingCanvas.on("mouse:down", mouseDown);
    brushDrawingCanvas.on("mouse:up", mouseUp);
    brushDrawingCanvas.on("mouse:move", mouseMove);
    brushDrawingCanvas.on("after:render", updateData);

    return () => {
      abortController?.abort("Unmounted");

      if (!brushDrawingCanvas) {
        return;
      }

      brushDrawingCanvas.off("mouse:down", mouseDown);
      brushDrawingCanvas.off("mouse:up", mouseUp);
      brushDrawingCanvas.off("mouse:move", mouseMove);
      brushDrawingCanvas.off("after:render", updateData);
    };
  }, [brushDrawingCanvas, brushWithPrimary, dispatch, imageDimensions?.naturalHeight, imageDimensions?.naturalWidth, imageLoaded, selectedRegion]);

  useEffect(() => {
    if (!brushWithPrimary || !brushDrawingCanvas) {
      return;
    }

    if (currentTool === "eraser") {
      brushDrawingCanvas.freeDrawingBrush = new fabric.EraserBrush(brushDrawingCanvas);
    } else {
      brushDrawingCanvas.freeDrawingBrush = new fabric.PencilBrush(brushDrawingCanvas);
      brushDrawingCanvas.freeDrawingBrush.color = "rgba(" + parseColorRgba(selectedClsColor, 0.5).join(",") + ")";
    }

    brushDrawingCanvas.freeDrawingBrush.width = brush_width;
  }, [brushDrawingCanvas, brushWithPrimary, currentTool, selectedClsColor]);

  useEffect(() => {
    if (!brushWithPrimary || !brushDrawingCanvas) {
      return;
    }

    brushDrawingCanvas.freeDrawingBrush.width = brush_width;
    brushDrawingCanvas.freeDrawingBrush.color = "rgba(" + parseColorRgba(selectedClsColor, 0.5).join(",") + ")";
  }, [brushDrawingCanvas, brushWithPrimary, selectedClsColor]);

  useEffect(() => {
    if (!brushWithPrimary || !brushDrawingCanvasEl.current || !brushDrawingCanvas || !imageDimensions?.naturalWidth) {
      return;
    }

    // brushDrawingCanvasEl.current.parentElement.style.width = viewportCanvasSize.width + "px";
    // brushDrawingCanvasEl.current.parentElement.style.height = viewportCanvasSize.height + "px";

    brushDrawingCanvas.setWidth(viewportCanvasSize.width);
    brushDrawingCanvas.setHeight(viewportCanvasSize.height);

    // brushDrawingCanvas.setDimensions({
    //   width: viewportCanvasSize.width,
    //   height: viewportCanvasSize.height,
    // });

    brushDrawingCanvas.setZoom(1 / mat.a);
    brushDrawingCanvas.freeDrawingBrush.width = brush_width;
    // brushDrawingCanvas.requestRenderAll();
  }, [brushDrawingCanvas, brushWithPrimary, imageDimensions?.naturalWidth, viewportCanvasSize.height, viewportCanvasSize.width, mat.a]);

  useEffect(() => {
    if (!brushWithPrimary || !brushDrawingCanvas || !brushDrawingCanvasEl.current) {
      return;
    }

    brushDrawingCanvasEl.current.parentElement.style.top = stylePosition.top + "px";
    brushDrawingCanvasEl.current.parentElement.style.left = stylePosition.left + "px";
    brushDrawingCanvasEl.current.parentElement.style.width = stylePosition.width + "px";
    brushDrawingCanvasEl.current.parentElement.style.height = stylePosition.height + "px";
  }, [brushDrawingCanvas, brushWithPrimary, stylePosition]);

  useEffect(() => {
    if (!brushDrawingCanvas) {
      return;
    }

    brushDrawingCanvasEl.current.parentElement.style.display = brushWithPrimary ? "" : "none";
  }, [brushWithPrimary, brushDrawingCanvas]);

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          // border: "solid 1px #dedede",
          // borderRadius: 16,
          marginLeft: 16,
          marginTop: 56,
          width: `calc(100% - 32px)`,
          height: `calc(100% - 72px)`,
          // maxHeight: `calc(100vh - ${tasksHeight}px - 32px + ${isExpand ? 80 : 0}px)`,
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#fff",
          // backgroundImage: "linear-gradient(45deg, #80808088 25%, transparent 25%), linear-gradient(-45deg, #80808088 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #80808088 75%), linear-gradient(-45deg, transparent 75%, #80808088 75%)",
          // backgroundSize: "20px 20px",
          // backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          userSelect: "none",
          cursor: getCursorType(),
        }}
      >
        {showCrosshairs && (
          <Crosshairs key="crossHairs" mousePosition={mousePosition} />
        )}
        {imageSrc &&
          videoTime === undefined &&
          !imageLoaded &&
          !isImageError && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              Loading Image...
            </div>
          )}
        {imageLoaded && !dragging && (
          <RegionSelectAndTransformBoxes
            key="regionSelectAndTransformBoxes"
            regions={
              !modifyingAllowedArea || !allowedArea
                ? selectableRegions
                : [
                    {
                      type: "box",
                      id: "$$allowed_area",
                      cls: "allowed_area",
                      highlighted: true,
                      x: allowedArea.x,
                      y: allowedArea.y,
                      w: allowedArea.w,
                      h: allowedArea.h,
                      visible: true,
                      color: "#ff0",
                    },
                  ]
            }
            mouseEvents={mouseEvents}
            projectRegionBox={projectRegionBox}
            dragWithPrimary={dragWithPrimary}
            createWithPrimary={createWithPrimary}
            zoomWithPrimary={zoomWithPrimary}
            onBeginMovePoint={onBeginMovePoint}
            onSelectRegion={onSelectRegion}
            layoutParams={layoutParams}
            mat={mat}
            onBeginBoxTransform={onBeginBoxTransform}
            onBeginMovePolygonPoint={onBeginMovePolygonPoint}
            onBeginMoveKeypoint={onBeginMoveKeypoint}
            onAddPolygonPoint={onAddPolygonPoint}
            showHighlightBox={showHighlightBox}
            imagePosition={imagePosition}
            currentTool={currentTool}
            onBeginMoveSkeletonPoint={onBeginMoveSkeletonPoint}
            mode={mode}
          />
        )}
        {/*{imageLoaded && showTags && !dragging && !allowFreeDrawing && (
          <PreventScrollToParents key="regionTags">
            <RegionTags
              regions={regions}
              projectRegionBox={projectRegionBox}
              mouseEvents={mouseEvents}
              regionClsList={regionClsList}
              regionTagList={regionTagList}
              onBeginRegionEdit={onBeginRegionEdit}
              onChangeRegion={onChangeRegion}
              onCloseRegionEdit={onCloseRegionEdit}
              onDeleteRegion={onDeleteRegion}
              layoutParams={layoutParams}
              imageSrc={imageSrc}
              RegionEditLabel={RegionEditLabel}
              onRegionClassAdded={onRegionClassAdded}
              allowComments={allowComments}
            />
          </PreventScrollToParents>
        )}*/}
        {/*{!showTags && highlightedRegion && (
          <div key="topLeftTag" className={classes.fixedRegionLabel}>
            <RegionLabel
              disableClose
              allowedClasses={regionClsList}
              allowedTags={regionTagList}
              onChange={onChangeRegion}
              onDelete={onDeleteRegion}
              editing
              region={highlightedRegion}
              imageSrc={imageSrc}
              allowComments={allowComments}
            />
          </div>
        )}*/}

        {zoomWithPrimary && zoomBox !== null && (
          <div
            key="zoomBox"
            style={{
              position: "absolute",
              zIndex: 1,
              border: "1px solid #fff",
              pointerEvents: "none",
              left: zoomBox.x,
              top: zoomBox.y,
              width: zoomBox.w,
              height: zoomBox.h,
            }}
          />
        )}
        {showPointDistances && (
          <PointDistances
            key="pointDistances"
            regions={regions}
            realSize={realSize}
            projectRegionBox={projectRegionBox}
            pointDistancePrecision={pointDistancePrecision}
          />
        )}
        <RegionShapes
          mat={mat}
          keypointDefinitions={keypointDefinitions}
          imagePosition={imagePosition}
          regions={visibleRegions}
          fullSegmentationMode={fullImageSegmentationMode}
          pointRef={pointRef}
          showTags={showTags}
          onUnSelectRegion={() => dispatch({
            type: "UNSELECT_REGION",
          })}
          projectRegionBox={projectRegionBox}
          onSelectRegion={onSelectRegion}
          showLabels={!mode}
        />
        <PreventScrollToParents
          style={{ width: "100%", height: "100%" }}
          {...mouseEvents}
        >
          <>
            {/*{fullImageSegmentationMode && (
              <ImageMask
                hide={!showMask}
                autoSegmentationOptions={autoSegmentationOptions}
                imagePosition={imagePosition}
                regionClsList={regionClsList}
                imageSrc={imageSrc}
                regions={regions}
              />
            )}*/}
            <canvas
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: allowFreeDrawing ? "100%" : 0,
                height: allowFreeDrawing ? "100%" : 0,
                opacity: allowFreeDrawing && !isImageError ? 1 : 0,
                zIndex: isImageError ? -1 : 4,
              }}
              ref={fCanvasEl}
            />
            <canvas
              style={{
                position: "absolute",
                width: brushWithPrimary ? "100%" : 0,
                height: brushWithPrimary ? "100%" : 0,
                opacity: brushWithPrimary && !isImageError ? 1 : 0,
                zIndex: isImageError ? -1 : 3,
              }}
              id="brush-drawing-canvas"
              ref={brushDrawingCanvasEl}
            />
            {/*<canvas
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: brushWithPrimary ? "100%" : 0,
                height: brushWithPrimary ? "100%" : 0,
                opacity: brushWithPrimary && !isImageError ? 1 : 0,
                zIndex: isImageError ? -1 : 4,
              }}
              id="cursor-canvas"
              ref={cursorCanvasEl}
            />*/}
            <canvas
              style={{
                opacity: isImageError ? 0 : 0.25,
                zIndex: isImageError ? -1 : 3,
              }}
              className={classes.canvas}
              ref={canvasEl}
            />
            <VideoOrImageCanvasBackground
              videoPlaying={videoPlaying}
              imagePosition={imagePosition}
              mouseEvents={mouseEvents}
              onLoad={onVideoOrImageLoaded}
              videoTime={videoTime}
              videoSrc={videoSrc}
              imageSrc={imageSrc}
              useCrossOrigin={fullImageSegmentationMode}
              onChangeVideoTime={onChangeVideoTime}
              onChangeVideoPlaying={onChangeVideoPlaying}
              imageId={imageId}
              onError={() => onImageError?.()}
            />
          </>
        </PreventScrollToParents>
        {!isImageError && (
          <div className={classes.zoomIndicator}>
            {((1 / mat.a) * 100).toFixed(0)}%
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}

export default ImageCanvas
