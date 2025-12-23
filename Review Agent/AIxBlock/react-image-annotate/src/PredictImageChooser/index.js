import React, {useEffect, useRef, useState} from "react";
import {MenuItem, Select} from "@mui/material";

const previewSize = 320;

export default function PredictImageChooser({labels, labelColors, onSelectImage, onSelectLabel}) {
  const [label, setLabel] = useState("");
  const [image, setImage] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    onSelectImage && onSelectImage(image);
  }, [image, onSelectImage]);

  useEffect(() => {
    onSelectLabel && onSelectLabel(label);
  }, [label, onSelectLabel]);

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          ...(image !== ""
            ? {
              backgroundImage: "url(" + image + ")",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
            : {
              background: "repeating-conic-gradient(#fff 0 90deg, rgba(0,0,0,.1) 0 180deg) 0 0/25% 25%",
            }),
          border: "solid 1px rgba(0,0,0,.2)",
          borderRadius: 4,
          cursor: "pointer",
          height: previewSize,
          width: previewSize,
        }}
      />
      <input
        accept=".jpg,.jpeg,.png"
        onChange={ev => {
          const input = ev.target;
          if (!input.files || !input.files[0]) return;
          const file = input.files[0];
          const nameLower = file.name.toLowerCase();

          if (!nameLower.endsWith(".jpg") && !nameLower.endsWith(".jpeg") && !nameLower.endsWith(".png")) {
            return;
          }

          const reader = new FileReader();

          reader.onload = function (e) {
            setImage(e.target.result);
          };

          reader.readAsDataURL(file);
        }}
        ref={inputRef}
        style={{display: "none"}}
        type="file"
      />
      <Select
        displayEmpty={true}
        onChange={ev => {
          setLabel(ev.target.value);
        }}
        renderValue={(v) => v === "" ? "-- Select label --" : v}
        style={{
          marginTop: 16,
          width: previewSize,
        }}
        value={label}
      >
        {labels.map(
          l => <MenuItem key={"predict-image-chooser-" + l} style={{color: labelColors[l] ?? "#FF0000"}} value={l}>{l}</MenuItem>
        )}
      </Select>
    </div>
  );
}
