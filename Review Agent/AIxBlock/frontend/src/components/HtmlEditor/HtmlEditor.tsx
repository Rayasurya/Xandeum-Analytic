import React, { useMemo } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { TinyMCE } from "tinymce";
import "./HtmlEditor.scss";
import IconLoading from "@/assets/icons/IconLoading";

export default function HtmlEditor({
  onChange,
  value,
  customOptions,
}: {
  onChange?: (v: string) => void;
  value?: string;
  customOptions?: Parameters<TinyMCE["init"]>[0] & {
    selector?: undefined;
    target?: undefined;
  };
}) {
  const content = React.useRef<string>(value ?? "");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const options = useMemo(() => {
    return (
      customOptions ?? {
        height: 500,
        menubar: false,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | h2 h3 h4 h5 h6 | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | image | bullist numlist outdent indent | " +
          "removeformat | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }
    );
  }, [customOptions]);
  return (
    <div className={`html-editor ${isLoading && "loading"}`}>
      <div className="placeholder-container">
        <IconLoading width={30} height={30} /> Loading...
      </div>
      <Editor
        apiKey="ovkwin5ecsf54i7ytv1elco6w1bl6t24fbdmsura4qjm47ow"
        initialValue={content.current}
        value={value}
        init={options}
        onPostRender={() => {
          setIsLoading(true);
        }}
        onInit={() => {
          setIsLoading(false);
				}}
				onEditorChange={(_, editor) => {
					onChange?.(editor.getContent());
				}}
				onChange={(_, editor) => {
          onChange?.(editor.getContent());
        }}
      />
    </div>
  );
}
