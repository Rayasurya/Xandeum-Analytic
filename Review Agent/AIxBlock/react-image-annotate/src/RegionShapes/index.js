// @flow

import {contrastColor} from "contrast-color";
import React, {memo, /*useEffect,*/ useMemo} from "react"
import colorAlpha from "color-alpha"

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num
}

const RegionComponents = {
  point: memo(({ region, iw, ih }) => (
    <g transform={`translate(${region.x * iw} ${region.y * ih})`}>
      <path
        d={"M0 8L8 0L0 -8L-8 0Z"}
        strokeWidth={2}
        stroke={region.color}
        fill="transparent"
      />
    </g>
  )),
  line: memo(({ region, iw, ih }) => (
    <g transform={`translate(${region.x1 * iw} ${region.y1 * ih})`}>
      <line
        strokeWidth={2}
        x1={0}
        y1={0}
        x2={(region.x2 - region.x1) * iw}
        y2={(region.y2 - region.y1) * ih}
        stroke={colorAlpha(region.color, 0.75)}
        fill={colorAlpha(region.color, 0.25)}
      />
    </g>
  )),
  box: memo(({ region, iw, ih }) => (
    <g transform={`translate(${region.x * iw} ${region.y * ih})`}>
      <rect
        strokeWidth={2}
        x={0}
        y={0}
        width={Math.max(region.w * iw, 0)}
        height={Math.max(region.h * ih, 0)}
        stroke={colorAlpha(region.color, 0.75)}
        fill={colorAlpha(region.color, 0.25)}
      />
    </g>
  )),
  oval: memo(({ region, iw, ih }) => (
    <g transform={`translate(${region.x * iw} ${region.y * ih})`}>
      <ellipse
        strokeWidth={2}
        cx={Math.max(region.w * iw, 0) / 2}
        cy={Math.max(region.h * ih, 0) / 2}
        rx={Math.max(region.w * iw, 0) / 2}
        ry={Math.max(region.h * ih, 0) / 2}
        stroke={colorAlpha(region.color, 0.75)}
        fill={colorAlpha(region.color, 0.25)}
      />
    </g>
  )),
  polygon: memo(({ region, iw, ih, fullSegmentationMode }) => {
    const Component = region.open ? "polyline" : "polygon"
    // const alphaBase = fullSegmentationMode ? 0.5 : 1
    return (
      <Component
        points={region.points
          .map(([x, y]) => [x * iw, y * ih])
          .map((a) => a.join(" "))
          .join(" ")}
        strokeWidth={2}
        stroke={colorAlpha(region.color, 0.75)}
        fill={colorAlpha(region.color, 0.25)}
      />
    )
  }),
  keypoints: ({ region, iw, ih, keypointDefinitions }) => {
    const { points, keypointsDefinitionId } = region
    if (!keypointDefinitions[keypointsDefinitionId]) {
      throw new Error(
        `No definition for keypoint configuration "${keypointsDefinitionId}"`
      )
    }
    const { landmarks, connections } =
      keypointDefinitions[keypointsDefinitionId]
    return (
      <g>
        {Object.entries(points).map(([keypointId, { x, y }], i) => (
          <g key={i} transform={`translate(${x * iw} ${y * ih})`}>
            <path
              d={"M0 8L8 0L0 -8L-8 0Z"}
              strokeWidth={2}
              stroke={landmarks[keypointId].color}
              fill="transparent"
            />
          </g>
        ))}
        {connections.map(([kp1Id, kp2Id]) => {
          const kp1 = points[kp1Id]
          const kp2 = points[kp2Id]
          const midPoint = { x: (kp1.x + kp2.x) / 2, y: (kp1.y + kp2.y) / 2 }

          return (
            <g key={`${kp1.x},${kp1.y}.${kp2.x},${kp2.y}`}>
              <line
                x1={kp1.x * iw}
                y1={kp1.y * ih}
                x2={midPoint.x * iw}
                y2={midPoint.y * ih}
                strokeWidth={2}
                stroke={landmarks[kp1Id].color}
              />
              <line
                x1={kp2.x * iw}
                y1={kp2.y * ih}
                x2={midPoint.x * iw}
                y2={midPoint.y * ih}
                strokeWidth={2}
                stroke={landmarks[kp2Id].color}
              />
            </g>
          )
        })}
      </g>
    )
  },
  "expanding-line": memo(({ region, iw, ih }) => {
    let { expandingWidth = 0.005, points } = region
    expandingWidth = points.slice(-1)[0].width || expandingWidth
    const pointPairs = points.map(({ x, y, angle, width }, i) => {
      if (!angle) {
        const n = points[clamp(i + 1, 0, points.length - 1)]
        const p = points[clamp(i - 1, 0, points.length - 1)]
        angle = Math.atan2(p.x - n.x, p.y - n.y) + Math.PI / 2
      }
      const dx = (Math.sin(angle) * (width || expandingWidth)) / 2
      const dy = (Math.cos(angle) * (width || expandingWidth)) / 2
      return [
        { x: x + dx, y: y + dy },
        { x: x - dx, y: y - dy },
      ]
    })
    const firstSection = pointPairs.map(([p1, p2]) => p1)
    const secondSection = pointPairs.map(([p1, p2]) => p2).asMutable()
    secondSection.reverse()
    const lastPoint = points.slice(-1)[0]
    return (
      <>
        <polygon
          points={firstSection
            .concat(region.candidatePoint ? [region.candidatePoint] : [])
            .concat(secondSection)
            .map((p) => `${p.x * iw} ${p.y * ih}`)
            .join(" ")}
          strokeWidth={2}
          stroke={colorAlpha(region.color, 0.75)}
          fill={colorAlpha(region.color, 0.25)}
        />
        {points.map(({ x, y, angle }, i) => (
          <g
            key={i}
            transform={`translate(${x * iw} ${y * ih}) rotate(${
              (-(angle || 0) * 180) / Math.PI
            })`}
          >
            <g>
              <rect
                x={-5}
                y={-5}
                width={10}
                height={10}
                strokeWidth={2}
                stroke={colorAlpha(region.color, 0.75)}
                fill={colorAlpha(region.color, 0.25)}
              />
            </g>
          </g>
        ))}
        <rect
          x={lastPoint.x * iw - 8}
          y={lastPoint.y * ih - 8}
          width={16}
          height={16}
          strokeWidth={4}
          stroke={colorAlpha(region.color, 0.5)}
          fill={"transparent"}
        />
      </>
    )
  }),
  brush: ({region}) => {
    return <g></g>;
    const { width, /*height,*/ color } = region;
    const rleData = region.sparse_rle;
    let svgElements = [];

    for (let i = 0; i < rleData.length; i += 2) {
      let startIndex = rleData[i];
      let runLength = rleData[i + 1];
      let y = Math.floor(startIndex / width);
      let x1 = startIndex % width;
      if(runLength < width - x1) {
        let x2 = x1 + runLength;
        svgElements.push(
          <line
            key={i}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={color}
            strokeWidth="1"
          />
        );
      }else{
        const lines = (runLength - (width - x1)) / width;
        let remainRunLength = runLength - (width - x1);
        for(let j = 0; j < lines; j++) {
          const x2 = remainRunLength % width;
          remainRunLength -= x2;
          svgElements.push(
            <line
              key={i + j+"addition-line"}
              x1={0}
              y1={y + j + 1}
              x2={x2}
              y2={y + j + 1}
              stroke={color}
              strokeWidth="1"
            />
          );
        }
      }
      }
    return <g>{svgElements}</g>;
  },
  polyline: memo(({ region, iw, ih }) => {
    const points = region?.expandingPoint ? [...region.points, region.expandingPoint] : region.points;
    const pointsMap = points.map(([x, y]) => [x * iw, y * ih])
    let d = `M${pointsMap[0].join(",")}`;

    if (pointsMap.length === 2) {
      d += ` L${pointsMap[1].join(",")}`;
    } else {
      for (let i = 1; i < pointsMap.length - 1; i += 2) {
        d += ` Q${pointsMap[i].join(",")} ${pointsMap[i + 1].join(",")}`;
      }
      if (pointsMap.length % 2 === 0) {
        d += ` L${pointsMap[pointsMap.length - 1].join(",")}`;
      }
    }
    return (
      <g>
        <path
        d={d}
        strokeWidth={2}
        stroke={region.color}
        fill="transparent"
      />
      </g>
    )
  }),
  pixel: () => null,
  skeleton: memo(({ region, iw, ih }) => {
    const lines = [];
    const isRelativePoints = region.position === "relative";

    region.points.forEach((p, idx) => {
      if (typeof p.to !== "object" || p.to.length === 0) {
        return;
      }

      p.to.forEach(targetName => {
        const target = region.points.find(findingPoint => findingPoint.name === targetName);

        if (!target) {
          return;
        }

        if (isRelativePoints) {
          lines.push(
            <line
              key={"r-" + region.id + "-line-" + idx + "-" + targetName}
              stroke={colorAlpha(region.color, 0.75)}
              strokeWidth={4}
              x1={Math.max(region.w * iw * p.x, 0)}
              y1={Math.max(region.h * ih * p.y, 0)}
              x2={Math.max(region.w * iw * target.x, 0)}
              y2={Math.max(region.h * ih * target.y, 0)}
            />
          );
        } else {
          lines.push(
            <line
              key={"r-" + region.id + "-line-" + idx + "-" + targetName}
              stroke={colorAlpha(region.color, 0.75)}
              strokeWidth={4}
              x1={Math.max(iw * p.x, 0)}
              y1={Math.max(ih * p.y, 0)}
              x2={Math.max(iw * target.x, 0)}
              y2={Math.max(ih * target.y, 0)}
            />
          );
        }
      });
    })

    return (
      <g transform={isRelativePoints ? `translate(${region.x * iw} ${region.y * ih})` : ""}>
        {/*<rect
          strokeWidth={2}
          x={0}
          y={0}
          width={Math.max(region.w * iw, 0)}
          height={Math.max(region.h * ih, 0)}
          stroke={colorAlpha(region.color, 0.25)}
          fill={colorAlpha(region.color, 0.1)}
        />*/}
        {lines}
        {region.points.map((p, idx) => (
          <ellipse
            key={"r-" + region.id + "-" + idx}
            cx={Math.max(isRelativePoints ? region.w * iw * p.x : iw * p.x, 0)}
            cy={Math.max(isRelativePoints ? region.h * ih * p.y : ih * p.y, 0)}
            rx={4}
            ry={4}
            fill={colorAlpha(region.color, 0.75)}
            stroke={colorAlpha(contrastColor(region.color), 0.75)}
          />
        ))}
      </g>
    );
  }),
}

RegionComponents["cuboid"] = RegionComponents["skeleton"];

export const WrappedRegionList = memo(
  ({ regions, keypointDefinitions, iw, ih, fullSegmentationMode, pointRef }) => {
    let PointRefComponent = [];

    if (pointRef) {
      let PRC = RegionComponents["point"];
      PointRefComponent = [(
        <PRC
          key={"wrapped-region-" + Math.random().toString().substring(2)}
          region={{
            ...pointRef,
            color: "#FF0000",
          }}
          iw={iw}
          ih={ih}
        />
      )];
    }

    return [...regions
      .map((r) => {
        let Component;
        Component = RegionComponents[r?.type]
        if (!Component) return null;
        return (
          <Component
            key={"wrapped-region-" + (r.regionId ?? Math.random().toString().substring(2))}
            region={r}
            iw={iw}
            ih={ih}
            keypointDefinitions={keypointDefinitions}
            fullSegmentationMode={fullSegmentationMode}
          />
        )
      }), ...PointRefComponent]
  },
  (n, p) => n.regions === p.regions && n.iw === p.iw && n.ih === p.ih && n.pointRef?.x === p.pointRef?.x && n.pointRef?.y === p.pointRef?.y
)

export const RegionShapes = ({
  // mat,
  imagePosition,
  regions = [],
  keypointDefinitions,
  fullSegmentationMode,
  pointRef = null,
  showTags,
  onUnSelectRegion,
  // projectRegionBox,
  onSelectRegion,
  showLabels,
}) => {
  const iw = imagePosition.bottomRight.x - imagePosition.topLeft.x
  const ih = imagePosition.bottomRight.y - imagePosition.topLeft.y

  const labels = useMemo(() => {
    if (!showTags || !showLabels) {
      return null;
    }
    return regions.map(r => {
      let labelX = 0;
      let labelY = 0;
      let translateX = "";
      let color = r.color ?? "#FF0000";

      if ((r.type === "skeleton" || r.type === "cuboid") && r.position === "absolute") {
        const xMin = Math.min(...r.points.map(p => p.x));
        const yMin = Math.min(...r.points.map(p => p.y));
        labelX = xMin * iw - 10;
        labelY = yMin * ih - 44;
      } else if (r.type === "box") {
        labelX = Math.floor(r.x * iw) - 1;
        labelY = Math.floor(r.y * ih) - 30;
      } else if (r.type === "polygon") {
        if (!(r?.points?.length > 0)) {
          return null;
        }

        const topPoint = Array.from(r.points).sort((a, b) => a[1] - b[1])[0];
        labelX = Math.floor(topPoint[0] * iw) - 1;
        labelY = Math.floor(topPoint[1] * ih) - 28;
        translateX = "translateX(-50%)";
      } else if (r.type === "oval") {
        labelX = Math.floor((r.x + r.w / 2) * iw) - 1;
        labelY = Math.floor(r.y * ih) - 28;
        translateX = "translateX(-50%)";
      } else if (r.type === "point") {
        labelX = Math.floor(r.x * iw) - 1;
        labelY = Math.floor(r.y * ih) - 37;
        translateX = "translateX(-50%)";
      }
      // else if (r.type === "brush") {
      //   labelX = r.x - 1;
      //   labelY =r.y - 28;
      // }
      else if (r.type === "polyline") {
        labelX = r.points[0][0] * iw - 1;
        labelY = r.points[0][1] * ih - 28;
      }
      else {
        return null;
      }

      return (
        <div key={"label-" + r.id} style={{
          fontSize: 12,
          lineHeight: "14px",
          position: "absolute",
          left: imagePosition.topLeft.x + labelX,
          top: imagePosition.topLeft.y + labelY,
          zIndex: 4,
          padding: "6px 8px",
          backgroundColor: colorAlpha(color, 0.75),
          color: contrastColor({bgColor: color}),
          fontWeight: 700,
          borderRadius: 8,
          transform: translateX,
          userSelect: "none",
          cursor: "pointer",
        }} onClick={() => {
          if (r.highlighted) {
            onUnSelectRegion?.(r);
          } else {
            onSelectRegion?.(r);
          }
        }} onContextMenu={e => {
          e.preventDefault();
          e.stopPropagation();
        }}>
          {r?.cls ?? "(no label)"}
        </div>
      );
    });
  }, [showTags, regions, imagePosition.topLeft.x, imagePosition.topLeft.y, iw, ih, onUnSelectRegion, onSelectRegion, showLabels]);

  if (isNaN(iw) || isNaN(ih)) return null

  return (
    <>
      {labels}
      <svg
        width={iw}
        height={ih}
        style={{
          position: "absolute",
          zIndex: 4,
          left: imagePosition.topLeft.x,
          top: imagePosition.topLeft.y,
          pointerEvents: "none",
          width: iw,
          height: ih,
        }}
        onClick={onUnSelectRegion}
      >
        <WrappedRegionList
          key="wrapped-region-list"
          regions={regions}
          iw={iw}
          ih={ih}
          keypointDefinitions={keypointDefinitions}
          fullSegmentationMode={fullSegmentationMode}
          pointRef={pointRef}
        />
      </svg>
    </>
  )
}

export default RegionShapes
