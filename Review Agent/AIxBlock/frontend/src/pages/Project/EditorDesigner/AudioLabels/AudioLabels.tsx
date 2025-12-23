import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import {BlockToolData} from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import {createBlock, createFieldText, withName} from "../renderer";
import { labelPreview } from "./Preview";

type TConfig = {
}

type TData = {
  name: string,
  toName: string,
  content: string,
}

const HTML = labelPreview;

export default class AudioLabelsBlock {
  data: TData = {
    name: "",
    toName: "",
    content: `<Label value="default" />`,
  }

  element: HTMLElement;

  constructor({data, block}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "audioLabels",
      toName: data.toName ?? "audio",
      content: data.content ?? `<Label value="default" />`,
    };

    const autoRender = (cb: Function) => {
      return (...args: any[]) => {
        cb(...args);
        this.render();
      }
    }

    this.element = createBlock("block-audio-labels", block ? {
      renderProperties: (ele) => {
        createFieldText(ele, this.data.name, autoRender((v: string) => this.data.name = v), "Name");
      },
    } : undefined);
  }

  static get toolbox() {
    return {
      title: "Audio Labels",
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
