import React, { useCallback, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { cast, getEnv, getParent, getRoot, types } from "mobx-state-tree";

import InfoModal from "../../../components/Infomodal/Infomodal";
import LabelMixin from "../../../mixins/LabelMixin";
import Registry from "../../../core/Registry";
import SelectedModelMixin from "../../../mixins/SelectedModel";
import Tree from "../../../core/Tree";
import Types from "../../../core/Types";
import { guidGenerator } from "../../../core/Helpers";
import ControlBase from "../Base";
import "./Labels.styl";
import { Block } from "../../../utils/bem";
import { customTypes } from "../../../core/CustomTypes";
import { defaultStyle } from "../../../core/Constants";
import "../Label";
import DynamicChildrenMixin from "../../../mixins/DynamicChildrenMixin";
import { FF_DEV_2007_DEV_2008, isFF } from "../../../utils/feature-flags";
import CreateLabel from "./CreateLabel";
import { LabelModel } from "../Label";
import { toJS } from "mobx";

/**
 * The Labels tag provides a set of labels for labeling regions in tasks for machine learning and data science projects. Use the Labels tag to create a set of labels that can be assigned to identified region and specify the values of labels to assign to regions.
 *
 * All types of Labels can have dynamic value to load labels from task. This task data should contain a list of options to create underlying <Label>s. All the parameters from options will be transferred to corresponding tags.
 *
 * The Labels tag can be used with audio and text data types. Other data types have type-specific Labels tags.
 * @example
 * <!--Basic labeling configuration to apply labels to a passage of text -->
 * <View>
 *   <Labels name="type" toName="txt-1">
 *     <Label alias="B" value="Brand" />
 *     <Label alias="P" value="Product" />
 *   </Labels>
 *   <Text name="txt-1" value="$text" />
 * </View>
 *
 * @example <caption>This part of config with dynamic labels</caption>
 * <Labels name="product" toName="shelf" value="$brands" />
 * <!-- {
 *   "data": {
 *     "brands": [
 *       { "value": "Big brand" },
 *       { "value": "Another brand", "background": "orange" },
 *       { "value": "Local brand" },
 *       { "value": "Green brand", "alias": "Eco", showalias: true }
 *     ]
 *   }
 * } -->
 * @example <caption>is equivalent to this config</caption>
 * <Labels name="product" toName="shelf">
 *   <Label value="Big brand" />
 *   <Label value="Another brand" background="orange" />
 *   <Label value="Local brand" />
 *   <Label value="Green brand" alias="Eco" showAlias="true" />
 * </Labels>
 * @name Labels
 * @meta_title Labels Tag for Labeling Regions
 * @meta_description Customize Label Studio by using the Labels tag to provide a set of labels for labeling regions in tasks for machine learning and data science projects.
 * @param {string} name                      - Name of the element
 * @param {string} toName                    - Name of the element that you want to label
 * @param {single|multiple=} [choice=single] - Configure whether you can select one or multiple labels for a region
 * @param {number} [maxUsages]               - Maximum number of times a label can be used per task
 * @param {boolean} [showInline=true]        - Whether to show labels in the same visual line
 * @param {float=} [opacity=0.6]             - Opacity of rectangle highlighting the label
 * @param {string=} [fillColor]              - Rectangle fill color in hexadecimal
 * @param {string=} [strokeColor=#f48a42]    - Stroke color in hexadecimal
 * @param {number=} [strokeWidth=1]          - Width of the stroke
 * @param {string} [value]                   - Task data field containing a list of dynamically loaded labels (see example below)
 */
const TagAttrs = types.model({
  name: types.identifier,
  toname: types.maybeNull(types.string),

  choice: types.optional(types.enumeration(["single", "multiple"]), "single"),
  maxusages: types.maybeNull(types.string),
  showinline: types.optional(types.boolean, true),

  // TODO this will move away from here
  groupdepth: types.maybeNull(types.string),

  opacity: types.optional(customTypes.range(), "0.2"),
  fillcolor: types.optional(customTypes.color, "#f48a42"),

  strokewidth: types.optional(types.string, "1"),
  strokecolor: types.optional(customTypes.color, "#f48a42"),
  fillopacity: types.maybeNull(customTypes.range()),
  allowempty: types.optional(types.boolean, false),

  ...(isFF(FF_DEV_2007_DEV_2008) ? { value: types.optional(types.string, "") } : {}),
});

/**
 * @param {boolean} showinline
 * @param {identifier} id
 * @param {string} pid
 */
const ModelAttrs = types.model({
  pid: types.optional(types.string, guidGenerator),
  type: "labels",
  children: Types.unionArray(["label", "header", "view", "text", "hypertext", "richtext"]),

  visible: types.optional(types.boolean, true),
});

const Model = LabelMixin.views(self => ({
  get shouldBeUnselected() {
    return self.choice === "single";
  },
  get defaultChildType() {
    return "label";
  },
})).actions(self => ({
  afterCreate() {
    if (self.allowempty) {
      let empty = self.findLabel(null);

      if (!empty) {
        const emptyParams = {
          value: null,
          type: "label",
          background: defaultStyle.fillcolor,
        };

        if (self.children) {
          self.children.unshift(emptyParams);
        } else {
          self.children = cast([emptyParams]);
        }
        empty = self.children[0];
      }
      empty.setEmpty();
    }
  },
  validate() {
    const regions = self.annotation.regionStore.regions;

    for (const r of regions) {
      for (const s of r.states) {
        if (s.name === self.name) {
          return true;
        }
      }
    }

    InfoModal.warning(self.requiredmessage || `Labels "${self.name}" were not used.`);
    return false;
  },
  addLabel(label, triggerEvent = true) {
    let found = false;
    let _label = null;
    let _bg = null;

    if (typeof label === "string") {
      _label = label;
    } else if (typeof label === "object") {
      if ("label" in label) {
        _label = label.label;
      }

      if ("color" in label) {
        _bg = label.color;
      }
    }

    if (!_label) {
      return;
    }

    if (!self.children) {
      self.children = [];
    }

    self.children.forEach(c => {
      if (typeof c.value !== "string") {
        return;
      }

      if (c.value.toLowerCase() === _label.toLowerCase()) {
        found = true;
      }
    });

    if (!found) {
      self.children.unshift({
        type: "label",
        value: _label,
        _value: _label,
        ...(_bg ? { background: _bg } : {}),
      });

      if (triggerEvent) {
        getEnv(self).events.invoke('labelCreated', self.type, self.name, _label);
      }
    }
  },
  deleteLabel(label, triggerEvent = true) {
    self.children = toJS(self.children).filter(item => item.value !== label);

    if (triggerEvent) {
      getEnv(self).events.invoke('labelDeleted', self.type, self.name, label);
    }
  },
}));

const LabelsModel = types.compose(
  "LabelsModel",
  ModelAttrs,
  TagAttrs,
  ...(isFF(FF_DEV_2007_DEV_2008) ? [DynamicChildrenMixin] : []),
  Model,
  SelectedModelMixin.props({ _child: "LabelModel" }),
  ControlBase,
);

const HtxLabels = observer(({ item }) => {
  const labelsRef = useRef();
  const changeKeywordTimeout = useRef();
  const [keyword, setKeyword] = useState("");

  const onKeywordChange = useCallback(v => {
    clearTimeout(changeKeywordTimeout.current);

    changeKeywordTimeout.current = setTimeout(() => {
      setKeyword(v);
    }, 250);
  }, []);

  useEffect(() => {
    if (!labelsRef.current) {
      return;
    }

    if (labelsRef.current.clientHeight > 120) {
      labelsRef.current.style.height = "120px";
    }

    function externalLabelsAdded(labels) {
      labels.forEach(l => {
        if (l?.type.toLowerCase() !== item.type || l?.name !== item.name) {
          return;
        }

        item.addLabel(l.label, false);
      });
    }

    function externalLabelDeleted(data) {
      if (data?.type?.toLowerCase() !== item.type || data?.name !== item.name) {
        return;
      }

      item.deleteLabel(data?.label, false);
    }

    const events = getEnv(item).events;

    events.on("externalLabelsAdded", externalLabelsAdded);
    events.on("externalLabelDeleted", externalLabelDeleted);

    return () => {
      events.off("externalLabelsAdded", externalLabelsAdded);
      events.off("externalLabelDeleted", externalLabelDeleted);
      clearTimeout(changeKeywordTimeout.current);
    };
  }, []);

  return (
    <Block name="labels" mod={{ hidden: !item.visible, inline: item.showinline }} ref={labelsRef}>
      <CreateLabel controlStore={item} isQuick={true} onChange={onKeywordChange} />
      {Tree.renderChildren(item, keyword)}
    </Block>
  );
});

Registry.addTag("labels", LabelsModel, HtxLabels);

export { HtxLabels, LabelsModel };
