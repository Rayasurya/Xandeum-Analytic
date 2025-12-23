import { inject, observer } from "mobx-react";
import { types } from "mobx-state-tree";
import Registry from "../../core/Registry";
import { AnnotationMixin } from "../../mixins/AnnotationMixin";

const RedactorModel = types.compose(
  "RedactorModel",
  AnnotationMixin,
  types.model({
    name: types.identifier,
    type: "audioredact",
    toname: types.maybeNull(types.string),
    pii: types.maybeNull(types.string),
    valueType: "audioredact",
    resultType: "audioredact",
    classification: false,
    holdsState: true,
    wsReg: types.maybeNull(types.model({
      id: types.string,
      start: types.number,
      end: types.number,
    })),
  }),
)
  .views(self => ({

    get piiList() {
      return (self.pii ?? "").split(",").map(e => e.trim());
    },

  }))
  .actions((self) => ({

    addEntity(entity) {
      if (self.pii) {
        self.pii = entity + "," + self.pii;
      } else {
        self.pii = entity;
      }
    },

    deleteEntity(entity) {
      let tmp = "," + (self.pii ?? "") + ",";

      tmp = tmp.replaceAll("," + entity + ",", ",");
      self.pii = tmp.substring(1, tmp.length - 1);
    },

    /**
     * @param {import("wavesurfer.js/src/plugin/regions").RegionParams} wsReg
     */
    formatRedactReg(wsReg) {
      wsReg.color = "rgb(255, 255, 255)";
      wsReg.element.style.zIndex = "3";
      wsReg.element.style.color = "#F00";
      wsReg.element.style.backgroundImage = "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)";
      wsReg.element.style.backgroundSize = "6px 6px";
      wsReg.element.style.opacity = 0.5;
    },

    setWsReg(wsReg) {
      self.wsReg = wsReg;
    },

    /**
     * @param {import("wavesurfer.js/src/wavesurfer").WaveSurfer} ws
     * @param {import("wavesurfer.js/src/plugin/regions").RegionParams} wsReg
     */
    addRedactReg(ws, wsReg) {
      self.formatRedactReg(wsReg);

      wsReg.on("update-end", () => {
        self.setWsReg({
          id: wsReg.id,
          start: wsReg.start,
          end: wsReg.end,
        });

        const existingArea = Array.from(self.annotation?.areas?.values() ?? []).find(r => {
          return r.id === wsReg.id;
        });

        if (existingArea) {
          existingArea.setValue(self);
        } else {
          self.annotation?.createResult({
            id: wsReg.id,
            type: self.valueType,
          }, {
            [self.resultType]: {
              start: wsReg.start,
              end: wsReg.end,
            },
          }, self, self.toname);

          self.annotation?.regionStore.findRegionID(wsReg.id)?.attachWsRegion(wsReg);
        }
      });
    },

    selectedValues() {
      return {
        start: self.wsReg?.start ?? 0,
        end: self.wsReg?.end ?? 0,
      };
    },

  }));

Registry.addTag("redactor", RedactorModel, inject("store")(observer(() => null)));
Registry.addObjectType(RedactorModel);

export { RedactorModel };
