import { observer } from "mobx-react";
import { useCallback, useMemo } from "react";
import { Button } from "../../common/Button/Button";
import { confirm, info } from "../../common/Modal/Modal";
import { Block, Elem } from "../../utils/bem";
import { Actions } from "./Actions";
import { Annotations } from "./Annotations";
import { Controls } from "./Controls";
import { CurrentTask } from "./CurrentTask";
import "./TopBar.styl";

export const TopBar = observer(({ store }) => {
  const annotationStore = store.annotationStore;
  const entity = annotationStore?.selected;
  const isPrediction = entity?.type === 'prediction';

  const isViewAll = annotationStore?.viewingAll === true;

  const redactRegions = useMemo(() => {
    return Array.from(entity?.areas.values() ?? [])
      .filter(r => r.type === "audioredact"
        && r.results?.[0]?.value?.audioredact?.start !== undefined
        && r.results?.[0]?.value?.audioredact?.end !== undefined);
  }, [entity?.areas, entity?.regions]);

  const showApplyRedact = useMemo(() => {
    return store.interfaces.includes("submit", "update") && redactRegions.length > 0;
  }, [redactRegions.length]);

  const applyRedact = useCallback(() => {
    confirm({
      title: "Apply Redactions",
      body: "The original audio will be redacted and this actions can not be reverted. "
        + "Are you sure you want to save annotation and apply redactions?",
      onOk: async () => {
        store.setFlags({ isApplyingRedact: true });

        const process = async () => {
          await store.annotationStore.selected?.redact();
          store.setFlags({ isApplyingRedact: false });
        };

        const res = entity.pk
          ? store.updateAnnotation(undefined, process)
          : store.submitAnnotation(process);

        if (!res) {
          info({ title: "Error", body: "Failed to save annotation. Please try again." });
          store.setFlags({ isApplyingRedact: false });
        }
      },
    });
  }, []);

  return store ? (
    <Block name="topbar" mod={{ visible: store.showTopBar, invisible: !store.showTopBar }}>
      {store.showTopBar && (
        <>
          <Elem name="group">
            <CurrentTask store={store}/>
            {!isViewAll && (
              <Annotations
                store={store}
                annotationStore={store.annotationStore}
                commentStore={store.commentStore}
              />
            )}
            <Actions
              store={store}
              hasPredict={store.hasPredict}
              loadingPredictUrl={store.loadingPredictUrl}
              predicting={store.predicting}
              hasMlAssisted={store.hasMlAssisted}
              usePromptPredict={store.usePromptPredict}
            />
            {store.canApplyRedact && showApplyRedact && (
              <Elem name="section">
                <Button
                  style={{ color: "white" }}
                  primary={true}
                  look={"danger"}
                  onClick={applyRedact}
                >
                  Apply Redactions
                </Button>
              </Elem>
            )}
          </Elem>
          <Elem name="group">
            {/*{!isViewAll && (

              <Elem name="section" className="lsf-topbar_dynamic-preannotations">
                <DynamicPreannotationsToggle />
              </Elem>
            )}*/}
            {!isViewAll && store.hasInterface("controls") && (store.hasInterface("review") || !isPrediction) && (
              <Elem name="section" mod={{ flat: true }} style={{ width: 320, boxSizing: 'border-box' }}>
                <Controls annotation={entity}/>
              </Elem>
            )}
          </Elem>
        </>
      )}
      <Elem
        name="toggle"
        onClick={() => store.toggleTopBar()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 8 24 10" strokeWidth="1.5" stroke="currentColor" height="8px">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </Elem>
    </Block>
  ) : null;
});
