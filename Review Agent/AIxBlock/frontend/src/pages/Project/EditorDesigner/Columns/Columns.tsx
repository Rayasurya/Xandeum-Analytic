import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import {BlockToolData} from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import {createBlock} from "../renderer";
import EditorJS, {OutputData} from "@editorjs/editorjs";
import AudioBlock from "../Audio/Audio";
import AudioLabelsBlock from "../AudioLabels/AudioLabels";
import RawTextBlock from "../RawText/RawText";
import TextLabelsBlock from "../TextLabels/TextLabels";
// @ts-ignore
// import DragDrop from "editorjs-drag-drop";
import {randomString} from "@/utils/random";
import AudioRatingBlock from "../AudioRating/AudioRating";
import TextRatingBlock from "../TextRating/TextRating";
import TextSummaryBlock from "../TextSummary/TextSummary";
import AudioTranscriptBlock from "../AudioTranscript/AudioTranscript";
import AudioSegmentTranscriptBlock from "../AudioSegmentTranscript/AudioSegmentTranscript";
import TranscriptsQuestionsBlock from "../TranscriptsQuestions/TranscriptsQuestions";
import TranscriptsLabelsBlock from "../TranscriptsLabels/TranscriptsLabels";

type TConfig = {
}

type TData = {
  columns: OutputData[],
}

export default class ColumnsBlock {
  data: TData = {
    columns: [],
  }

  element: HTMLElement;
  eleColumns: HTMLElement[] = [];
  editors: EditorJS[] = [];

  constructor({data}: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      columns: data.columns ?? [{blocks: []}, {blocks: []}],
    };

    this.element = createBlock("block-columns");
  }

  static get toolbox() {
    return {
      title: "Columns",
      icon: icons.columns,
    };
  }

  render() {
    this.editors.forEach(e => e.destroy());
    this.eleColumns.forEach(e => e.remove());

    this.data.columns.forEach((c, idx) => {
      const eleId = "_" + randomString();
      this.eleColumns.push(document.createElement("DIV"));
      this.eleColumns[idx].id = eleId;
      this.eleColumns[idx].classList.add("block-columns__column");
      this.element.append(this.eleColumns[idx]);

      const editor = new EditorJS({
        placeholder: "Add your data type and labels here",
        holder: eleId,
        inlineToolbar: false,
        minHeight: 0,
        data: c,
        tools: {
          audio: AudioBlock,
          audioLabels: AudioLabelsBlock,
          audioRating: AudioRatingBlock,
          audioSegmentTranscript: AudioSegmentTranscriptBlock,
          audioTranscript: AudioTranscriptBlock,
          rawText: RawTextBlock,
          textLabels: TextLabelsBlock,
          textRating: TextRatingBlock,
          textSummary: TextSummaryBlock,
          transcriptsLabels: TranscriptsLabelsBlock,
          transcriptsQuestions: TranscriptsQuestionsBlock,
        },
        // onReady: () => {
        //   // Not working in nested mode
        //   // new DragDrop(this.editors[idx]);
        // },
        // onChange: async (api: API) => {
        //   this.data.columns[idx] = await this.editors[idx].save();
        // },
      });

      this.editors.push(editor);
    });

    return this.element;
  }

  async save(): Promise<BlockToolData<TData>> {
    for (let i = 0; i < this.data.columns.length; i++) {
      this.data.columns[i] = await this.editors[i].save();
    }

    return this.data;
  }
}
