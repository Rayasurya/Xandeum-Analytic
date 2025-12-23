import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import {BlockToolData} from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import {createBlock, withName} from "../renderer";

type TConfig = {
}

type TData = {
  name: string,
  toName: string,
}

const HTML = `
<div>
  Please create at least one region to begin transcript.
</div>
`

export default class AudioSegmentTranscriptBlock {
  data: TData = {
    name: "",
    toName: "",
  }

  element: HTMLElement;

  constructor({data}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "audioSegmentTranscript",
      toName: data.toName ?? "audio",
    };

    this.element = createBlock("block-audio-segment-transcript");
  }

  static get toolbox() {
    return {
      title: "Audio Segment Transcript",
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
