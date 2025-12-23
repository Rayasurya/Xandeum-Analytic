import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import {BlockToolData} from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import {createBlock, withName} from "../renderer";
import { ratingPreview } from "./Preview";

type TConfig = {
}

type TData = {
  name: string,
  toName: string,
}

const HTML = ratingPreview;

export default class AudioRatingBlock {
  data: TData = {
    name: "",
    toName: "",
  }

  element: HTMLElement;

  constructor({data}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "audioRating",
      toName: data.toName ?? "audio",
    };

    this.element = createBlock("block-audio-rating");
  }

  static get toolbox() {
    return {
      title: "Audio Rating",
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
