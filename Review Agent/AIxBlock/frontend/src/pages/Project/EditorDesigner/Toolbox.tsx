import React from "react";
import "./Toolbox.scss";
import EditorJS, {EditorConfig} from "@editorjs/editorjs";
import {Tooltip} from "react-tooltip";

export type TProps = {
  editor: EditorJS,
  tools: EditorConfig["tools"],
}

export default function Toolbox({editor, tools}: TProps) {
  const items = React.useMemo(() => {
    const result = [];

    for (const toolKey in tools) {
      // @ts-ignore
      if (!("toolbox" in tools[toolKey]) || !("icon" in tools[toolKey]["toolbox"])) {
        continue;
      }

      // @ts-ignore
      const label = "title" in tools[toolKey]["toolbox"] ? tools[toolKey]["toolbox"]["title"] : toolKey;

      result.push(
        <React.Fragment key={"toolbox-" + toolKey}>
          <div
            id={"toolbox-" + toolKey}
            className="item"
            dangerouslySetInnerHTML={{
              // @ts-ignore
              __html: tools[toolKey]["toolbox"]["icon"]
            }}
            onClick={() => {
              editor.focus(true);
              editor.blocks.insert(toolKey);
            }}
          />
          <Tooltip place="right" positionStrategy="fixed" content={label} anchorSelect={"#toolbox-" + toolKey} />
        </React.Fragment>
      );
    }

    return result;
  }, [editor, tools]);

  return (
    <div id="editor-designer-toolbox">
      {items}
    </div>
  )
}
