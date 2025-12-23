import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import {BlockToolData} from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import {createBlock, withName} from "../renderer";
import { labelPreview } from "../AudioLabels/Preview";

type TConfig = {
}

type TData = {
  name: string,
  toName: string,
  content: string,
}

const HTML = labelPreview;

export default class TextLabelsBlock {
  data: TData = {
    name: "",
    toName: "",
    content: `<Label value="default" />`,
  }

  element: HTMLElement;

  constructor({data}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "textLabels",
      toName: data.toName ?? "text",
      content: data.content ?? `<Label value="default" />`,
    };

    this.element = createBlock("block-text-labels");
  }

  static get toolbox() {
    return {
      title: "Text Labels",
      icon: icons.labels,
    };
  }

  render() {
    this.element.innerHTML = withName(this.data.name + " → " + this.data.toName, HTML);
    return this.element;
  }

  save(): BlockToolData<TData> {
    return this.data;
  }
}
