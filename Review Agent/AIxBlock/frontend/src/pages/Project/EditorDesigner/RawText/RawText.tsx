import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import {BlockToolData} from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import {createBlock, withName} from "../renderer";
import { RawTextPreview } from "./Preview";

type TConfig = {
}

type TData = {
  name: string,
  dataKey: string,
}

const HTML = RawTextPreview;

export default class RawTextBlock {
  data: TData = {
    name: "",
    dataKey: "",
  }

  element: HTMLElement;

  constructor({data}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "text",
      dataKey: data.dataKey ?? "$text",
    };

    this.element = createBlock("block-raw-text");
  }

  static get toolbox() {
    return {
      title: "Raw Text",
      icon: icons.rawText,
    };
  }

  render() {
    this.element.innerHTML = withName(this.data.name, HTML);
    return this.element;
  }

  save(): BlockToolData<TData> {
    return this.data;
  }
}
