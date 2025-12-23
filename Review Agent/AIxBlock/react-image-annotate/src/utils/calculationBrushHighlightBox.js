const calculationRunLengthPositionX = (point,runLength, wCanvas) => {

        return (point + runLength) % wCanvas;

}

export const calculationBrushHighlightBox = (rle,wCanvas) =>{
    const yFirstPoint = Math.floor(rle[0] / wCanvas);
    const yLastPoint = Math.floor((rle[rle.length-2] + rle[rle.length-1]) / wCanvas);
    let xMin = wCanvas;
    let xMax = 0;
    for (let i = 0; i < rle.length; i += 2) {
        const x = rle[i] % wCanvas;
        const runLength = rle[i + 1];
        xMin = Math.min(xMin, x);
        xMax = Math.max(xMax, calculationRunLengthPositionX(x, runLength, wCanvas));
    }
    return {
        x1: xMin,
        x2: xMax,
        y1: yFirstPoint,
        y2: yLastPoint,
        w: xMax - xMin,
        h: yLastPoint - yFirstPoint
    }
}