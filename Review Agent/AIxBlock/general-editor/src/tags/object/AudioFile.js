import { inject, observer } from "mobx-react";
import { getRoot, types } from "mobx-state-tree";
import React, { useEffect } from "react";
import Registry from "../../core/Registry";
import { AnnotationMixin } from "../../mixins/AnnotationMixin";
import { SimplePlayer } from "./Audio/SimplePlayer";

const TagAttrs = types.model({
  name: types.identifier,
});

const Model = types
  .model("AudioFileRegionModel", {
    type: "audiofile",
    resultType: "audiofile",
    valueType: "audiofile",
    _type: types.optional(types.enumeration(["url"]), "url"),
    _data: types.optional(types.string, ""),
  })
  .views(self => ({

    get store() {
      return getRoot(self);
    },

  }))
  .actions((self) => ({

    getExistingArea() {
      let area = null;

      self.annotation?.areas?.forEach((a) => {
        if (a.object.type !== self.type) return;
        area = a;
      });

      return area;
    },

    afterCreate() {
      const existingArea = self.getExistingArea();

      if (existingArea) {
        const value = existingArea.results?.[0]?.["value"]?.[self.valueType];

        self._type = value?.["type"];
        self._data = value?.["data"];
      }
    },

  }));

const AudioFileModel = types.compose("AudioFileModel", TagAttrs, AnnotationMixin, Model);

const AudioFileView = ({ item }) => {
  const { _type, _data, annotation } = item;

  useEffect(() => {
    item.afterCreate();
  }, [annotation?.areas, annotation?.results, annotation?.regionStore?.regions]);

  if (!_type || !_data) {
    return "(no audio)";
  }

  return (
    <SimplePlayer url={_data} />
  );
};

const HtxAudioFile = inject("store")(observer(AudioFileView));

Registry.addTag("audiofile", AudioFileModel, HtxAudioFile);
Registry.addObjectType(AudioFileModel);

export { AudioFileModel, HtxAudioFile };