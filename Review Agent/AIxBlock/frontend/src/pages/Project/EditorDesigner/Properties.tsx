import React from "react";
import "./Properties.scss";
import EditorJS from "@editorjs/editorjs";

export type TProps = {
  editor: EditorJS,
}

export default function Properties(_: TProps) {
  return (
    <div id="editor-designer-properties">
      <em>(Select a block)</em>
    </div>
  );
}
