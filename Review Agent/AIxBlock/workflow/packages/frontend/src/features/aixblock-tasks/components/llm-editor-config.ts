export const llmEditorConfig: { [k: string]: string } = {
  asr: `
    <View>
      <LanguagePair name="language" />
      <Audio name="audio" value="$audio" zoom="true" hotkey="ctrl+enter" />
      <View style="margin-top:16px">
        <Header value="Provide Transcription" />
        <TextArea name="transcription" toName="audio" rows="4" editable="true" maxSubmissions="1" />
      </View>
    </View>
  `,
  'asr-segments': `
    <View>
      <View className="lsf-sticky">
        <Labels name="labels" toName="audio">
          <Label value="Speech" />
          <Label value="Noise" />
        </Labels>
        <AudioPlus name="audio" value="$audio"/>
      </View>
      <View style="margin-top: 2em;">
        <Transcription name="transcription" toName="audio" />
      </View>
    </View>
  `,
  ner: `
    <View>
      <View className="lsf-sticky">
        <Labels name="label" toName="text">
          <Label value="PER" background="red"/>
          <Label value="ORG" background="darkorange"/>
          <Label value="LOC" background="orange"/>
          <Label value="MISC" background="green"/>
        </Labels>
      </View>
      <Text name="text" value="$text"/>
    </View>
  `,
};
