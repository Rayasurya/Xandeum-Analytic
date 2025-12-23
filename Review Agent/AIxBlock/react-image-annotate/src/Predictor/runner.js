import { MainLayoutState, PredictRequest } from "../MainLayout/types";
import type { Action } from "../MainLayout/types";
import { memo, MutableRefObject } from "react";
import Button from "@mui/material/Button";

function RunnerInternal({ url, predict, imageBase64, imageW, imageH, dispatch, projectId, regionClsList, enabledTools, taskId, predictConfigRef, predictTask, predictModel }: {
  url: string,
  predict: PredictRequest,
  imageBase64: string,
  imageW: number,
  imageH: number,
  dispatch: (action: Action) => MainLayoutState,
  projectId: string,
  regionClsList: string[],
  enabledTools: string[],
  taskId: number,
  predictConfigRef: MutableRefObject,
}) {
  const payload = {
    command:"predict",
    params:{
      prompt: regionClsList.join(","), // "person,bowl,cup,bottle,shirt,chopsticks,glass,scoop,television,beer",
      model_id: predictModel,
      token_lenght: 50,
      task: predictTask,
      model_type: enabledTools.includes("create-polygon")
        ? "polygonlabels"
        : (
          enabledTools.includes("create-box")
            ? "rectanglelabels"
            : ""
        ),
      text: null,
      voice: null, // {data:"base64", file_name:"abc.mp3"},
      image: null,
      // image_pref: null, // {data:"base64", file_name:"abc.png", label:""},
      // image_pref_label: null, // {data:"base64", file_name:"abc.png", label:""},
      // draw_polygons: [],
      // clickpoint: [], // [[6.7670470756062775, 8.525932819186878], [6.7670470756062775, 8.525932819186878]],
      // stability_score_threshold: 0.68,
      // predicted_iou_threshold: 0.68,
      // polygons: [],
      // vertices: "horizontal"
      confidence_threshold: predictConfigRef.current.confidenceThreshold,
      iou_threshold: predictConfigRef.current.iouThreshold,
      task_id: taskId,
    },
    project: projectId.toString(),
  };

  const predictDims = {
    imageW,
    imageH,
    regionX: 0,
    regionY: 0,
    regionW: imageW,
    regionH: imageH,
  }

  if (["rect", "brush"].includes(predict.type)) {
    // payload.polygons.push(
    //   [predict.x, predict.y],
    //   [predict.x + predict.w, predict.y],
    //   [predict.x + predict.w, predict.y + predict.h],
    //   [predict.x, predict.y + predict.h],
    // );

    predictDims.regionX = predict.x;
    predictDims.regionY = predict.y;
    predictDims.regionW = predict.w;
    predictDims.regionH = predict.h;
  } else if (predict.type === "point") {
    payload.params.clickpoint = [predict.x, predict.y];
  } else if (predict.type === "prompt") {
    payload.params.prompt = predict.prompt;
  } else if (predict.type === "voice") {
    payload.params.voice = {
      data: predict.voice,
      file_name: "voice.mp3",
    };
  } else if (predict.type === "image_pref") {
    payload.params.image_pref = predict.image_pref;
    payload.params.image_pref_label = predict.image_pref_label;
  }

  const process = async () => {
    if (predict.type === "rect") {
      await new Promise((resolve) => {
        const srcImg = document.createElement("img");
        srcImg.src = imageBase64;
        srcImg.style.position = "fixed";
        srcImg.style.top = "-10000px";
        srcImg.style.left = "-10000px";
        srcImg.style.opacity = "0";

        srcImg.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = predict.w;
          canvas.height = predict.h;
          canvas.style.position = "fixed";
          canvas.style.top = "-10000px";
          canvas.style.left = "-10000px";
          canvas.style.opacity = "0";
          document.body.appendChild(canvas);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(srcImg, predict.x, predict.y, predict.w, predict.h, 0, 0, predict.w, predict.h);
          console.log(predict.x, predict.y, predict.w, predict.h, 0, 0, predict.w, predict.h)
          payload.params.image = canvas.toDataURL("image/jpeg").substring(imageBase64.indexOf(";base64,") + 8);
          srcImg.remove();
          canvas.remove();
          resolve();
        }

        document.body.appendChild(srcImg);
      });
    } else if (predict.type === "brush") {
      payload.params.image = predict.image;
    } else {
      payload.params.image = imageBase64.substring(imageBase64.indexOf(";base64,") + 8);
    }

    const controller = new AbortController();

    /** @type {RequestInfo} */
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }

    try {
      const r = await fetch(url, requestOptions);
      const json = await r.json();

      if (r.ok) {
        dispatch({
          type: "ADD_AUTO_ANNOTATE_REGIONS",
          ...predictDims,
          data: json?.results?.result?.flat() ?? [],
        });
      } else {
        dispatch({
          type: "SHOW_ERROR",
          text: "An error occurred while predicting selected region.\n"
            + ("detail" in json ? " " + json["detail"] : ""),
        });
      }
    } catch (e) {
      window.APP_SETTINGS.debug && console.error(e);

      if (e.message === "Failed to fetch") {
        dispatch({
          type: "SHOW_ERROR",
          text: "Cannot connect to prediction server.\nPlease wait a moment, click on Refresh ML backend and try again!",
          actions: [
            <Button
              key="refresh-ml-backend"
              onClick={() => {
                dispatch({ type: "HIDE_ERROR" });
                dispatch({ type: "LOAD_ML_BACKEND" });
              }}
              variant="contained"
              color="primary"
            >
              Refresh ML Backend
            </Button>
          ],
        });
      } else {
        dispatch({ type: "SHOW_ERROR", text: e.message });
      }
    }
  }

  process()
    .finally(() => {
      dispatch({ type: "POP_PREDICT" });
    });

  return null;
}

const Runner = memo(RunnerInternal, (pp, np) => {
  return pp.predict.id === np.predict.id;
});

export default Runner;
