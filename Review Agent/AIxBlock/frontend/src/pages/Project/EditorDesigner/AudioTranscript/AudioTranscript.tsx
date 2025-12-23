import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import {BlockToolData} from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import {createBlock, withName} from "../renderer";
import { transcriptPreview } from "../TextSummary/Preview";

type TConfig = {
}

type TData = {
  name: string,
  toName: string,
}

const HTML = transcriptPreview;

export default class AudioTranscriptBlock {
  data: TData = {
    name: "",
    toName: "",
  }

  element: HTMLElement;

  constructor({data}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "audioTranscript",
      toName: data.toName ?? "audio",
    };

    this.element = createBlock("block-audio-transcript");
  }

  static get toolbox() {
    return {
      title: "Audio Transcript",
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
