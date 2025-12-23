import {OutputData} from "@editorjs/editorjs";

export function toConfig(data: OutputData): string {
  let result = "";

  data.blocks.forEach(b => {
    if (b.type === "audio") {
      result += `<Audio name="${b.data.name}" value="${b.data.dataKey}" />`;
    } else if (b.type === "audioLabels") {
      result += `<Labels name="${b.data.name}" toName="${b.data.toName}">${b.data.content}</Labels>`;
    } else if (b.type === "rawText") {
      result += `<Text name="${b.data.name}" value="${b.data.dataKey}" />`;
    } else if (b.type === "textLabels") {
      result += `<Labels name="${b.data.name}" toName="${b.data.toName}">${b.data.content}</Labels>`;
    } else if (b.type === "paragraph") {
      result += `<Text name="${b.id}" value="${b.data.text.replaceAll("\n", "\\n").replaceAll('"', "”")}" />`;
    } else if (b.type === "columns" || b.type === "sticky") {
      if (b.type === "columns") {
        result += `<View style="display: flex; flex-direction: row; justify-content: stretch; gap: 16px;">`;

        (b.data.columns as OutputData[]).forEach((c, idx) => {
          if (idx > 0) {
            result += `<Splitter />`;
          }

          result += `<View style="flex: 1">`;
          result += toConfig(c);
          result += `</View>`;
        });
      } else {
        result += `<View className="lsf-sticky" style="padding: 1rem 0 0 0; margin-top: -1rem;">`;
        result += toConfig(b.data.columns[0]);
      }

      result += `</View>`;
    } else if (b.type === "textRating" || b.type === "audioRating") {
      result += `<Rating name="${b.data.name}" toName="${b.data.toName}" />`;
    } else if (b.type === "textSummary" || b.type === "audioTranscript") {
      result += `<TextArea name="${b.data.name}" toName="${b.data.toName}" editable="true" maxSubmissions="1" rows="5" transcription="true" showSubmitButton="false" />`;
    } else if (b.type === "audioSegmentTranscript") {
      result += `<Transcription name="${b.data.name}" toName="${b.data.toName}" />`;
    } else if (b.type === "transcriptsQuestions") {
      result += `<Transcripts name="${b.data.toName}" value="${b.data.dataKey}" transcriptStyle="height: 200px" /><Questions name="${b.data.name}" toName="${b.data.toName}" style="margin-top: 8px; height: 400px" />`;
    } else if (b.type === "transcriptsLabels") {
      result += `<Labels name="${b.data.name}" toName="${b.data.toName}" choice="multiple">${b.data.content}</Labels>`;
    }
  });

  return result;
}
