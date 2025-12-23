export function addMidpoints(points) {
    const newPoints = [];
    for (let i = 0; i < points.length - 1; i++) {
      const point1 = points[i];
      const point2 = points[i + 1];
      const midpoint = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
      newPoints.push(point1, midpoint);
    }
    newPoints.push(points[points.length - 1]);
    return newPoints;
  }


  export function addMidpoint(point1, point2) {
    return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
  }