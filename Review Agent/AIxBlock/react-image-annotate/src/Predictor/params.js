import type {Action, PredictRequest} from "../MainLayout/types";
import {Slider} from "@mui/material";
import {ConfirmDialog} from "../ConfirmDialog";
import {memo, useEffect, useState} from "react";
import {MainLayoutState} from "../MainLayout/types";

function ParamsInternal({predict, dispatch, projectId}: {
  predict: PredictRequest,
  dispatch: (action: Action) => MainLayoutState,
  projectId: number,
}) {
  const [confidence, setConfidence] = useState(
    predict.confidence_threshold
    ?? localStorage.getItem("predict_" + projectId + "_confidence")
    ?? 0.8
  );

  const [iou, setIOU] = useState(
    predict.iou_threshold
    ?? localStorage.getItem("predict_" + projectId + "_iou")
    ?? 0.8
  );

  useEffect(() => {
    localStorage.setItem("predict_" + projectId + "_confidence", confidence)
  }, [confidence, projectId]);

  useEffect(() => {
    localStorage.setItem("predict_" + projectId + "_iou", iou)
  }, [iou, projectId]);

  return (
    <ConfirmDialog
      title="Predict Parameters"
      open={true}
      onConfirm={() => dispatch({
        type: "UPDATE_PREDICT_PARAMS",
        id: predict.id,
        confidence_threshold: confidence,
        iou_threshold: iou,
      })}
      onCancel={() => dispatch({ type: "REMOVE_PREDICT", id: predict.id })}
    >
      <div style={{
        maxWidth: 200,
        width: "calc(100vw - 48px)",
      }}>
        <label>Confidence Threshold: {confidence}</label>
        <Slider
          value={confidence}
          min={0} max={1} step={0.01}
          onChange={(e, v) => setConfidence(v)}
        />
        <label>IOU Threshold: {iou}</label>
        <Slider
          value={iou}
          min={0} max={1} step={0.01}
          onChange={(e, v) => setIOU(v)}
        />
      </div>
    </ConfirmDialog>
  )
}

const Params = memo(ParamsInternal, (pp, np) => {
  return pp.predict.id === np.predict.id;
});

export default Params;
