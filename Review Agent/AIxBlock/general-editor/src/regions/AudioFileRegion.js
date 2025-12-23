import { toJS } from "mobx";
import { getRoot, types } from "mobx-state-tree";
import WithStatesMixin from "../mixins/WithStates";
import NormalizationMixin from "../mixins/Normalization";
import RegionsMixin from "../mixins/Regions";
import Registry from "../core/Registry";
import { AreaMixin } from "../mixins/AreaMixin";
import { EditableRegion } from "./EditableRegion";
import { AudioFileModel } from "../tags/object";
import { HighlightMixin } from "../mixins/HighlightMixin";

const Model = types
  .model({
    type: "audiofile",
    object: types.late(() => types.reference(AudioFileModel)),
    from_name: types.late(() => types.reference(AudioFileModel)),
  })
  .volatile(() => ({
  }))
  .views((self) => ({
    get annotation() {
      return getRoot(self).annotationStore?.selected;
    },
  }))
  .actions((self) => ({

    serialize() {
      return {
        id: self.id,
        from_name: self.from_name.name,
        to_name: self.from_name.name,
        type: self.type,
        value: toJS(self.value),
      };
    },

  }));

const AudioFileRegionModel = types.compose(
  "AudioFileRegionModel",
  WithStatesMixin,
  RegionsMixin,
  AreaMixin,
  NormalizationMixin,
  EditableRegion,
  Model,
  HighlightMixin,
);

Registry.addRegionType(
  AudioFileRegionModel,
  "audiofile",
  value => {
    return "audiofile" in value?.value && typeof value?.value["audiofile"] === "object";
  },
);

export { AudioFileRegionModel };
