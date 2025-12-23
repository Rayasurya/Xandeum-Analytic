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

export default class TranscriptsLabelsBlock {
  data: TData = {
    name: "",
    toName: "",
    content: `<Label value="default" />`,
  }

  element: HTMLElement;

  constructor({data}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "transcriptsLabels",
      toName: data.toName ?? "transcripts",
      content: data.content ?? `<Label value="default" />`,
    };

    this.element = createBlock("block-transcripts-labels");
  }

  static get toolbox() {
    return {
      title: "Transcripts Labels",
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
