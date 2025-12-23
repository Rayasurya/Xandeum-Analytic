import React, {useState} from "react";
import {ReactMic} from "react-mic";
import {Button} from "@mui/material";

const width = 320;

export default function PredicAudioRecorder({onRecorded}) {
  const [isRecord, setIsRecord] = useState(false);
  const [data, setData] = useState(null);

  return (
    <div>
      <div style={{ width }}>Click RECORD and describe objects that need to be annotated.</div>
      <div style={{ display: isRecord ? "block" : "none" }}>
        <ReactMic
          bufferSize={4096}
          channelCount={1}
          height={50}
          mimeType={"audio/mp3"}
          onStop={data => {
            setData(data);
            const reader = new FileReader();

            reader.onload = function () {
              onRecorded && onRecorded(reader.result);
            };

            reader.readAsDataURL(data.blob);
          }}
          record={isRecord}
          sampleRate={44100}
          visualSetting={"sinewave"}
          width={width}
        />
      </div>
      {
        data?.blobURL
          ? (
            <audio
              controls={true}
              controlsList={"nodownload"}
              src={data?.blobURL}
              style={{
                display: "block",
                marginTop: 16,
                width: width + "px",
              }}
            />
          )
          : null
      }
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        <Button
          color="primary"
          onClick={() => {
            setData(null);
            setIsRecord(!isRecord);
          }}
          size="large"
        >
          {isRecord ? "Stop" : "Record"}
        </Button>
      </div>
    </div>
  );
}