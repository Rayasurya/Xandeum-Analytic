import { getRoot, types } from "mobx-state-tree";
import Input from "../../common/Input/Input";
import { AnnotationMixin } from "../../mixins/AnnotationMixin";
import { inject, observer } from "mobx-react";
import Registry from "../../core/Registry";
import { useEffect, useState } from "react";
import { Select } from "../../common/Select/Select";
import { Block } from "../../utils/bem";
import { parseValue } from "../../utils/data";
import LANGUAGES from "../../utils/languages.json";

const TagAttrs = types.model({
});

const Model = types
  .model({
    name: types.identifier,
    style: types.maybeNull(types.string),
    src: types.maybeNull(types.string),
    tgt: types.maybeNull(types.string),
    type: "languagepair",
    resultType: "languagepair",
    valueType: "languagepair",
    source: types.maybeNull(types.string),
    sourceName: types.maybeNull(types.string),
    target: types.maybeNull(types.string),
    targetName: types.maybeNull(types.string),
    holdsState: true,
    stickySource: types.optional(types.boolean, false),
    stickyTarget: types.optional(types.boolean, false),
  })
  .views((self) => ({

    get store() {
      return getRoot(self);
    },

    states() {
      return self.annotation?.toNames?.get(self.name);
    },

  }))
  .actions((self) => ({

    existingArea() {
      let area = null;

      self.annotation?.areas?.forEach((a) => {
        if (a.object.type !== self.type) return;
        area = a;
      });

      return area;
    },

    updateResult() {
      if (!self.annotation) return;
      const existingArea = self.existingArea();

      if (existingArea) {
        existingArea.setValue(self);
      } else {
        console.log(self, self.name);
        self.annotation.createResult({
          type: self.type,
          from_name: self.name,
          to_name: self.name,
        }, {
          [self.valueType]: {
            source: self.source,
            target: self.target,
          },
        }, self, self.name);
      }
    },

    selectedValues() {
      return {
        source: self.source,
        target: self.target,
      };
    },

    setVal(key, val) {
      if (!["source", "target"].includes(key)) {
        return;
      }

      self[key] = val;
      self[key + "Name"] = LANGUAGES[val];
      self.updateResult();
    },

    setSource(val) {
      self.setVal("source", val);
    },

    setTarget(val) {
      self.setVal("target", val);
    },

    afterCreate() {
      const existingArea = self.existingArea();
      const value = existingArea?.results?.find(r => r.type === self.type)?.["value"]?.[self.valueType];
      const valSource = value?.source;
      const valTarget = value?.target;
      const resolvedSource  = parseValue(self.src, self.store.task.dataObj);
      const resolvedTarget  = parseValue(self.tgt, self.store.task.dataObj);

      self.stickySource = self.src === resolvedSource;
      self.stickyTarget = self.tgt === resolvedTarget;
      self.source = self.src ? resolvedSource : valSource;
      self.target = self.tgt ? resolvedTarget : valTarget;
      self.source = self.source?.toUpperCase();
      self.target = self.target?.toUpperCase();
      self.sourceName = LANGUAGES[self.source?.toUpperCase()];
      self.targetName = LANGUAGES[self.target?.toUpperCase()];
    },

    beforeSend() {
      self.updateResult();
    },

  }));

const LanguagePairModel = types.compose("LanguagePairModel", TagAttrs, AnnotationMixin, Model);

const HtxLanguagePairView = ({ item }) => {
  const [srcFilter, setSrcFilter] = useState("");
  const [tgtFilter, setTgtFilter] = useState("");

  useEffect(() => {
    item.afterCreate();
  }, [item.annotation?.results]);

  return (
    <Block
      name="language-pair"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      <Select
        variant="rounded"
        value={item.source}
        onChange={v => item.setSource(v)}
      >
        {
          item.stickySource
            ? <Select.Option value={item.source}>{LANGUAGES[item.source]}</Select.Option>
            : (
              <>
                <Input
                  style={{ borderLeft: 0, borderRight: 0, borderTop: 0, borderRadius: 0 }}
                  placeholder="Find language"
                  value={srcFilter}
                  onChange={e => setSrcFilter(e.target.value)}
                />
                {Object.keys(LANGUAGES).map(lc => {
                  if (srcFilter.trim().length > 0 && !LANGUAGES[lc].toLowerCase().includes(srcFilter.trim().toLowerCase())) {
                    return null;
                  }

                  return <Select.Option key={"source-" + lc} value={lc.toUpperCase()}>{LANGUAGES[lc]}</Select.Option>;
                })}
              </>
            )
        }
      </Select>
      <Select
        variant="rounded"
        value={item.target}
        onChange={v => item.setTarget(v)}
      >
        {
          item.stickyTarget
            ? <Select.Option value={item.target}>{LANGUAGES[item.target]}</Select.Option>
            : (
              <>
                <Input
                  style={{ borderLeft: 0, borderRight: 0, borderTop: 0, borderRadius: 0 }}
                  placeholder="Find language"
                  value={tgtFilter}
                  onChange={e => setTgtFilter(e.target.value)}
                />
                {Object.keys(LANGUAGES).map(lc => {
                  if (tgtFilter.trim().length > 0 && !LANGUAGES[lc].toLowerCase().includes(tgtFilter.trim().toLowerCase())) {
                    return null;
                  }

                  return <Select.Option key={"source-" + lc} value={lc.toUpperCase()}>{LANGUAGES[lc]}</Select.Option>;
                })}
              </>
            )
        }
      </Select>
    </Block>
  );
};

const HtxLanguagePair = inject("store")(observer(HtxLanguagePairView));

Registry.addTag("languagepair", LanguagePairModel, HtxLanguagePair);
Registry.addObjectType(LanguagePairModel);

export { LanguagePairModel, HtxLanguagePair };
