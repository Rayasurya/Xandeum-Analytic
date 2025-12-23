import { types } from "mobx-state-tree";
import { AnnotationMixin } from "../../mixins/AnnotationMixin";
import SeparatedControlMixin from "../../mixins/SeparatedControlMixin";
import { Block } from "../../utils/bem";
import Registry from "../../core/Registry";
import { inject, observer } from "mobx-react";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import "./Questions.styl";
import { TextArea } from "../../common/TextArea/TextArea";
import { Button } from "../../common/Button/Button";
import Tree from "../../core/Tree";
import { useEffect } from "react";
import { Label } from "../../components/Label/Label";

const TagAttrs = types.model({
  name: types.identifier,
  toname: types.maybeNull(types.string),
  style: types.maybeNull(types.string),
});

const Model = types
  .model({
    type: "questions",
    resultType: "question",
    valueType: "question",
  })
  .views((self) => ({
    states() {
      return self.annotation.toNames.get(self.name);
    },
  }))
  .actions(() => ({
  }));

const QuestionsModel = types.compose("QuestionsModel", TagAttrs, SeparatedControlMixin, AnnotationMixin, Model);

const HtxQuestionsView = ({ store, item }) => {
  const results = store.annotationStore.selected?.results.filter(r => {
    return r.type === item.resultType
      && r.from_name.name === item.name
      && "question" in r.value
      && r.value.question.trans_id === item.obj.selectedTranscriptFile;
  }) ?? [];

  useEffect(() => {
    store.annotationStore.selected?.unselectAll();
  }, [item.obj.selectedTranscriptFile]);

  if (!item.obj || item.obj.type !== "transcripts") {
    return <ErrorMessage error="The Questions control only support Transcripts object." />;
  }

  return (
    <>
      <Block name="questions" style={item.style ? Tree.cssConverter(item.style) : {}}>
        {results.map(r => {
          const classes = ["lsf-item"];
          const types = [];

          if (r.area.selected) {
            classes.push("lsf-item--selected");
          }

          r.area.results.forEach(r => {
            if (!r.type.endsWith("labels")) {
              return;
            }

            Object.keys(r.value).forEach(lk => {
              if (!Array.isArray(r.value[lk])) {
                return;
              }

              const labels = r.from_name.children.filter(c => r.value[lk].includes(c.value));

              labels.forEach(l => {
                types.push(<Label key={r.id + "-" + l.id} color={l.background}>{l.value}</Label>);
              });
            });
          });

          return (
            <div key={"question-" + r.id} className={classes.join(" ")} onClick={() => {
              if (r.area.selected) {
                // store.annotationStore.selected?.unselectAll();
              } else {
                store.annotationStore.selected?.selectArea(r.area);
              }
            }}>
              <div className="lsf-split">
                <div className="lsf-lbl">Question:</div>
                <TextArea
                  className="lsf-value"
                  autoSize={true}
                  value={r.value.question.question}
                  maxRows={10}
                  onChange={v => {
                    r.setValue({ ...r.value.question, question: v });
                  }}
                />
              </div>
              <div className="lsf-split">
                <div className="lsf-lbl">Answer:</div>
                <TextArea
                  className="lsf-value"
                  autoSize={true}
                  value={r.value.question.answer}
                  maxRows={10}
                  onChange={v => {
                    r.setValue({ ...r.value.question, answer: v });
                  }}
                />
              </div>
              <div className="lsf-split">
                <div className="lsf-lbl">Types:</div>
                <div className="lsf-lbl-list">
                  {types.length === 0 ? <em>(No label)</em> : types}
                  <Button
                    className="lsf-delete"
                    size="compact"
                    look="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      r.area.deleteRegion();
                    }}
                  >
                    x
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </Block>
      <Block name="questions-actions">
        <Button
          look="primary"
          onClick={() => {
            const area = store.annotationStore.selected?.createResult({
              type: "question",
              from_name: item,
            }, {
              question: {
                question: "",
                answer: "",
                trans_id: item.obj.selectedTranscriptFile,
              },
            }, item, item.obj);

            store.annotationStore.selected?.selectArea(area);
          }}
        >
          Add question
        </Button>
      </Block>
    </>
  );
};

const HtxQuestions = inject("store")(observer(HtxQuestionsView));

Registry.addTag("questions", QuestionsModel, HtxQuestions);
Registry.addObjectType(QuestionsModel);

export { QuestionsModel, HtxQuestions };
