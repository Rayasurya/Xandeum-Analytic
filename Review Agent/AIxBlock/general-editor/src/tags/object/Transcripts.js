import { getRoot, types } from "mobx-state-tree";
import { AnnotationMixin } from "../../mixins/AnnotationMixin";
import { inject, observer } from "mobx-react";
import Registry from "../../core/Registry";
import { useMemo } from "react";
import { Select } from "../../common/Select/Select";
import { Block, Elem } from "../../utils/bem";
import "./Transcripts.styl";
import Tree from "../../core/Tree";

const TagAttrs = types.model({
  name: types.identifier,
  value: types.maybeNull(types.string),
  style: types.maybeNull(types.string),
  transcriptstyle: types.maybeNull(types.string),
});

const Model = types
  .model({
    type: "transcripts",
    data: types.map(types.string),
    selectedTranscriptFile: types.maybeNull(types.string),
    transcriptFiles: types.array(types.string),
  })
  .views((self) => ({

    get store() {
      return getRoot(self);
    },

    states() {
      return self.annotation.toNames.get(self.name);
    },

  }))
  .actions((self) => ({

    afterCreate() {
      self.selectedTranscriptFile = null;

      if (!self.value) {
        return;
      }

      if (self.value.startsWith("$")) {
        const dataKey = self.value.substr(1);

        try {
          const d = JSON.parse(self.store.task?.data);

          if (dataKey in d) {
            if (typeof d[dataKey] === "object") {
              self.data = d[dataKey];
            } else if (typeof d[dataKey] === "string") {
              try {
                const t = JSON.parse(d[dataKey]);

                if (typeof t === "object") {
                  self.data = t;
                }
              } catch (e) {
                self.data.set("", d[dataKey].toString());
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        try {
          const d = JSON.parse(self.value);

          if (typeof d === "object") {
            self.data = d;
          }
        } catch (e) {
          console.error(e);
        }
      }

      self.transcriptFiles = Array.from(self.data.keys());

      if (self.transcriptFiles.length > 0) {
        self.selectedTranscriptFile = self.transcriptFiles[0];
      }
    },

    selectTranscriptFile(fn) {
      if (self.transcriptFiles.includes(fn)) {
        self.selectedTranscriptFile = fn;
      } else {
        self.selectedTranscriptFile = null;
      }
    },

  }));

const TranscriptsModel = types.compose("TranscriptsModel", TagAttrs, AnnotationMixin, Model);

const HtxTranscriptsView = ({ store, item }) => {
  // Transcript content
  const selectedTranscriptContent = useMemo(() => {
    if (!item.transcriptFiles.includes(item.selectedTranscriptFile)) {
      return <em>(Select a transcript file)</em>;
    }

    if (item.data.has(item.selectedTranscriptFile)) {
      return item.data.get(item.selectedTranscriptFile).split("\n").map((l, i) => <p key={"trans-line-" + i}>{l}</p>);
    }

    return <em>(Empty transcript)</em>;
  }, [item.selectedTranscriptFile, item.data]);

  return (
    <Block name="transcripts" style={item.style ? Tree.cssConverter(item.style) : {}}>
      {item.transcriptFiles.length > 1 && (
        <Select variant="rounded" value={item.selectedTranscriptFile} onChange={v => item.selectTranscriptFile(v)}>
          {item.transcriptFiles.map(f => <Select.Option key={f} value={f}>{f}</Select.Option>)}
        </Select>
      )}
      <Elem name="transcript" style={item.transcriptstyle ? Tree.cssConverter(item.transcriptstyle) : {}}>
        {selectedTranscriptContent}
      </Elem>
    </Block>
  );
};

const HtxTranscripts = inject("store")(observer(HtxTranscriptsView));

Registry.addTag("transcripts", TranscriptsModel, HtxTranscripts);
Registry.addObjectType(TranscriptsModel);

export { TranscriptsModel, HtxTranscripts };
