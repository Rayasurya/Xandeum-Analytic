import { types } from "mobx-state-tree";
import Registry from "../../core/Registry";

const TagAttrs = types.model({
  key: types.string,
  description: types.optional(types.string, ""),
  children: types.undefined,
});

const DefaultValueModel = types.model({
  value: types.string,
});

const AIConfigBooleanModel = types.compose(
  "AIConfigBooleanModel",
  TagAttrs,
  types.model({
    value: types.boolean,
  }),
);

const AIConfigFixedNumberModel = types.compose(
  "AIConfigFixedNumberModel",
  TagAttrs,
  DefaultValueModel,
);

const AIConfigFixedStringModel = types.compose(
  "AIConfigFixedStringModel",
  TagAttrs,
  DefaultValueModel,
);

const AIConfigNumberModel = types.compose(
  "AIConfigNumberModel",
  TagAttrs,
  DefaultValueModel,
);

const AIConfigRangeModel = types.compose(
  "AIConfigRangeModel",
  TagAttrs,
  DefaultValueModel,
  types.model({
    min: types.string,
    max: types.string,
    step: types.string,
  }),
);

const AIConfigStringModel = types.compose(
  "AIConfigStringModel",
  TagAttrs,
  DefaultValueModel,
  types.model({
    multiline: types.maybeNull(types.boolean),
  }),
);

const HtxView = () => null;

Registry.addTag("AIConfigBoolean".toLowerCase(), AIConfigBooleanModel, HtxView);
Registry.addTag("AIConfigFixedNumber".toLowerCase(), AIConfigFixedNumberModel, HtxView);
Registry.addTag("AIConfigFixedString".toLowerCase(), AIConfigFixedStringModel, HtxView);
Registry.addTag("AIConfigNumber".toLowerCase(), AIConfigNumberModel, HtxView);
Registry.addTag("AIConfigRange".toLowerCase(), AIConfigRangeModel, HtxView);
Registry.addTag("AIConfigString".toLowerCase(), AIConfigStringModel, HtxView);

export {
  AIConfigBooleanModel,
  AIConfigFixedNumberModel,
  AIConfigFixedStringModel,
  AIConfigNumberModel,
  AIConfigRangeModel,
  AIConfigStringModel
};
