import { Spin } from "antd";
import {
  IconCopy,
  IconInfo,
  IconPredict,
  IconViewAll,
  LsSettings,
  LsStar,
  LsTrash
} from "../../assets/icons";
import { Button } from "../../common/Button/Button";
import { Tooltip } from "../../common/Tooltip/Tooltip";
import { Elem } from "../../utils/bem";
import { GroundTruth } from "../CurrentEntity/GroundTruth";
import { EditingHistory } from "./HistoryActions";
import { confirm /*, info, standaloneModal*/ } from "../../common/Modal/Modal";
import { useCallback, useMemo } from "react";
// import { Space } from "../../common/Space/Space";
// import PredicAudioRecorder from "../PredictAudioRecorder";
import { IconFullscreen } from "../../assets/icons/timeline";
// import Input from "../../common/Input/Input";
import { getEnv } from "mobx-state-tree";

export const Actions = ({ store, hasPredict, loadingPredictUrl, predicting, hasMlAssisted, usePromptPredict }) => {
  const annotationStore = store.annotationStore;
  const entity = annotationStore.selected;
  const saved = !entity.userGenerate || entity.sentUserGenerate;
  const isPrediction = entity?.type === 'prediction';
  const isViewAll = annotationStore.viewingAll;
  // const hasVideo = Array.from(store.annotationStore.names.values()).some((tag) => {
  //   return tag.type.match(/video/ig);
  // });

  const events = useMemo(() => {
    return getEnv(store).events;
  }, [store]);

  const onToggleVisibility = useCallback(() => {
    annotationStore.toggleViewingAllAnnotations();
  }, [annotationStore]);

  // const onAiPromptClick = useCallback(() => {
  //   let audioData = null;
  //   let prompt = "";
  //
  //   const modal = standaloneModal({
  //     title: "AI Prompt",
  //     body: (
  //       <>
  //         <PredicAudioRecorder onRecorded={d => audioData = d} />
  //         <div style={{ marginTop: 16, marginBottom: 8 }}>Text prompt</div>
  //         <Input
  //           placeholder="Enter your prompt here..."
  //           onChange={ev => prompt = ev.target.value}
  //         />
  //       </>
  //     ),
  //     allowClose: false,
  //     footer: (
  //       <Space align="end">
  //         <Button
  //           onClick={() => {
  //             modal.close();
  //           }}
  //           size="compact"
  //           autoFocus
  //         >
  //           Cancel
  //         </Button>
  //
  //         <Button
  //           onClick={async () => {
  //             if (audioData === null && prompt.trim().length === 0) {
  //               info({
  //                 title: "Error",
  //                 body: "Please enter a prompt or record an audio prompt",
  //               });
  //
  //               return;
  //             }
  //
  //             modal.close();
  //             const [result] = await events.invoke("aiPrompt", audioData, prompt);
  //
  //             if (result && window.APP_SETTINGS.debug) {
  //               console.log(result);
  //             }
  //           }}
  //           size="compact"
  //           look={"primary"}
  //         >
  //           OK
  //         </Button>
  //       </Space>
  //     ),
  //   });
  // }, [events]);

  const onSimpleAiPromptClick = useCallback(async () => {
    const [result] = await events.invoke("aiPrompt", null, null);

    if (result && window.APP_SETTINGS.debug) {
      console.log(result);
    }
  }, []);

  return (
    <Elem name="section">
      {store.hasInterface("annotations:view-all")  && (
        <Tooltip title="View all annotations">
          <Button
            icon={<IconViewAll />}
            type="text"
            aria-label="View All"
            onClick={() => onToggleVisibility()}
            primary={ isViewAll }
            style={{
              height: 36,
              width: 36,
              padding: 0,
            }}
            className="lsf-topbar_button-color"
          />
        </Tooltip>
      )}

      {!isViewAll && store.hasInterface("ground-truth") && <GroundTruth entity={entity}/>}

      {!isPrediction && !isViewAll && store.hasInterface('edit-history') && <EditingHistory entity={entity} />}

      {!isViewAll && store.hasInterface("annotations:delete") && (
        <Tooltip title="Delete annotation">
          <Button
            icon={<LsTrash />}
            look="danger"
            type="text"
            aria-label="Delete"
            onClick={() => {
              confirm({
                title: "Delete annotation",
                body: "This action cannot be undone",
                buttonLook: "destructive",
                okText: "Proceed",
                onOk: () => entity.list.deleteAnnotation(entity),
              });
            }}
            style={{
              height: 36,
              width: 36,
              padding: 0,
            }}
            className="lsf-topbar_button-color"
          />
        </Tooltip>
      )}

      {!isViewAll && store.hasInterface("annotations:add-new") && saved && (
        <Tooltip title={`Create copy of current ${entity.type}`}>
          <Button
            icon={<IconCopy style={{ width: 36, height: 36 }}/>}
            size="small"
            look="ghost"
            type="text"
            aria-label="Copy Annotation"
            onClick={(ev) => {
              ev.preventDefault();

              const cs = store.annotationStore;
              const c = cs.addAnnotationFromPrediction(entity);

              // this is here because otherwise React doesn't re-render the change in the tree
              window.setTimeout(function() {
                store.annotationStore.selectAnnotation(c.id);
              }, 50);
            }}
            style={{
              height: 36,
              width: 36,
              padding: 0,
            }}
            className="lsf-topbar_button-color"
          />
        </Tooltip>
      )}

      <Button
        icon={<LsSettings/>}
        type="text"
        aria-label="Settings"
        onClick={() => store.toggleSettings()}
        style={{
          height: 36,
          width: 36,
          padding: 0,
        }}
        className="lsf-topbar_button-color"
      />

      {store.description && store.hasInterface('instruction') && (
        <Button
          icon={<IconInfo style={{ width: 16, height: 16 }}/>}
          primary={store.showingDescription}
          type="text"
          aria-label="Instructions"
          onClick={() => store.toggleDescription()}
          style={{
            height: 36,
            width: 36,
            padding: 0,
          }}
          className="lsf-topbar_button-color"
        />
      )}

      <Tooltip title="Fullscreen">
        <Button
          icon={<IconFullscreen style={{ width: 20, height: 20, transform: "scale(0.95) translateY(-2px)" }}/>}
          type="text"
          aria-label="Fullscreen"
          onClick={() => store.toggleFullscreen()}
          style={{
            height: 36,
            width: 36,
            padding: 0,
          }}
          className="lsf-topbar_button-color"
        />
      </Tooltip>

      {(loadingPredictUrl || predicting) && (
        <Tooltip title={loadingPredictUrl ? "Loading AI backend..." : "Predicting..."}>
          <Button
            icon={<Spin size="18" />}
            aria-label="Loading AI backend..."
            style={{
              height: 36,
              width: 36,
              padding: 0,
            }}
            className="lsf-topbar_button-color"
          />
        </Tooltip>
      )}

      {!usePromptPredict && hasPredict && !loadingPredictUrl && !predicting && (
        <Tooltip title="AI Predict">
          <Button
            icon={<IconPredict style={{ width: 24, height: 24 }}/>}
            type="text"
            aria-label="AI Predict"
            onClick={onSimpleAiPromptClick}
            style={{
              height: 36,
              width: 36,
              padding: 0,
            }}
            className="lsf-topbar_button-color"
          />
        </Tooltip>
      )}

      {hasMlAssisted && !predicting && !loadingPredictUrl && (
        <Tooltip title="Reload ML backend">
          <Button
            icon={(
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LsStar style={{ width: 32, height: 32 }}/>
                <Tooltip
                  title={(hasPredict ? "Status: OK. " : "Status: Not found. ") + "By clicking this button, you will initiate a process to check updates of the AI backend."}
                  style={{ maxWidth: 360 }}
                >
                  <IconInfo
                    style={{
                      width: 14,
                      height: 14,
                      position: "absolute",
                      top: 0,
                      right: 0,
                      color: hasPredict ? "green" : "red",
                    }}
                  />
                </Tooltip>
              </div>
            )}
            type="text"
            aria-label="Reload ML backend"
            onClick={() => events.invoke("reloadMlBackend")}
            style={{
              height: 36,
              width: 36,
              padding: 0,
            }}
            className="lsf-topbar_button-color"
          />
        </Tooltip>
      )}
    </Elem>
  );
};


