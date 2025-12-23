Predict
===

Model Requirements
---

- Predict API endpoint: `/action`
- Status API endpoint: `/`, response status 200 if the model is running and working properly.

Computer Vision
---

Request payload:
- Request method: `POST`
- `params/prompt`: the list of labels, comma-separated format
- `params/model_type`: `rectanglelabels`, `polygonlabels`
- `params/image`: JPEG format, base64-encoded without the prefix `data:image/jpeg:base64,`
- `project`: current project ID

Response payload:
- Response coordinate values are calculated in percent, from 0 - 100.
- `results/result`: array of regions detected by the AI model.

### Object Detection with Bounding Boxes

Request:

```json
{
    "command": "predict",
    "params": {
        "prompt": "Airplane,Car",
        "model_id": "facebook/opt-125m",
        "token_lenght": 50,
        "task": "text-generation",
        "model_type": "rectanglelabels",
        "text": null,
        "voice": null,
        "image": "/9j/4AAQSkZJRgAB...."
    },
    "project": "12"
}
```

Response:

```json
{
    "model_version": "1730691121",
    "results": {
        "message": "predict completed successfully",
        "result": [
            {
                "image_rotation": 0,
                "original_height": 180,
                "original_width": 171,
                "score": 0.6158017516136169,
                "type": "rectanglelabels",
                "value": {
                    "x": 0.1388888888888889,
                    "y": 0.14619883040935672,
                    "width": 0.7309941520467835,
                    "height": 0.1388888888888889,
                    "rectanglelabels": [
                        "Airplane."
                    ]
                }
            }
        ]
    }
}
```

### Semantic Segmentation with Polygons

Payload:

```json
{
    "command": "predict",
    "params": {
        "prompt": "Airplane,Car",
        "model_id": "facebook/opt-125m",
        "token_lenght": 50,
        "task": "text-generation",
        "model_type": "polygonlabels",
        "text": null,
        "voice": null,
        "image": "/9j/4AAQSkZJRgABAQAAA..."
    },
    "project": "19"
}
```

Response:

```json
{
    "model_version": "1730691121",
    "results": {
        "message": "predict completed successfully",
        "result": [
            {
                "image_rotation": 0,
                "original_height": 180,
                "original_width": 171,
                "score": 0.6158017516136169,
                "type": "polygonlabels",
                "value": {
                    "points": [
                        [
                            0.7309941520467835,
                            0.1388888888888889
                        ],
                        [
                            0.7309941520467835,
                            12.36111111111111
                        ],
                        [
                            0.14619883040935672,
                            12.916666666666668
                        ],
                        ...
                    ],
                    "polygonlabels": [
                        "Airplane."
                    ]
                }
            }
        ]
    }
}
```

### Video Object Tracking

Request:

```json
{
    "command": "predict",
    "params": {
        "prompt": "dog,cat,Man,Woman,Other",
        "model_id": "facebook/opt-125m",
        "token_lenght": 50,
        "task": "text-generation",
        "text": "",
        "video_url": "<URL of the video>",
        "video_frame": 1,
        "video_time": 0,
        "video_total_frame": 740,
        "max_gen_len": 1024,
        "temperature": 0.9,
        "top_p": 0.5,
        "seed": 0
    },
    "project": "15"
}
```

Response:

```json
{
    "model_version": "1730702396",
    "results": {
        "message": "predict completed successfully",
        "result": [
            {
                "from_name": "box",
                "id": "0e34f279-79c4-4e8f-9293-63c6f4c81f75",
                "origin": "manual",
                "to_name": "video",
                "type": "videorectangle",
                "value": {
                    "duration": 29.6,
                    "framesCount": 740,
                    "labels": "dog.",
                    "score": 0.4553483724594116,
                    "sequence": [
                        {
                            "enabled": true,
                            "frame": 2,
                            "height": 43.05555555555556,
                            "rotation": 0,
                            "time": 1.0,
                            "width": 23.59375,
                            "x": 17.578125,
                            "y": 35.27777777777778
                        },
                        {
                            "enabled": false,
                            "frame": 2,
                            "height": 43.05555555555556,
                            "rotation": 0,
                            "time": 1.0,
                            "width": 23.59375,
                            "x": 17.578125,
                            "y": 35.27777777777778
                        }
                    ]
                }
            },
            // ... other boxes
        ]
    }
}
```

Natural Language Processing
---

### Text Summarization

Payload:

```json
{
    "command": "predict",
    "params": {
        "prompt": "",
        "model_id": "facebook/opt-125m",
        "token_lenght": 50,
        "task": "text-generation",
        "text": "<text to predict>",
        "max_gen_len": 1024,
        "temperature": 0.9,
        "top_p": 0.5,
        "seed": 0
    },
    "project": "13"
}
```

Response:

```json
{
    "model_version": "1730696002",
    "results": {
        "message": "predict completed successfully",
        "result": [
            {
                "model_version": "",
                "result": [
                    {
                        "from_name": "generated_text",
                        "to_name": "text_output",
                        "type": "textarea",
                        "value": {
                            "text": [
                                "<summarize text>"
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

### Named Entity Recognition

Payload:

```json
{
    "command": "predict",
    "params": {
        "prompt": "Country,PER,ORG,LOC,MISC",
        "model_id": "SKT27182/Name_Entity_Recognizer",
        "token_lenght": 50,
        "task": "ner",
        "text": "<text to predict>",
        "max_gen_len": 1024,
        "temperature": 0.9,
        "top_p": 0.5,
        "seed": 0
    },
    "project": "14"
}
```

Response:

```json
{
    "model_version": "1730696581",
    "results": {
        "message": "predict completed successfully",
        "result": [
            {
                "model_version": "",
                "result": [
                    {
                        "from_name": "generated_text",
                        "to_name": "text_output",
                        "type": "textarea",
                        "value": {
                            "text": [
                                {"word": "<text>", "entity": "<label of the entity>"},
                                {"word": "<text>", "entity": "<label of the entity>"}
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

### Question Answering

Payload:

```json
{
    "command": "predict",
    "params": {
        "prompt": "<prompt>",
        "model_id": "facebook/opt-125m",
        "token_lenght": 50,
        "task": "question-answering",
        "context": "<text to predict>",
        "question": "<the question>",
        "max_gen_len": 1024,
        "temperature": 0.9,
        "top_p": 0.5,
        "seed": 0
    },
    "project": "16"
}
```

Response:

```json
{
    "model_version": "1730696961",
    "results": {
        "message": "predict completed successfully",
        "result": [
            {
                "model_version": "",
                "result": [
                    {
                        "from_name": "generated_text",
                        "to_name": "text_output",
                        "type": "textarea",
                        "value": {
                            "text": [
                                "<text to be selected>"
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

### Machine Translation

Payload:

```json
{
    "command": "predict",
    "params": {
        "prompt": "",
        "model_id": "facebook/opt-125m",
        "token_lenght": 50,
        "task": "translation",
        "text": "<text to translate>",
        "source": "USA",
        "target": "FRA",
        "max_gen_len": 1024,
        "temperature": 0.9,
        "top_p": 0.5,
        "seed": 0
    },
    "project": "17"
}
```

Response:

```json
{
    "model_version": "1730697245",
    "results": {
        "message": "predict completed successfully",
        "result": [
            {
                "model_version": "",
                "result": [
                    {
                        "from_name": "generated_text",
                        "to_name": "text_output",
                        "type": "textarea",
                        "value": {
                            "text": [
                                "<translated text>"
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

### Text Classification

Payload:

```json
{
    "command": "predict",
    "params": {
        "prompt": "Positive,Negative,Neutral",
        "model_id": "facebook/opt-125m",
        "token_lenght": 50,
        "task": "text-classification",
        "text": "<text to predict>",
        "max_gen_len": 1024,
        "temperature": 0.9,
        "top_p": 0.5,
        "seed": 0
    },
    "project": "18"
}
```

Response

```json
{
    "model_version": "1730697604",
    "results": {
        "message": "predict completed successfully",
        "result": [
            {
                "model_version": "",
                "result": [
                    {
                        "from_name": "generated_text",
                        "to_name": "text_output",
                        "type": "textarea",
                        "value": {
                            "text": [
                                "<selected option>"
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

Audio/Speech Processing
---

### Text to speech

Payload

```json
{
  "command": "predict",
  "params": {
    "prompt": "<prompt>",
    "model_id": "seamlessM4T_v2_large",
    "token_lenght": 1024,
    "task": "text-to-speech-translation",
    "text": "<text content>",
    "source": "USA",
    "target": "FRA",
    "segment_size": 0,
    "max_gen_len": 50,
    "temperature": 0.9,
    "top_p": 0.5,
    "seed": 0,
    "confidence_threshold": 0.8,
    "iou_threshold": 0.8,
    "task_id": 60
  },
  "project": "49"
}
```

Response

```json
{
    "model_version": "1732497192",
    "results": {
        "message": "predict completed successfully",
        "result": [
            {
                "model_version": "",
                "result": [
                    {
                        "from_name": "generated_text",
                        "to_name": "text_output",
                        "type": "textarea",
                        "value": {
                            "url": "<audio URL>"
                        }
                    }
                ]
            }
        ]
    }
}
```

### Automatic Speech Recognition

Payload

```json
{
  "command": "predict",
  "params": {
    "prompt": "<prompt>",
    "model_id": "seamlessM4T_v2_large",
    "token_lenght": 1024,
    "task": "automatic-speech-recognition",
    "text": "<text content>",
    "source": "USA",
    "target": "FRA",
    "segment_size": 0,
    "max_gen_len": 50,
    "temperature": 0.9,
    "top_p": 0.5,
    "seed": 0,
    "confidence_threshold": 0.8,
    "iou_threshold": 0.8,
    "task_id": 60
  },
  "project": "49"
}
```

Response

```json
{
    "model_version": "1732497192",
    "results": {
        "message": "predict completed successfully",
        "result": [
            {
                "model_version": "",
                "result": [
                    {
                        "from_name": "generated_text",
                        "to_name": "text_output",
                        "type": "textarea",
                        "value": {
                            "text": [
                              "<recognized text>"
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```
