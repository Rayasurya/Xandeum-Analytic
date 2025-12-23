import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import {BlockToolData} from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import {createBlock, withName} from "../renderer";
import { ratingPreview } from "../AudioRating/Preview";

type TConfig = {
}

type TData = {
  name: string,
  toName: string,
}

const HTML = ratingPreview;

export default class TextRatingBlock {
  data: TData = {
    name: "",
    toName: "",
  }

  element: HTMLElement;

  constructor({data}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "textRating",
      toName: data.toName ?? "text",
    };

    this.element = createBlock("block-text-rating");
  }

  static get toolbox() {
    return {
      title: "Text Rating",
      icon: icons.rating,
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
