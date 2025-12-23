// @flow

import React from "react"
import classnames from "classnames"
import { makeStyles } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import {calculationBrushHighlightBox } from "../utils/calculationBrushHighlightBox";
// import {calculationPolylineHighlightBox} from "../utils/calculationPolylineHighlightBox"


import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const useStyles = makeStyles((theme) => ({
  "@keyframes borderDance": {
    from: { strokeDashoffset: 0 },
    to: { strokeDashoffset: 100 },
  },
  highlightBox: {
    zIndex: 4,
    transition: "opacity 500ms",
    "&.highlighted": {
      zIndex: 5,
    },
    "&:not(.highlighted)": {
      opacity: 0,
    },
    "&:not(.highlighted):hover": {
      opacity: 0.6,
    },
    "& path": {
      vectorEffect: "non-scaling-stroke",
      strokeWidth: 2,
      stroke: "#FFF",
      fill: "none",
      strokeDasharray: 5,
      animationName: "$borderDance",
      animationDuration: "4s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
      animationPlayState: "running",
    },
  },
}))

export const HighlightBox = ({
  mouseEvents,
  dragWithPrimary,
  zoomWithPrimary,
  createWithPrimary,
  onBeginMovePoint,
  onSelectRegion,
  region: r,
  pbox,
  iw,
  ih,
  imagePosition,
}: {
  mouseEvents: any,
  dragWithPrimary: boolean,
  zoomWithPrimary: boolean,
  createWithPrimary: boolean,
  onBeginMovePoint: Function,
  onSelectRegion: Function,
  region: any,
  pbox: { x: number, y: number, w: number, h: number },
  // zoomBox: { x: number, y: number, w: number, h: number },
  iw: number,
  ih: number,
  imagePosition: {topLeft: { x: number, y: number }, bottomRight: { x: number, y: number }},
}) => {

  const classes = useStyles()
  if (!pbox.w || pbox.w === Infinity) return null
  if (!pbox.h || pbox.h === Infinity) return null
  if (r.unfinished) return null

  const calculationStyleCoords = () => {
    switch(r.type){
      case "point":
        return {
        left: pbox.x + pbox.w / 2 - 15,
        top: pbox.y + pbox.h / 2 - 15,
        width: 30,
        height: 30,
        }
      case "polygon":
        return {
          left: pbox.x,
          top: pbox.y,
          width: pbox.w,
          height: pbox.h,
        }
      // case "brush":{
      //   const { x1, y1, w, h } = calculationBrushHighlightBox(r.sparse_rle, r.width)
      //   return {
      //     left: x1 + 5,
      //     top: y1 + 5,
      //     width: w+10,
      //     height: h+10,
      //   }
      // }
      // case "polyline":{
      //   const { x1, x2, y1, y2, w, h  } = calculationPolylineHighlightBox(r.points ?? []);
      //
      //   return {
      //     left: x1+10,
      //     top: y1+10,
      //     width: w,
      //     height: h,
      //   }
      // }
      default:
        return {
          left: pbox.x - 5,
          top: pbox.y - 5,
          width: pbox.w + 10,
          height: pbox.h + 10,
        }
    }


  }
  const styleCoords = calculationStyleCoords();

  const calculationPathD = () =>{

    switch(r.type){
      case "point":
        return `M5,5 L${styleCoords.width - 5} 5L${styleCoords.width - 5} ${
          styleCoords.height - 5
        }L5 ${styleCoords.height - 5}Z`
      case "polygon":
        return `M${r.points.map(p => ((p[0] * iw) - pbox.x + imagePosition.topLeft.x) + "," + ((p[1] * ih) - pbox.y + imagePosition.topLeft.y)).join(" L")} Z`
      // case "brush":{
      //   const { x1, x2, y1, y2, w, h } = calculationBrushHighlightBox(r.sparse_rle, r.width)
      //   return `M5,5 L${w+5},5 L${w+5},${h+5} L5,${h+5} Z`
      // }
      // case "polyline":{
      //   // const { x1, x2, y1, y2, w, h  } = calculationPolylineHighlightBox(r.points.map(p => [p[0] * iw, p[1] * ih]));
      //   return ""
      // }
      default:
        return `M5,5 L${pbox.w + 5},5 L${pbox.w + 5},${pbox.h + 5} L5,${pbox.h + 5} Z`
    }
  }



const pathD = calculationPathD();

  return (
    <ThemeProvider theme={theme}>
      <svg
        key={r.id}
        className={classnames(classes.highlightBox, {
          highlighted: r.highlighted,
        })}
        {...mouseEvents}
        {...(!zoomWithPrimary && !dragWithPrimary
          ? {
              onMouseDown: (e) => {
                if (
                  !r.locked &&
                  r.type === "point" &&
                  r.highlighted &&
                  e.button === 0
                ) {
                  return onBeginMovePoint(r)
                }
                if (e.button === 0 && !createWithPrimary)
                  return onSelectRegion(r)
                mouseEvents.onMouseDown(e)
              },
            }
          : {})}
        style={{
          ...(r.highlighted
            ? {
                pointerEvents: r.type !== "point" && r.type !== "polyline" ? "none" : undefined,
                cursor: "grab",
              }
            : {
                cursor: !(
                  zoomWithPrimary ||
                  dragWithPrimary ||
                  createWithPrimary
                )
                  ? "pointer"
                  : undefined,
                pointerEvents:
                  zoomWithPrimary ||
                  dragWithPrimary ||
                  (createWithPrimary && !r.highlighted)
                    ? "none"
                    : undefined,
              }),
          position: "absolute",
          ...styleCoords,
        }}
      >
        <path d={pathD} />
      </svg>
    </ThemeProvider>
  )
}

export default HighlightBox
