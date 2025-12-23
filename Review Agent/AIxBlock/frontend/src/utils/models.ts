const PREDICT_MAPS: {
  [k: string]: { task: string, model: string },
} = {
  "Named Entity Recognition": {
    task: "ner",
    model: "kaiku03/bert-base-NER-finetuned_custom_complain_dataset_NER9",
  },
  "Question Answering": {
    task: "question-answering",
    model: "deepset/roberta-base-squad2",
  },
  "Machine Translation": {
    task: "translation",
    model: "google-t5/t5-small",
  },
  "Text Summarization": {
    task: "summarization",
    model: "QQhahaha/Summarization",
  },
  "Text Classification": {
    task: "text-classification",
    model: "distilbert-base-uncased",
  },
  "Text to speech": {
    task: "text-to-speech-translation",
    model: "nikolab/speecht5_tts_hr",
  },
  "Automatic Speech Recognition": {
    task: "automatic-speech-recognition",
    model: "ivrit-ai/faster-whisper-v2-d4",
  },
  "Text-to-Text Translation": {
    task: "translation",
    model: "google-t5/t5-small",
  },
  "Speech-to-Text Translation": {
    task: "speech-to-text-translation",
    model: "signon-project/text-to-text-translator",
  },
  "Speech-to-Speech Translation": {
    task: "speech-to-speech-translation",
    model: "facebook/unit_hifigan_mhubert_vp_en_es_fr_it3_400k_layer11_km1000_lj_dur"
  },
  "Object Detection with Bounding Boxes": {
    task: "bounding-boxes-segmentation",
    model: "facebook/opt-125m"
  },
  "Semantic Segmentation with Polygons": {
    task: "polygon-segmentation",
    model: "facebook/opt-125m"
  },
  "Video Object Tracking": {
    task: "video-object-tracking",
    model: "facebook/opt-125m"
  },
  "Text-to-Text Generation - Chatbot": {
    task: "chatbot",
    model: "facebook/opt-125m"
  },
  "Text-to-Image Generation": {
    task: "text-to-image",
    model: "black-forest-labs/FLUX.1-dev"
  },
}

export const getPredictModel = (configTitle: string) => {
  return configTitle in PREDICT_MAPS ? PREDICT_MAPS[configTitle]["model"] : "(no-task)";
}

export const getPredictTask = (configTitle: string) => {
  return configTitle in PREDICT_MAPS ? PREDICT_MAPS[configTitle]["task"] : "(no-task)";
}
