import { types } from "mobx-state-tree";
import Registry from "../../core/Registry";
import Types from "../../core/Types";

const TagAttrs = types.model({});

const Model = types
  .model({
    source: types.maybeNull(types.string),
    target: types.maybeNull(types.string),
    task: types.string,
    children: Types.unionArray([
      "AIConfigBoolean".toLowerCase(),
      "AIConfigFixedNumber".toLowerCase(),
      "AIConfigFixedString".toLowerCase(),
      "AIConfigNumber".toLowerCase(),
      "AIConfigRange".toLowerCase(),
      "AIConfigString".toLowerCase(),
    ]),
  });

const AIConfigModel = types.compose("AIConfigModel", TagAttrs, Model);

const HtxView = () => {
  return null;
};

Registry.addTag("AIConfig".toLowerCase(), AIConfigModel, HtxView);

export { AIConfigModel };
