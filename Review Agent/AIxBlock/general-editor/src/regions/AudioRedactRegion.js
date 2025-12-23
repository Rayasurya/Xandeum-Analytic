import { types } from "mobx-state-tree";
import { AnnotationMixin } from "../mixins/AnnotationMixin";
// import { HighlightMixin } from "../mixins/HighlightMixin";
// import NormalizationMixin from "../mixins/Normalization";
import RegionsMixin from "../mixins/Regions";
import Registry from "../core/Registry";
import { AreaMixin } from "../mixins/AreaMixin";
import WithStatesMixin from "../mixins/WithStates";
import { toJS } from "mobx";
import { AudioModel } from "../tags/object";
// import { EditableRegion } from "./EditableRegion";

const Model = types
  .model({
    type: "audioredact",
    object: types.late(() => types.reference(AudioModel)),
    // from_name: types.string,
    // to_name: types.string,
    isHighlight: types.optional(types.boolean, false),
    isSelected: types.optional(types.boolean, false),
  })
  .actions((self) => ({

    /**
     * @param {import("wavesurfer.js/src/plugin/regions").Region} wsReg
     */
    attachWsRegion(wsReg) {
      self.wsReg = wsReg;
      wsReg._redactRegion = self;
      // wsReg.unAll();

      wsReg.on("over", () => {
        self.setHighlight(true);
      });

      wsReg.on("leave", () => {
        self.setHighlight(false);
      });

      wsReg.on("click", () => {
        if (wsReg.wavesurfer.isPlaying()) {
          return;
        }

        self.annotation?.regionStore.isSelected(self)
          ? self.annotation?.regionStore.unselectAll()
          : self.annotation?.regionStore.selectRegionsByIds(self.id);
      });
    },

    afterCreate() {
      // console.log("After created");
    },

    beforeDestroy() {
      self.wsReg?.remove();
    },

    getOneColor() {
      return "#666";
    },

    serialize() {
      return {
        id: self.id,
        from_name: self.from_name,
        to_name: self.to_name,
        type: self.type,
        value: toJS(self.value),
      };
    },

    selectRegion() {
      self.isSelected = true;
      self._applyWsRegStyle();
    },

    afterUnselectRegion() {
      self.isSelected = false;
      self._applyWsRegStyle();
    },

    setHighlight(val) {
      self.isHighlight = val;
      self._applyWsRegStyle();
    },

    _applyWsRegStyle() {
      if (!self.wsReg) return;

      if (self.isHighlight || self.isSelected) {
        self.wsReg.element.style.opacity = 1;
        self.wsReg.element.style.zIndex = 5;
      } else {
        self.wsReg.element.style.opacity = 0.5;
        self.wsReg.element.style.zIndex = 3;
      }
    },

  }));

const AudioRedactRegionModel = types.compose(
  "AudioRedactRegionModel",
  WithStatesMixin,
  RegionsMixin,
  AreaMixin,
  AnnotationMixin,
  // NormalizationMixin,
  // EditableRegion,
  Model,
  // HighlightMixin,
);

Registry.addRegionType(
  AudioRedactRegionModel,
  "audio",
  value => {
    return "audioredact" in value?.value && typeof value?.value["audioredact"] === "object";
  },
);



export { AudioRedactRegionModel };
