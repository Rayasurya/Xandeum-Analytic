const tP2 = Math.pow(0.5, 2);
const a = 0.5;

export const normalizePolylinePoints = (pts) => {
  const points = Array.from(pts);

  for (let i = 0; i < points.length - 2; i += 2) {
    const P0 = points[i];
    const P1 = points[i + 1];
    const P2 = points[i + 2];

    points[i + 1] = [
      tP2 * P0[0] + a * P1[0] + tP2 * P2[0],
      tP2 * P0[1] + a * P1[1] + tP2 * P2[1]
    ];
  }

  return points;
}

export const normalizedPointToRealPoint = (P0, P1, P2) => {
  return [
    (P1[0] - tP2 * P0[0] - tP2 * P2[0]) / a,
    (P1[1] -tP2 * P0[1] - tP2 * P2[1]) / a,
  ];
}

export const calculationPolylineHighlightBox = (points) => {
  const pointsX = points.map(p => p[0]);
  const pointsY = points.map(p => p[1]);
  const xMin = Math.min(...pointsX);
  const xMax = Math.max(...pointsX);
  const yMin = Math.min(...pointsY);
  const YMax = Math.max(...pointsY);

  return {
    x1: xMin,
    x2: xMax,
    y1: yMin,
    y2: YMax,
    w: xMax - xMin,
    h: YMax - yMin
  }
}
