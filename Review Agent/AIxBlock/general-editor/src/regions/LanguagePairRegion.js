import { getRoot, types } from "mobx-state-tree";
import WithStatesMixin from "../mixins/WithStates";
import NormalizationMixin from "../mixins/Normalization";
import RegionsMixin from "../mixins/Regions";
import Registry from "../core/Registry";
import { AreaMixin } from "../mixins/AreaMixin";
import { EditableRegion } from "./EditableRegion";
import { LanguagePairModel } from "../tags/object";
import { HighlightMixin } from "../mixins/HighlightMixin";
import { toJS } from "mobx";

const Model = types
  .model({
    type: "languagepair",
    object: types.late(() => types.reference(LanguagePairModel)),
    from_name: types.late(() => types.reference(LanguagePairModel)),
    to_name: types.late(() => types.reference(LanguagePairModel)),
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
        to_name: self.to_name.name,
        type: self.type,
        value: toJS(self.value),
      };
    },

  }));

const LanguagePairRegionModel = types.compose(
  "LanguagePairRegionModel",
  WithStatesMixin,
  RegionsMixin,
  AreaMixin,
  NormalizationMixin,
  EditableRegion,
  Model,
  HighlightMixin,
);

Registry.addRegionType(
  LanguagePairRegionModel,
  "languagepair",
  value => {
    return "languagepair" in value?.value && typeof value?.value["languagepair"] === "object";
  },
);

export { LanguagePairRegionModel };
