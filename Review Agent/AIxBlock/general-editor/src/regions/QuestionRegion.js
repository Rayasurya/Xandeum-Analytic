import { getRoot, types } from "mobx-state-tree";
import WithStatesMixin from "../mixins/WithStates";
import NormalizationMixin from "../mixins/Normalization";
import RegionsMixin from "../mixins/Regions";
import Registry from "../core/Registry";
import { AreaMixin } from "../mixins/AreaMixin";
import { EditableRegion } from "./EditableRegion";
import { TranscriptsModel } from "../tags/object";
import { QuestionsModel } from "../tags/control";
import { HighlightMixin } from "../mixins/HighlightMixin";
import { toJS } from "mobx";

const Model = types
  .model({
    type: "question",
    object: types.late(() => types.reference(TranscriptsModel)),
    from_name: types.late(() => types.reference(QuestionsModel)),
  })
  .volatile(() => ({
  }))
  .views((self) => ({
    get parent() {
      return self.object;
    },

    get annotation() {
      return getRoot(self).annotationStore?.selected;
    },
  }))
  .actions((self) => ({

    serialize() {
      return {
        id: self.id,
        from_name: self.from_name.name,
        to_name: self.object.name,
        type: self.type,
        value: toJS(self.value),
      };
    },

  }));

const QuestionRegionModel = types.compose(
  "QuestionRegionModel",
  WithStatesMixin,
  RegionsMixin,
  AreaMixin,
  NormalizationMixin,
  EditableRegion,
  Model,
  HighlightMixin,
);

Registry.addRegionType(
  QuestionRegionModel,
  "transcripts",
  value => {
    return "question" in value?.value && typeof value?.value["question"] === "object";
  },
);

export { QuestionRegionModel };
