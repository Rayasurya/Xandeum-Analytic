import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import {BlockToolData} from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import {createBlock, withName} from "../renderer";
import { transcriptPreview } from "./Preview";

type TConfig = {
}

type TData = {
  name: string,
  toName: string,
}

const HTML = transcriptPreview;

export default class TextSummaryBlock {
  data: TData = {
    name: "",
    toName: "",
  }

  element: HTMLElement;

  constructor({data}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "textSummary",
      toName: data.toName ?? "text",
    };

    this.element = createBlock("block-text-summary");
  }

  static get toolbox() {
    return {
      title: "Text Summary",
      icon: icons.transcript,
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
