import { observer } from "mobx-react";
import { getEnv } from "mobx-state-tree";
import { Button } from "../../common/Button/Button";
import { info } from "../../common/Modal/Modal";
import { TextArea } from "../../common/TextArea/TextArea";
import { Block, Elem } from "../../utils/bem";
import { CurrentEntity } from "../CurrentEntity/CurrentEntity";
import Entities from "../Entities/Entities";
import Entity from "../Entity/Entity";
// import Relations from "../Relations/Relations";
import { Comments } from "../Comments/Comments";

import './CommentsSection.styl';
import React from "react";

export const AnnotationTab = observer(({ store }) => {
  const as = store.annotationStore;
  const annotation = as.selectedHistory ?? as.selected;
  const { selectionSize } = annotation || {};
  const hasSegmentation = store.hasSegmentation && !as.isQuestionsExtract;

  const scripts = React.useMemo(() => {
    if (typeof store.task.data !== "string") {
      return null;
    }

    try {
      const dataObj = JSON.parse(store.task.data);

      if (Object.hasOwn(dataObj, "scripts") && typeof dataObj["scripts"] === "string") {
        return dataObj["scripts"].replaceAll("\n", "<br/>");
      }
    } catch {
      //
    }

    return null;
  }, [store.task.data]);

  return (
    <>
      {store.hasInterface("annotations:current") && (
        <CurrentEntity
          entity={as.selected}
          showControls={store.hasInterface("controls")}
          canDelete={store.hasInterface("annotations:delete")}
          showHistory={store.hasInterface("annotations:history")}
          showGroundTruth={store.hasInterface("ground-truth")}
        />
      )}

      {selectionSize ? (
        !as.isQuestionsExtract && <Entity store={store} annotation={annotation} />
      ) : hasSegmentation ? (
        <p style={{ marginTop: 12, marginBottom: 0, paddingInline: 15 }}>
          No Region selected
        </p>
      ) : null}

      {hasSegmentation && (
        <Entities
          store={store}
          annotation={annotation}
          regionStore={annotation.regionStore}
        />
      )}

      {/*{hasSegmentation && (
        <Relations store={store} item={annotation} />
      )}*/}

      {store.usePromptPredict && store.hasPredict && (
        <div style={{ padding: 16 }}>
          <TextArea
            style={{ outline: "solid 1px rgba(0, 0, 0, 0.1)" }}
            disabled={store.loadingPredictUrl || store.predicting}
            placeholder="Enter predict prompt (optional)..."
            value={store.prompt}
            onChange={e => store.setFlags({ prompt: e })}
          />
          <div style={{ textAlign: "right" }}>
            <Button
              look="primary"
              disabled={store.loadingPredictUrl || store.predicting}
              onClick={() => {
                // if (store.prompt.trim().length === 0) {
                //   info({ title: "Error", body: "Please enter your prompt" });
                //   return;
                // }

                getEnv(store).events.invoke('aiPrompt', null, store.prompt);
              }}
              style={{ color: "var(--button-color)" }}
            >
              AI Predict
            </Button>
          </div>
        </div>
      )}

      {store.hasInterface("annotations:comments") && store.commentStore.isCommentable && (
        <Block name="comments-section">
          <Elem name="header">
            <Elem name="title">Comments</Elem>
          </Elem>

          <Elem name="content">
            <Comments
              commentStore={store.commentStore}
              cacheKey={`task.${store.task.id}`}
            />
          </Elem>
        </Block>
      )}

      {scripts && (
        <Block name="comments-section">
          <Elem name="header">
            <Elem name="title">Scripts</Elem>
          </Elem>
          <div dangerouslySetInnerHTML={{ __html: scripts }} style={{ paddingLeft: 15, paddingRight: 15 }} />
        </Block>
      )}
    </>
  );
});
