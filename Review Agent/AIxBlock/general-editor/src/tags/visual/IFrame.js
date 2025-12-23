import React from "react";
import { getRoot, types } from "mobx-state-tree";
import { observer } from "mobx-react";
import Registry from "../../core/Registry";
import Tree from "../../core/Tree";

const Model = types.model({
  type: "iframe",
  style: types.maybeNull(types.string),
  src: types.optional(types.string, ""),
  _src: types.optional(types.string, ""),
})
  .actions((self) => ({

    afterCreate() {
      console.log(self.src);
      if (!self.src.startsWith("$") || self.src.length === 0) {
        self._src = self.src;
        return;
      }

      const dataKey = self.src.substr(1);

      try {
        const d = JSON.parse(getRoot(self).task?.data);

        if (dataKey in d && typeof d[dataKey] === "string") {
          self._src = d[dataKey];
        }
      } catch (e) {
        console.error(e);
      }
    },

  }));

const IFrameModel = types.compose("IFrame", Model);

const HtxIFrame = observer(({ item }) => {
  const style = item.style ? Tree.cssConverter(item.style) : {};

  return (
    <iframe src={item._src} style={style} />
  );
});

Registry.addTag("iframe", IFrameModel, HtxIFrame);

export { HtxIFrame, IFrameModel };
