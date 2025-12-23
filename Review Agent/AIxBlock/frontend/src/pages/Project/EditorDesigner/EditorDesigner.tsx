import React, {useMemo} from "react";
import EditorJS, {EditorConfig, OutputData} from "@editorjs/editorjs";
import {usePageProjectDetail} from "../Detail";
import "./EditorDesigner.scss";
import {parseLabels} from "@/utils/labelConfig";
import AudioBlock from "./Audio/Audio";
import AudioLabelsBlock from "./AudioLabels/AudioLabels";
import RawTextBlock from "./RawText/RawText";
// @ts-ignore
// import DragDrop from "editorjs-drag-drop";
import TextLabelsBlock from "./TextLabels/TextLabels";
import {useUserLayout} from "@/layouts/UserLayout";
import {toConfig} from "./converter";
import {TNavbarBreadcrumb} from "@/components/Navbar/Navbar";
import useLibraryHook from "@/hooks/editor/useLibraryHook";
import {TLsfStore} from "@/components/Editor/LSF/types";
import DummyData from "./dummyData";
import {infoDialog} from "@/components/Dialog";
import ColumnsBlock from "./Columns/Columns";
import TextRatingBlock from "./TextRating/TextRating";
import AudioRatingBlock from "./AudioRating/AudioRating";
import TextSummaryBlock from "./TextSummary/TextSummary";
import AudioTranscriptBlock from "./AudioTranscript/AudioTranscript";
import StickyBlock from "./Sticky/Sticky";
import AudioSegmentTranscriptBlock from "./AudioSegmentTranscript/AudioSegmentTranscript";
import TranscriptsQuestionsBlock from "./TranscriptsQuestions/TranscriptsQuestions";
import TranscriptsLabelsBlock from "./TranscriptsLabels/TranscriptsLabels";
import Toolbox from "./Toolbox";
import Properties from "./Properties";

export default function EditorDesigner() {
  const {project, patchProject} = usePageProjectDetail();
  const eleRef = React.useRef<HTMLDivElement>(null);
  const elePreviewRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<EditorJS>();
  const {root, labelsRoots} = useMemo(() => parseLabels(project.label_config), [project.label_config]);
  const {setActions, clearActions, setCloseCallback, clearCloseCallback} = useUserLayout();
  const [changed, setChanged] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [editorJs, setEditorJs] = React.useState<EditorJS | null>(null);
  const lib = useLibraryHook({
    scripts: [window.APP_SETTINGS.lsfJS],
    styles: [window.APP_SETTINGS.lsfCSS],
    isAvailable: () => "AIxBlock" in window,
  });

  const tools = React.useRef<EditorConfig["tools"]>({
    columns: ColumnsBlock,
    sticky: StickyBlock,
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
  })

  React.useEffect(() => {
    if (!eleRef.current) {
      return;
    }

    let timeout = setTimeout(() => {
      let configStr = root?.getAttribute("config");

      editorRef.current = new EditorJS({
        autofocus: true,
        placeholder: "Add your data type and labels here",
        holder: "editor-designer",
        inlineToolbar: false,
        minHeight: 200,
        data: configStr ? JSON.parse(configStr) : {blocks: []},
        tools: tools.current,
        onReady: () => {
          // new DragDrop(editorRef.current);
          setCloseCallback("/projects/" + project.id + "/settings/general");
        },
        onChange: async () => {
          setChanged(true);
        },
      });

      setEditorJs(editorRef.current);
    }, 100);

    return () => {
      clearTimeout(timeout);
      clearCloseCallback();

      if (editorRef.current && "destroy" in editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, [clearCloseCallback, labelsRoots, patchProject, project.id, root, setCloseCallback]);

  React.useEffect(() => {
    const actions: TNavbarBreadcrumb[] = [];

    if (preview) {
      actions.push({
        actionType: "danger",
        label: "Close Preview",
        onClick: () => setPreview(false),
      });
    } else {
      actions.push({
        actionType: "success",
        label: "Preview",
        onClick: () => setPreview(true),
      });
    }

    if (changed) {
      actions.push({
        actionType: "primary",
        label: "Save",
        onClick: () => {
          if (!root) {
            return;
          }

          editorRef.current?.save().then(d => {
            if (labelsRoots) {
              d.blocks.forEach((b, idx) => {
                if (!["audioLabels", "textLabels", "transcriptsLabels"].includes(b.type)) {
                  return;
                }

                labelsRoots.forEach(r => {
                  if (r.getAttribute("name") !== b.data.name) {
                    return;
                  }

                  d.blocks[idx].data.content = r.innerHTML;
                });
              });
            }

            root.setAttribute("config", JSON.stringify(d));
            root.innerHTML = toConfig(d);

            patchProject({label_config: root?.outerHTML}, false, () => {
              setChanged(false);
            });
          });
        },
      });
    }

    setActions(actions);

    return () => {
      clearActions();
    }
  }, [changed, clearActions, labelsRoots, patchProject, root, setActions, preview]);

  React.useEffect(() => {
    if (lib.isLoading || lib.error || !preview || !editorRef.current || !elePreviewRef.current) {
      return;
    }

    // @ts-ignore
    let ge;
    let ele = elePreviewRef.current;
    ele.style.display = "";

    editorRef.current?.save().then(d => {
      const config = `<View>${toConfig(d)}</View>`;
      const data: {[k:string]: string} = {};
      const blocks = [...d.blocks];

      d.blocks.forEach(b => {
        if (b.type !== "columns") {
          return;
        }

        (b.data.columns as OutputData[]).forEach(c => {
          blocks.push(...c.blocks);
        });
      });

      blocks.forEach(b => {
        if (b.type === "audio") {
          data[b.data.dataKey.substring(1)] = DummyData.DUMY_AUDIO;
        } else if (b.type === "rawText") {
          data[b.data.dataKey.substring(1)] = DummyData.DUMMY_TEXT;
        } else if (b.type === "transcriptsQuestions") {
          data[b.data.dataKey.substring(1)] = DummyData.DUMMY_TEXT;
        }
      });

      try {
        ge = new window.AIxBlock(elePreviewRef.current, {
          interfaces: [
            "basic",
            "predictions",
            "topbar",
            "predictions:menu",
            "annotations:menu",
            "annotations:current",
            "side-column",
            "annotations:tabs",
            "predictions:tabs",
            // "annotations:comments",
            "controls",
            // "submit",
            // "update",
            // "annotations:add-new",
            // "annotations:delete",
            // "edit-history",
          ],
          task: {
            id: 1,
            data,
          },
          config: config,
          user: {
            id: 1,
            username: "preview",
          },
          canCreateLabel: true,
        });

        ge.on("AIxBlockLoad", (ls: TLsfStore) => {
          const a = ls.annotationStore.createAnnotation();
          ls.annotationStore.selectAnnotation(a.id);
        });

        ge.on("error", (e: Error) => {
          infoDialog({title: "Preview Error", message: e.message});
          setPreview(false);
        });
      } catch (e) {
        // @ts-ignore
        infoDialog({title: "Preview Error", message: e.message});
        ele.style.display = "none";
        setPreview(false);
      }
    });

    return () => {
      // @ts-ignore
      ge?.destroy();
      ele.style.display = "none";
    };
  }, [preview, lib]);

  return (
    <>
      <div id="editor-designer-preview" ref={elePreviewRef} style={{display: "none"}} />
      {editorJs && <Toolbox editor={editorJs} tools={tools.current} />}
      {editorJs && <Properties editor={editorJs} />}
      <div id="editor-designer" ref={eleRef} />
    </>
  );
}
