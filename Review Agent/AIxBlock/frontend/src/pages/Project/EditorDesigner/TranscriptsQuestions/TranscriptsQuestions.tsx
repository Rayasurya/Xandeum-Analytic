import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import {BlockToolData} from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import {createBlock, withName} from "../renderer";
import { transcriptsQuestionsPreview } from "./Preview";

type TConfig = {
}

type TData = {
  name: string,
  toName: string,
  dataKey: string,
}

const HTML = transcriptsQuestionsPreview;

export default class TranscriptsQuestionsBlock {
  data: TData = {
    name: "",
    toName: "",
    dataKey: "",
  }

  element: HTMLElement;

  constructor({data}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "questions",
      toName: data.toName ?? "transcripts",
      dataKey: data.dataKey ?? "$transcripts",
    };

    this.element = createBlock("block-transcripts-questions");
  }

  static get toolbox() {
    return {
      title: "Transcripts Questions",
      icon: icons.questions,
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
