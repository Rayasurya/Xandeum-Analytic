// @flow

import {calculationPolylineHighlightBox} from "../utils/calculationPolylineHighlightBox";

export type BaseRegion = {
  id: string | number,
  cls?: string,
  locked?: boolean,
  visible?: boolean,
  color: string,
  editingLabels?: boolean,
  highlighted?: boolean,
  tags?: Array<string>,
}

export type Point = {|
  ...$Exact<BaseRegion>,
  type: "point",
  x: number,
  y: number,
|}

export type PixelRegion =
  | {|
      ...$Exact<BaseRegion>,
      type: "pixel",
      sx: number,
      sy: number,
      w: number,
      h: number,
      src: string,
    |}
  | {|
      ...$Exact<BaseRegion>,
      type: "pixel",
      points: Array<[number, number]>,
    |}
export type Box = {|
  ...$Exact<BaseRegion>,
  type: "box",
  x: number,
  y: number,
  w: number,
  h: number,
|}

export type Polygon = {|
  ...$Exact<BaseRegion>,
  type: "polygon",
  open?: boolean,
  points: Array<[number, number]>,
|}

export type Line = {|
  ...$Exact<BaseRegion>,
  type: "line",
  x1: number,
  y1: number,
  x2: number,
  y2: number,
|}

export type ExpandingLine = {|
  ...$Exact<BaseRegion>,
  type: "expanding-line",
  points: Array<{ x: number, y: number, angle: number, width: number }>,
|}

export type KeypointDefinition = {|
  label: string,
  color: string,
  defaultPosition: [number, number],
|}

export type KeypointId = string

export type KeypointsDefinition = {|
  [id: string]: {
    connections: Array<[KeypointId, KeypointId]>,
    landmarks: {
      [KeypointId]: KeypointDefinition,
    },
  },
|}

export type Keypoints = {|
  ...$Exact<BaseRegion>,
  type: "keypoints",
  keypointsDefinitionId: string,
  points: {
    [string]: { x: number, y: number },
  },
|}

export type RegionGroup = {
  cls: string,
  color: string,
  locked: boolean,
  visible: boolean,
  child: Array<Region>,
}

export type Skeleton = {|
  ...$Exact<BaseRegion>,
  type: "skeleton",
  x: number,
  y: number,
  w: number,
  h: number,
  points: {
    x: number,
    y: number,
    name: string,
    to: string[],
  }[],
  position: "relative" | "absolute",
|}

export type Cuboid = {|
  ...Skeleton,
  type: "cuboid",
|}

export type Region =
  | Point
  | PixelRegion
  | Box
  | Polygon
  | ExpandingLine
  | Keypoints
  | Skeleton
  | Cuboid

export const getEnclosingBox = (region: Region) => {
  switch (region?.type) {
    case "polygon": {
      const box = {
        x: Math.min(...region.points.map(([x, y]) => x)),
        y: Math.min(...region.points.map(([x, y]) => y)),
        w: 0,
        h: 0,
      }
      box.w = Math.max(...region.points.map(([x, y]) => x)) - box.x
      box.h = Math.max(...region.points.map(([x, y]) => y)) - box.y
      return box
    }
    case "keypoints": {
      const minX = Math.min(
        ...Object.values(region.points).map(({ x, y }) => x)
      )
      const minY = Math.min(
        ...Object.values(region.points).map(({ x, y }) => y)
      )
      const maxX = Math.max(
        ...Object.values(region.points).map(({ x, y }) => x)
      )
      const maxY = Math.max(
        ...Object.values(region.points).map(({ x, y }) => y)
      )
      return {
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY,
      }
    }
    case "expanding-line": {
      const box = {
        x: Math.min(...region.points.map(({ x, y }) => x)),
        y: Math.min(...region.points.map(({ x, y }) => y)),
        w: 0,
        h: 0,
      }
      box.w = Math.max(...region.points.map(({ x, y }) => x)) - box.x
      box.h = Math.max(...region.points.map(({ x, y }) => y)) - box.y
      return box
    }
    case "line": {
      return { x: region.x1, y: region.y1, w: 0, h: 0 }
    }
    case "oval":
    case "box": {
      return { x: region.x, y: region.y, w: region.w, h: region.h }
    }
    case "point": {
      return { x: region.x, y: region.y, w: 0, h: 0 }
    }
    case "cuboid":
    case "skeleton": {
      const points = region.points ?? [];
      const xList = points.map(p => p.x);
      const yList = points.map(p => p.y);
      const x = Math.min(...xList);
      const y = Math.min(...yList);

      if (region.position === "absolute") {
        return {
          x,
          y,
          w: Math.max(...xList) - x,
          h: Math.max(...yList) - y,
        }
      } else {
        return {
          x: region.x + (x * region.w),
          y: region.y + (y * region.h),
          w: (Math.max(...xList) - x) * region.w,
          h: (Math.max(...yList) - y) * region.h,
        }
      }
    }
    case "polyline": {
      const {x1, y1, w, h} = calculationPolylineHighlightBox(region.points ?? []);
      return { x: x1, y: y1, w, h }
    }
    default: {
      return { x: 0, y: 0, w: 0, h: 0 }
    }
  }
  throw new Error("unknown region")
}

export const moveRegion = (region: Region, x: number, y: number) => {
  switch (region.type) {
    case "point": {
      return { ...region, x, y }
    }
    case "cuboid":
    case "skeleton":
    case "oval":
    case "box": {
      return { ...region, x: x - region.w / 2, y: y - region.h / 2 }
    }
    case "polygon": {
      const box = getEnclosingBox(region)
      const dX = x - box.w / 2 - box.x
      const dY = y - box.h / 2 - box.y
      return {
        ...region,
        points: region.points.map((p) => [p[0] + dX, p[1] + dY]),
      }
    }
  }
  return region
}
