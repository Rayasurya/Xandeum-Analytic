import React from "react";

type TLineChart = {
  data?: any[];
  color?: string;
  svgHeight?: number;
  svgWidth?: number;
};

const sampleData = [
  {
    x: 0,
    y: 0,
  },
  {
    x: 1,
    y: 0,
  },
  {
    x: 2,
    y: 0,
  },
  {
    x: 3,
    y: 0,
  },
  {
    x: 4,
    y: 0,
  },
  {
    x: 5,
    y: 0,
  },
  {
    x: 6,
    y: 0,
  },
  {
    x: 7,
    y: 0,
  },
  {
    x: 8,
    y: 0,
  },
  {
    x: 9,
    y: 0,
  },
  {
    x: 10,
    y: 0,
  },
  {
    x: 11,
    y: 0,
  },
];
const LineChart: React.FC<TLineChart> = ({
  // DEFAULT PROPS
  data = sampleData,
  color = "#8956ff",
  svgHeight = 300,
  svgWidth = 700,
}) => {
  // GET MAX & MIN X
  const getMinX = React.useMemo(() => {
    return data[0].x;
  }, [data]);

  const getMaxX = React.useMemo(() => {
    return data[data.length - 1].x;
  }, [data]);

  // GET MAX & MIN Y
  const getMinY = React.useMemo(() => {
    return data.reduce((min, p) => (p.y < min ? p.y : min), data[0].y);
  }, [data]);

  const getMaxY = React.useMemo(() => {
    return data.reduce((max, p) => (p.y > max ? p.y : max), data[0].y);
  }, [data]);

  // GET SVG COORDINATES
  const getSvgX = React.useCallback(
    (x: number) => {
      return (x / getMaxX) * svgWidth;
    },
    [getMaxX, svgWidth]
  );

  const getSvgY = React.useCallback(
    (y: number) => {
      return svgHeight - (y / getMaxY) * svgHeight;
    },
    [getMaxY, svgHeight]
  );

  // BUILD SVG PATH
  const makePath = React.useCallback(() => {
    let pathD = "M " + getSvgX(data[0].x) + " " + getSvgY(data[0].y) + " ";

    pathD += data.map((point, i) => {
      return "L " + getSvgX(point.x) + " " + getSvgY(point.y) + " ";
    });

    return (
      <path
        className="linechart_path"
        d={pathD}
        style={{ stroke: color }}
        fill="url(#paint0_linear_6077_19964)"
      />
    );
  }, [getSvgX, data, getSvgY, color]);

  // BUILD GRID AXIS
  const makeAxis = React.useCallback(() => {
    const minX = getMinX,
      maxX = getMaxX;
    const minY = getMinY,
      maxY = getMaxY;

    return (
      <g className="linechart_axis">
        <line
          x1={getSvgX(minX)}
          y1={getSvgY(minY)}
          x2={getSvgX(maxX)}
          y2={getSvgY(minY)}
        />
        <line
          x1={getSvgX(minX)}
          y1={getSvgY(minY)}
          x2={getSvgX(minX)}
          y2={getSvgY(maxY)}
        />
      </g>
    );
  }, [getMinX, getMaxX, getMinY, getMaxY, getSvgX, getSvgY]);
  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
      {makePath()}
      {makeAxis()}
      {/* <defs>
        <linearGradient
          id="paint0_linear_6077_19964"
          x1={getMinX}
          y1={getMinY}
          x2={getMaxX}
          y2={getMaxY}
          gradientUnits="objectBoundingBox"
        >
          <stop stopColor="#8956FF" stopOpacity="0.3" />
          <stop offset="1" stopColor="#8956FF" stopOpacity="0.05" />
        </linearGradient>
      </defs> */}
    </svg>
  );
};

export default LineChart;
