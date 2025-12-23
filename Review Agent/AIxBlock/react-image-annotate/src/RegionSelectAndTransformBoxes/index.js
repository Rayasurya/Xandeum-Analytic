import React, { Fragment, memo, useEffect, useMemo } from "react"
import HighlightBox from "../HighlightBox"
import { styled } from "@mui/material/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import PreventScrollToParents from "../PreventScrollToParents"
import Tooltip from "@mui/material/Tooltip"
import {normalizePolylinePoints} from "../utils/calculationPolylineHighlightBox";

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const grabberSize = 14
const grabberHalfSize = grabberSize / 2
const TransformGrabber = styled("div")(({ theme }) => ({
  width: grabberSize,
  height: grabberSize,
  zIndex: 5,
  border: "2px solid #FFF",
  position: "absolute",
  backgroundColor: "#000",
  opacity: .5,
  "&:hover": {
    opacity: 1,
  },
}))

const CurvaturePoint = styled("div")(({ theme }) => ({
  width: grabberSize,
  height: grabberSize,
  zIndex: 5,
  border: "2px solid #FFF",
  position: "absolute",
  backgroundColor: "#000",
  cursor: "normal",
  borderRadius: "50%",
  opacity: .5,
  "&:hover": {
    opacity: 1,
  },
}))



const boxCursorMap = [
  ["nw-resize", "n-resize", "ne-resize"],
  ["w-resize", "grab", "e-resize"],
  ["sw-resize", "s-resize", "se-resize"],
]

const arePropsEqual = (prev, next) => {
  return (
    prev.region === next.region &&
    prev.dragWithPrimary === next.dragWithPrimary &&
    prev.createWithPrimary === next.createWithPrimary &&
    prev.zoomWithPrimary === next.zoomWithPrimary &&
    prev.mat === next.mat
  )
}

export const RegionSelectAndTransformBox = memo(
  ({
    region: r,
    mouseEvents,
    projectRegionBox,
    dragWithPrimary,
    createWithPrimary,
    zoomWithPrimary,
    onBeginMovePoint,
    onSelectRegion,
    layoutParams,
    // fullImageSegmentationMode = false,
    mat,
    onBeginBoxTransform,
    onBeginMovePolygonPoint,
    onBeginMoveKeypoint,
    onAddPolygonPoint,
    showHighlightBox,
    imagePosition,
    // currentTool,
    onBeginMoveSkeletonPoint,
    mode,
  }) => {
    const proj = mat.clone().inverse();
    const pbox = projectRegionBox(r)
    const { iw, ih } = layoutParams.current;

    const highlightBox = useMemo(() => {
      if (!showHighlightBox) {
        return null;
      }

      return (
        <HighlightBox
          key={"highlight-box-" + r.id}
          region={r}
          mouseEvents={mouseEvents}
          dragWithPrimary={dragWithPrimary}
          createWithPrimary={createWithPrimary}
          zoomWithPrimary={zoomWithPrimary}
          onBeginMovePoint={onBeginMovePoint}
          onSelectRegion={onSelectRegion}
          pbox={pbox}
          iw={iw / mat.a}
          ih={ih / mat.d}
          imagePosition={imagePosition}
        />
      );
    }, [
      createWithPrimary, dragWithPrimary, ih, imagePosition, iw, mat.a, mat.d,
      mouseEvents, onBeginMovePoint, onSelectRegion, pbox, r, showHighlightBox,
      zoomWithPrimary,
    ]);

    const transformable = useMemo(() => {
      return !dragWithPrimary && !zoomWithPrimary && !r.locked && (r.highlighted || (mode?.mode === "DRAW_POLYLINE" && r.points?.length > 1));
    }, [dragWithPrimary, zoomWithPrimary, r.locked, r.highlighted, r.points?.length, mode?.mode]);

    const renderPolylinePoints = useMemo(() => {
      if (r.type !== "polyline" || !transformable) {
        return null;
      }

      const points = normalizePolylinePoints(r.points ?? []);

      return points.map(([px, py], i) => {
        const Wrap = i % 2 === 0 ? TransformGrabber : CurvaturePoint;
        const pp = proj.applyToPoint(px * iw, py * ih);
        return (
          <Wrap
            key={i}
            {...mouseEvents}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              onBeginMoveKeypoint(r, i);
            }}
            style={{
              cursor: "move",
              zIndex: 10,
              left: pp.x - grabberHalfSize,
              top: pp.y - grabberHalfSize,
            }}
          />
        );
      })
    }, [ih, iw, mouseEvents, onBeginMoveKeypoint, proj, r, transformable]);

    const canTransformSkeleton = useMemo(() => {
      return (r.type === "skeleton" || r.type === "cuboid") && r.position === "absolute" && transformable && mat.a < 1.2;
    }, [r.type, r.position, mat.a, transformable]);

    // const skeletonDirections = useMemo(() => {
    //   return [
    //     // [0, 0], [0.5, 0], [1, 0],
    //     // [0, 0.5], [1, 0.5],
    //     // [0, 1], [0.5, 1], [1, 1],
    //   ];
    // }, []);

    const skeletonMovePoints = useMemo(() => {
      if (!r.type === "skeleton" && !r.type === "cuboid") {
        return [];
      }

      return (r.points ?? []).map(p => {
        const pp = proj.applyToPoint(p.x * iw, p.y * ih);
        return {x: pp.x, y: pp.y};
      });
    }, [ih, iw, proj, r.points, r.type]);

    const canTransformBoxOvalPolygon = useMemo(() => {
      return (r.type === "box" || r.type === "oval" || (r.type === "polygon" && !r.open)) && transformable && mat.a < 1.2
    }, [r.type, r.open, mat.a, transformable]);

    return (
      <ThemeProvider theme={theme}>
        <Fragment>
          <PreventScrollToParents>
            {/*&& (r.type !== "polygon" || (r.type === "polygon" && r?.closed))*/ highlightBox}
            {canTransformSkeleton && skeletonMovePoints.map((p, i) => (
              <TransformGrabber
                key={i}
                {...mouseEvents}
                onMouseDown={(e) => {
                  if (e.button === 0)
                    return onBeginMoveSkeletonPoint(r.id, i)
                  mouseEvents.onMouseDown(e)
                }}
                style={{
                  left: p.x - grabberHalfSize,
                  top: p.y - grabberHalfSize,
                  cursor: "move",
                  borderRadius: grabberHalfSize,
                }}
              />
            ))}
            {canTransformBoxOvalPolygon &&
              (r.type === "polygon"
                ? [[0.5, 0.5]]
                : [
                  [0, 0],
                  [0.5, 0],
                  [1, 0],
                  [1, 0.5],
                  [1, 1],
                  [0.5, 1],
                  [0, 1],
                  [0, 0.5],
                  [0.5, 0.5],
                ]
              ).map(([px, py], i) => (
                <TransformGrabber
                  key={i}
                  {...mouseEvents}
                  onMouseDown={(e) => {
                    if (e.button === 0)
                      return onBeginBoxTransform(r, [px * 2 - 1, py * 2 - 1])
                    mouseEvents.onMouseDown(e)
                  }}
                  style={{
                    left: pbox.x - grabberHalfSize - 2 + pbox.w * px,
                    top: pbox.y - grabberHalfSize - 2 + pbox.h * py,
                    cursor: boxCursorMap[py * 2][px * 2],
                    borderRadius: px === 0.5 && py === 0.5 ? grabberHalfSize : undefined,
                  }}
                />
              ))}
            {r.type === "polygon" && transformable &&
              r.points.map(([px, py], i) => {
                const proj = mat
                  .clone()
                  .inverse()
                  .applyToPoint(px * iw, py * ih)
                return (
                  <TransformGrabber
                    key={i}
                    {...mouseEvents}
                    onMouseDown={(e) => {
                      if (e.button === 0 && (!r.open || i === 0))
                        return onBeginMovePolygonPoint(r, i)
                      mouseEvents.onMouseDown(e)
                    }}
                    style={{
                      cursor: !r.open
                        ? "move"
                        : i === 0
                        ? "pointer"
                        : undefined,
                      zIndex: 10,
                      pointerEvents:
                        r.open && i === r.points.length - 1
                          ? "none"
                          : undefined,
                      left: proj.x - grabberHalfSize,
                      top: proj.y - grabberHalfSize,
                    }}
                  />
                )
              })}
            {r.type === "polygon" &&
              transformable &&
              !r.open &&
              r.points.length > 1 &&
              r.points
                .map((p1, i) => [p1, r.points[(i + 1) % r.points.length]])
                .map(([p1, p2]) => [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2])
                .map((pa, i) => {
                  const proj = mat
                    .clone()
                    .inverse()
                    .applyToPoint(pa[0] * iw, pa[1] * ih)
                  return (
                    <TransformGrabber
                      key={i}
                      {...mouseEvents}
                      onMouseDown={(e) => {
                        if (e.button === 0)
                          return onAddPolygonPoint(r, pa, i + 1)
                        mouseEvents.onMouseDown(e)
                      }}
                      style={{
                        cursor: "copy",
                        zIndex: 10,
                        left: proj.x - grabberHalfSize,
                        top: proj.y - grabberHalfSize,
                        border: "2px dotted #fff",
                        opacity: 0.5,
                      }}
                    />
                  )
                })}
            {r.type === "keypoints" && transformable && Object.entries(r.points).map(
                ([keypointId, { x: px, y: py }], i) => {
                  const proj = mat
                    .clone()
                    .inverse()
                    .applyToPoint(px * iw, py * ih)
                  return (
                    <Tooltip title={keypointId} key={i}>
                      <TransformGrabber
                        key={i}
                        {...mouseEvents}
                        onMouseDown={(e) => {
                          if (e.button === 0 && (!r.open || i === 0))
                            return onBeginMoveKeypoint(r, keypointId)
                          mouseEvents.onMouseDown(e)
                        }}
                        style={{
                          cursor: !r.open
                            ? "move"
                            : i === 0
                            ? "pointer"
                            : undefined,
                          zIndex: 10,
                          pointerEvents:
                            r.open && i === r.points.length - 1
                              ? "none"
                              : undefined,
                          left: proj.x - grabberHalfSize,
                          top: proj.y - grabberHalfSize,
                        }}
                      />
                    </Tooltip>
                  )
                }
              )}
              {renderPolylinePoints}
          </PreventScrollToParents>
        </Fragment>
      </ThemeProvider>
    )
  },
  arePropsEqual
)

export default function RegionSelectAndTransformBoxes({regions, ...props}) {
  return regions.map((r, i) => {
    return <RegionSelectAndTransformBox key={r?.id ?? "region-" + i} {...props} region={r} />
  })
}
