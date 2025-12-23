/**
 *
 * @param canvas
 * @param imageWidth
 * @param imageHeight
 * @param {AbortSignal} abortSignal
 * @returns {[]}
 */
export function getRleFromCanvas(canvas, imageWidth, imageHeight, abortSignal) {
  // const scaleRatio = canvas.width / imageWidth;
  // console.log("Convert to RLE ratio: ", scaleRatio);
  // const oldWidth = canvas.width;
  // const oldHeight = canvas.height;
  // const newWidth = imageWidth;
  // const newHeight = imageWidth / canvas.width * canvas.height;
  canvas.setWidth(imageWidth);
  canvas.setHeight(imageHeight);
  canvas.setZoom(1);
  canvas.renderAll();
  let imageData = canvas.getContext('2d').getImageData(0, 0, imageWidth, imageHeight);
  // canvas.setWidth(oldWidth);
  // canvas.setHeight(oldHeight);
  // canvas.setZoom(oldZoom);
  // canvas.requestRenderAll();

  let data = imageData.data;
  let rleData = [];
  let isCounting = false;
  let startIndex = 0;

  for (let i = 0; i < data.length; i = i + 4) {
    if (abortSignal.aborted) {
      return [];
    }

    if (data[i] !== 0 || data[i+1] !== 0 || data[i+2] !== 0 || data[i+3] !== 0) {
      if (!isCounting) {
        isCounting = true;
        startIndex = i / 4;
      }
    } else {
      if (isCounting) {
        rleData.push(startIndex, i / 4 - 1 - startIndex);
        isCounting = false;
      }
    }
  }

  if (isCounting) {
    rleData.push(startIndex, Math.floor(data.length / 4 - startIndex));
  }

  return rleData;
}

/**
 *
 * @param {ImageData} data
 * @param {number} index
 * @param {[number, number, number, number]} color
 */
function setPixel(data, index, color) {
  data.data[index * 4] = color[0];
  data.data[index * 4 + 1] = color[1];
  data.data[index * 4 + 2] = color[2];
  data.data[index * 4 + 3] = color[3];
  return data;
}

/**
 * @param {number[]} rle
 * @param {fabric.Canvas} canvas
 * @param {[number, number, number, number]} color
 * @param {AbortSignal} abortSignal
 */
export function setRleToCanvas(rle, canvas, color, abortSignal) {
  console.log("RLE color: ", color);

  if (rle.length % 2 !== 0) {
    console.error("Invalid RLE length " + rle.length);
    return;
  }

  let data = canvas.getContext("2d").createImageData(canvas.width, canvas.height);
  console.log("Canvas data length: ", data.data.length);
  const maxDataIndex = canvas.width * canvas.height;
  let latestIndex = 0;
  console.log("Max data index: ", maxDataIndex);
  console.log("Non-empty data: ", data.data.filter(i => i > 0).length);

  for (let i = 0; i < rle.length; i = i + 2) {
    if (abortSignal.aborted) {
      return;
    }

    for (let j = latestIndex + 1; j <= rle[i]; j++) {
      if (abortSignal.aborted) {
        return;
      }

      data = setPixel(data, j, [0, 0, 0, 0]);
    }

    for (let j = 0; j < rle[i + 1]; j++) {
      if (abortSignal.aborted) {
        return;
      }

      data = setPixel(data, rle[i] + j, color);
    }

    latestIndex = rle[i] + rle[i] + rle[i + 1] + 1;
  }

  if (latestIndex < maxDataIndex) {
    for (let i = latestIndex + 1; i <= maxDataIndex; i++) {
      data = setPixel(data, i, [0, 0, 0, 0]);
    }
  }

  console.log("Data length: ", data.data.length);
  console.log("Data pixels: ", data.data.length / 4);
  console.log("Non-empty data: ", data.data.filter(i => i > 0).length);
  canvas.getContext("2d").putImageData(data, 0,  0);
}
