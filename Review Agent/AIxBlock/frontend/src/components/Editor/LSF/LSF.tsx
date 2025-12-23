import React, { memo, useEffect, useMemo } from "react";
import {TTaskModel} from "@/models/task";
import useLibraryHook from "@/hooks/editor/useLibraryHook";
import {TProjectModel} from "@/models/project";
import {IApiTask, ILsfAnnotation, TLsfStore} from "./types";
import { taskToLSFormat } from "./utils";
import {useAuth} from "@/providers/AuthProvider";
import useAnnotationsHook from "@/hooks/editor/useAnnotationsHook";
import AppLoading from "../../AppLoading/AppLoading";
// import { getOggPath, isFileOggExisted } from "../../AutoSourceAudio/AutoSourceAudio";
import {useApi} from "@/providers/ApiProvider";
import canHandleTask from "@/utils/canHandleTask";
import {infoDialog} from "../../Dialog";
import {toastError, toastSticky, toastSuccess} from "@/utils/toast";
import {useCentrifuge} from "@/providers/CentrifugoProvider";
// import {randomString} from "@/utils/random";
import {extractErrorMessage, extractErrorMessageFromResponse} from "@/utils/error";
import {parseLabels} from "@/utils/labelConfig";
import {randomString} from "@/utils/random";
import usePredictConfigHook from "@/pages/Flow/usePredictConfigHook";
import { getPredictModel, getPredictTask } from "@/utils/models";
// import PredictParams from "./PredictParams";
// import {EMPTY_MP3} from "@/utils/audio";
// import ppStyles from "./PredictParams.module.scss";

/**
 * Test predict without ML backend and compute:
 *
 * 1. Open the developer console
 * 2. Enter: APP_SETTINGS.debugML = true
 * 3. Enter: APP_SETTINGS.debugPredictUrl = "<your URL to test predict>"
 * 4. Open a task you will see the predict button
 *
 * Requirement: Current platform must be running with one of following domains.
 */

const isValidTestEnvironment = ["127.0.0.1", "localhost", "dev-us-west-1.aixblock.io"].includes(window.location.hostname);

export const hasDebugML = () => {
  return window.APP_SETTINGS.debugML && isValidTestEnvironment;
}

export type TProps = {
  rootElement?: HTMLDivElement | null,
  project: TProjectModel,
  task: TTaskModel,
  onLabelCreated?: (type: string, name: string, label: string) => void,
  onLabelDeleted?: (type: string, name: string, label: string) => void,
  hasMlAssisted?: boolean;
  onPredictConfigChange?: (config: TProjectModel["predict_config"]) => void;
}

function BaseLSF({project, task, onLabelCreated, onLabelDeleted, hasMlAssisted, onPredictConfigChange}: TProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const {user} = useAuth();
  const {updateAnnotation, submitAnnotation, deleteAnnotation, submitDraft, deleteDraft} = useAnnotationsHook(task);
  const {isLoading, isLoaded, error} = useLibraryHook({
    scripts: [window.APP_SETTINGS.lsfJS],
    styles: [window.APP_SETTINGS.lsfCSS],
    isAvailable: () => Object.hasOwn(window, "AIxBlock"),
  });
  // const [oggFileLink, setOggFileLink] = React.useState<string>();
  // const [isCheckingAudio, setIsCheckingAudio] = React.useState<boolean>(true);
  const {onTaskMessage, onProjectMessage} = useCentrifuge();
  const {call} = useApi();
  const lsRef = React.useRef<TLsfStore>();
  const {labels} = useMemo(() => parseLabels(project.label_config), [project.label_config]);
  const [userRoles, setUserRoles] = React.useState<{ isQC: boolean; isQA: boolean } | null>(null);

  const {
    predictConfigRef,
    predictUrl,
    predictUrlRef,
    predictConfig,
    checkingPredictConfig,
    checkingPredictConfigRef,
    getPredictConfig,
  } = usePredictConfigHook({
    projectPredictConfig: project.predict_config,
    hasMlAssisted: !!hasMlAssisted,
    predictTask: getPredictTask(project.label_config_title),
    projectId: project.id,
  });

  // const task = useMemo(() => {
  //   if(oggFileLink){
  //     return {...baseTask, data: {...baseTask.data, audio: oggFileLink}}
  //   }
  //
  //   return baseTask;
  // },[baseTask, oggFileLink]);

  const predictTask = useMemo(
    () => getPredictTask(project.label_config_title),
    [project.label_config_title],
  );

  useEffect(() => {
    if (predictUrl && predictConfig) {
      lsRef.current?.setFlags({
        hasPredict: true,
        prompt: predictConfigRef.current?.prompt,
      });
    } else {
      lsRef.current?.setFlags({hasPredict: false});
    }
  }, [predictConfig, predictConfigRef, predictUrl]);

  useEffect(() => {
    lsRef.current?.setFlags({loadingPredictUrl: checkingPredictConfig});
  }, [checkingPredictConfig]);

  // const loadPredictUrl = useCallback(() => {
  //   function loadFailed(msg?: string) {
  //     msg && toastError(msg, {toastId: "lsfMlBackend"});
  //     clearTimeout(tryReloadMlBackendTimeout.current);
  //     tryReloadMlBackendTimeout.current = setTimeout(() => loadPredictUrl(), 30000);
  //   }
  //
  //   clearTimeout(tryReloadMlBackendTimeout.current);
  //
  //   if (!hasMlAssisted && !hasDebugML()) {
  //     lsRef.current?.setFlags({hasPredict: false, loadingPredictUrl: false});
  //     predictUrl.current.loading = false;
  //     predictUrl.current.url = null;
  //     return;
  //   }
  //
  //   if (window.APP_SETTINGS.debugPredictUrl && isValidTestEnvironment) {
  //     lsRef.current?.setFlags({hasPredict: true, loadingPredictUrl: false});
  //     predictUrl.current.url = window.APP_SETTINGS.debugPredictUrl;
  //     predictUrl.current.loading = false;
  //     return;
  //   }
  //
  //   lsRef.current?.setFlags({loadingPredictUrl: true});
  //
  //   const ar = call("mlTensorboard", {
  //     params: {
  //       project_id: project.id.toString(),
  //     },
  //   });
  //
  //   ar.promise
  //     .then(async r => {
  //       if (!r.ok) {
  //         loadFailed("Can not load ML backend. Error: " + await extractErrorMessageFromResponse(r));
  //         lsRef.current?.setFlags({hasPredict: false, loadingPredictUrl: false});
  //         predictUrl.current.loading = false;
  //         predictUrl.current.url = null;
  //         return;
  //       }
  //
  //       try {
  //         const data = await r.json();
  //         let url: string = data["proxy_url"].trim();
  //
  //         if (!url.endsWith("/")) {
  //           url += "/";
  //         }
  //
  //         const r2 = await fetch(url);
  //         if (ar.controller.signal.aborted) return;
  //
  //         if (r2.ok) {
  //           lsRef.current?.setFlags({
  //             hasPredict: true,
  //             loadingPredictUrl: false,
  //             prompt: predictConfig.current.prompt,
  //           });
  //
  //           predictUrl.current.loading = false;
  //           predictUrl.current.url = url + "action";
  //           return;
  //         }
  //       } catch (e) {
  //         loadFailed("Can not load ML backend. Error: " + extractErrorMessage(e));
  //       }
  //
  //       loadFailed();
  //       lsRef.current?.setFlags({hasPredict: false, loadingPredictUrl: false});
  //       predictUrl.current.loading = false;
  //       predictUrl.current.url = null;
  //       return;
  //     })
  //     .catch(e => {
  //       if (ar.controller.signal.aborted) return;
  //       loadFailed("Can not load ML backend. Error: " + extractErrorMessage(e));
  //       lsRef.current?.setFlags({hasPredict: false, loadingPredictUrl: false});
  //     });
  //
  //   return ar;
  // }, [call, hasMlAssisted, project.id]);
  //
  // React.useEffect(function loadPredictUrlEffect() {
  //   let ar: TApiCallResult | undefined;
  //
  //   const timeout = setTimeout(function loadPredictUrlTimeout() {
  //     ar = loadPredictUrl();
  //   }, 100);
  //
  //   return () => {
  //     ar?.controller?.abort("Unmounted");
  //     clearTimeout(timeout);
  //     clearTimeout(tryReloadMlBackendTimeout.current);
  //   }
  // }, [loadPredictUrl]);

  // React.useEffect(() => {
  //   if (!baseTask || !baseTask.data || !baseTask.data.audio) {
  //     setIsCheckingAudio(false);
  //     return;
  //   }
  //
  //   const oggPath = getOggPath(baseTask.data.audio);
  //
  //   if (oggPath) {
  //     const abortController = new AbortController();
  //
  //     isFileOggExisted(oggPath, abortController.signal)
  //       .then((res) => {
  //         if (abortController.signal.aborted) {
  //           return;
  //         }
  //
  //         if(res) {
  //           setOggFileLink(oggPath);
  //         }
  //       })
  //       .catch(() => {})
  //       .finally(() => {
  //         if (abortController.signal.aborted) {
  //           return;
  //         }
  //
  //         setIsCheckingAudio(false);
  //       });
  //
  //     return () => {
  //       abortController.abort("Unmounted");
  //     }
  //   }
  // }, [baseTask])
  
  const editorLoaded = React.useCallback((ls: TLsfStore) => {
    // @ts-ignore
    lsRef.current = window.ls = ls;

    ls.setFlags({
      hasPredict: !!predictUrlRef.current && predictConfigRef.current,
      loadingPredictUrl: checkingPredictConfigRef.current,
      isLoading: true,
      usePromptPredict: !["Video Object Tracking"].includes(project.label_config_title),
    });

    let annotationID: number;
    const activeDrafts = ls.annotationStore.annotations.map(a => a.draftId).filter(Boolean);

    if (task.drafts.length > 0) {
      for (const draft of task.drafts) {
        if (activeDrafts.includes(draft.id)) continue;
        let c;

        if (draft.annotation) {
          // Annotation existed - add draft to existed annotation
          const draftAnnotationPk = String(draft.annotation);
          c = ls.annotationStore.annotations.find(c => c.pk === draftAnnotationPk);

          if (!c) {
            continue;
          }

          c.history.freeze();
          c.addVersions({draft: draft.result});
          c.deleteAllRegions({deleteReadOnly: true});
        } else {
          // Annotation not found - restore annotation from draft
          c = ls.annotationStore.addAnnotation({
            draft: draft.result,
            userGenerate: true,
            comment_count: draft.comment_count ?? 0,
            unresolved_comment_count: draft.unresolved_comment_count ?? 0,
            createdBy: draft.created_username,
            createdAgo: draft.created_ago,
            createdDate: draft.created_at,
          });
        }

        ls.annotationStore.selectAnnotation(parseInt(c.id ?? "0"));
        c.deserializeResults(draft.result);
        c.setDraftId(draft.id);
        c.setDraftSaved(draft.created_at);
        c.history.safeUnfreeze();
      }
    }

    if (task.annotations.length === 0) {
      const a = ls.annotationStore.createAnnotation();
      annotationID = a.id;
    } else {
      annotationID = task.annotations[0].id;
    }

    ls.annotationStore.selectAnnotation(annotationID);
    ls.setFlags({isLoading: false});
  }, [predictUrlRef, predictConfigRef, checkingPredictConfigRef, project.label_config_title, task.drafts, task.annotations]);

  React.useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await call("UserRoleInProject", {
          query: new URLSearchParams({ project_id: project.id.toString() }),
        });
        const data = await response.promise;
        const jsonData = await data.json();
        setUserRoles({
          isQC: jsonData["is_qc"] ?? false,
          isQA: jsonData["is_qa"] ?? false,
        });
        // console.log("aaa",userRoles?.isQC, userRoles?.isQA)
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setUserRoles(null);
      }
    };

    fetchUserRoles();
  }, [call, project.id, userRoles?.isQA, userRoles?.isQC]);

  const canEdit = React.useMemo(() => {
    if (!user) {
      return false;
    }

    const check = canHandleTask(user, project, task, userRoles?.isQA, userRoles?.isQC);
    return check.canEdit;
  }, [project, task, user, userRoles?.isQA, userRoles?.isQC]);

  const canApplyRedact = React.useMemo(() => {
    if (user?.is_superuser || user?.is_organization_admin) {
      return true;
    }

    if (project.need_to_qc && userRoles?.isQC) {
      return true;
    } else if (project.need_to_qa && (userRoles?.isQA || userRoles?.isQC)) {
      return true;
    }

    return false;
  }, [project.need_to_qa, project.need_to_qc, user?.is_organization_admin, user?.is_superuser, userRoles?.isQA, userRoles?.isQC]);

  React.useEffect(() => {
    if (!isLoaded || !rootRef.current /*|| isCheckingAudio*/) {
      return;
    }

    const ls = new window.AIxBlock(rootRef.current, {
      interfaces: [
        "basic",
        "predictions",
        "topbar",
        "predictions:menu",
        "annotations:menu",
        "annotations:current",
        "side-column",
        // "annotations:view-all",
        "annotations:tabs",
        "predictions:tabs",
        "annotations:comments",
        ...canEdit ? [
          "controls",
          "submit",
          "update",
          "annotations:add-new",
          "annotations:delete",
          "edit-history",
        ] : [],
      ],
      task: taskToLSFormat(task as unknown as IApiTask),
      config: project.label_config,
      user: {...user},
      canCreateLabel: true,
      canApplyRedact,
      hasMlAssisted: hasMlAssisted || hasDebugML(),
      onSubmitDraft: (store: TLsfStore, annotation: ILsfAnnotation, __: Object = {}) => {
        submitDraft(annotation, {}).result
          .catch(e => {
            if (window.APP_SETTINGS.debug) {
              console.error(e);
            }
          });
      },
      onSubmitAnnotation: async (store: TLsfStore, annotation: ILsfAnnotation) => {
        const closeToast = toastSticky("Saving annotation...");
        store.setFlags({isSubmitting: true});
        await submitAnnotation(annotation).result
          .then(() => {
            if (!store.isApplyingRedact) {
              toastSuccess("Your annotation has been saved");
            }
          })
          .catch(e => {
            if ("detail" in e) {
              infoDialog({title: "Error", message: e.detail});
            } else if ("toString" in e) {
              infoDialog({title: "Error", message: e.toString()});
            }
          })
          .finally(() => {
            store.setFlags({isSubmitting: false});
            closeToast();
          });
      },
      onUpdateAnnotation: async (store: TLsfStore, annotation: ILsfAnnotation) => {
        const closeToast = toastSticky("Saving annotation...");
        store.setFlags({isSubmitting: true});
        await updateAnnotation(annotation).result
          .then(() => {
            if (!store.isApplyingRedact) {
              toastSuccess("Your annotation has been saved");
            }
          })
          .catch(e => {
            if ("detail" in e) {
              infoDialog({title: "Error", message: e.detail});
            } else if ("toString" in e) {
              infoDialog({title: "Error", message: e.toString()});
            }
          })
          .finally(() => {
            store.setFlags({isSubmitting: false});
            closeToast();
          });
      },
      onDeleteAnnotation: async (_: TLsfStore, annotation: ILsfAnnotation) => {
        const closeToast = toastSticky("Deleting annotation...");

        if (annotation.draftId) {
          const dr = await deleteDraft(annotation.draftId).result

          if (!dr) {
            infoDialog({title: "Error", message: "Failed to delete annotation. Please try again!"});
            closeToast();
            return;
          }

          if (annotation.pk) {
            const ar = await deleteAnnotation(annotation.pk).result;

            if (!ar) {
              infoDialog({title: "Error", message: "Failed to delete annotation. Please try again!"});
              closeToast();
              return;
            }
          }
        } else if (annotation.pk) {
          const ar = await deleteAnnotation(annotation.pk).result;

          if (!ar) {
            infoDialog({title: "Error", message: "Failed to delete annotation. Please try again!"});
            closeToast();
            return;
          }
        }

        closeToast();
        toastSuccess("Annotation has been deleted");
      },
    });

    ls.on("comments:list", async (tid: number) => {
      const closeToast = toastSticky("Loading comments...");

      try {
        const ar = call("comments", {
          params: {task: tid.toString()},
        });

        const data = await ar.promise;
        const comments: (object & {created_by: {id: number}})[] = await data.json();
        closeToast();
        return comments;
      } catch (e) {
        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }

        toastError(e instanceof Error ? e.toString() : e as string);
      }

      closeToast();
      return [];
    });

    ls.on("comments:create", async (comment: {task: number, text: string, created_by: number}) => {
      const closeToast = toastSticky("Posting comment...");

      try {
        const ar = call("commentCreate", {
          body: {
            task: comment.task.toString(),
            text: comment.text,
            created_by_id: user?.id ?? comment.created_by,
          },
        });

        const r = await ar.promise;
        closeToast();
        toastSuccess("New comment has been posted");
        return await r.json();
      } catch (e) {
        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }

        toastError(e instanceof Error ? e.toString() : e as string);
      }

      closeToast();
      return comment;
    });

    ls.on("comments:update", async (comment: {id: number, is_resolved: boolean}) => {
      const closeToast = toastSticky("Updating comment...");

      try {
        const ar = call("commentUpdate", {
          body: {
            is_resolved: comment.is_resolved,
          },
          params: {
            id: comment.id.toString(),
          },
        });

        const r = await ar.promise;

        if (r.ok) {
          closeToast();
          toastSuccess("Comment has been updated");
          return await r.json();
        }
      } catch (e) {
        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }

        toastError(e instanceof Error ? e.toString() : e as string);
      }

      closeToast();
      return false;
    });

    ls.on("labelCreated", (type: string, name: string, label: string) => {
      onLabelCreated?.(type, name, label);
    });

    ls.on("labelDeleted", (type: string, name: string, label: string) => {
      onLabelDeleted?.(type, name, label);
    });

    ls.on("reloadMlBackend", () => {
      if (!hasMlAssisted && !hasDebugML()) {
        return {status: "Failed"};
      }

      getPredictConfig();
    });

    function checkLabel(label: string, forObj: string) {
      const names = ls.store.annotationStore.names.toJSON();

      for (let nk in names) {
        const obj = ls.store.annotationStore.names.get(nk);
        if (obj.toname !== forObj || !obj.type.endsWith("labels")) continue;

        if (obj.findLabel(label)) {
          window.APP_SETTINGS.debug && console.log("Label [" + label + "] found");
        } else {
          window.APP_SETTINGS.debug && console.log("Label [" + label + "] not found");
          obj.addLabel(label);
        }
      }
    }

    ls.on("aiPrompt", async (base64Audio: string, prompt: string) => {
      if (!hasMlAssisted && !hasDebugML()) {
        return {status: "Failed"};
      }

      if (!predictUrlRef.current || !predictConfigRef.current) {
        toastError("No predict URL found");
        return {status: "Failed"};
      }

      let videoUrl: string | null = null;
      let videoTime: number | null = null;
      let videoFrame: number | null = null;
      let videoTotalFrame: number | null = null;
      let text: string | null = null;
      let langSource: string | null = null;
      let langTarget: string | null = null;
      let modelId: string = getPredictModel(project.label_config_title);
      let question: string = "";
      let segmentSize = 0;
      let chat = [];
      const objs = ls.store.annotationStore.names.toJSON();
      const requireLanguage = [
        "Machine Translation",
        "Automatic Speech Recognition",
        "Text-to-Text Translation",
        "Text-to-Speech Translation",
        "Speech-to-Text Translation",
        "Speech-to-Speech Translation",
      ].includes(project.label_config_title);

      for (let objName in objs) {
        const obj = ls.store.annotationStore.names.get(objName);

        if (obj.type === "video" && obj.value === "$video" && obj.ref?.current) {
          videoTime = obj.ref.current.currentTime;
          videoFrame = obj.ref.current.currentFrame;
          videoTotalFrame = obj.ref.current.length;
        } else if (obj.type === "chat") {
          chat = obj.getAllMessages().toJSON();
        }
      }

      if ("video" in task.data) {
        try {
          // @ts-ignore
          videoUrl = task.data["video"];
        } catch (e) {
          window.APP_SETTINGS.debug && console.error(e);
        }

        if (videoUrl && !videoUrl.startsWith("http://") && !videoUrl.startsWith("https://")) {
          if (!videoUrl.startsWith("/")) {
            videoUrl = "/" + videoUrl;
          }

          videoUrl = window.location.protocol + "//" + window.location.host + videoUrl;
        }
      }

      if ("text" in task.data) {
        // @ts-ignore
        text = task.data["text"];
      }

      if ("question" in task.data) {
        // @ts-ignore
        question = task.data["question"];
      }
      // else {
      //   customPrompt = labels.join(", ");
      // }

      for (let objName in objs) {
        const obj = ls.store.annotationStore.names.get(objName);
        if (obj.type !== "languagepair") continue;
        langSource = obj.sourceName;
        langTarget = obj.targetName;
      }

      if (requireLanguage && (!langSource || !langTarget)) {
        toastError("No source/target language specify");
        return;
      }

      ls.store.setFlags({predicting: true});

      const payload = {
        command: "predict",
        params: {
          prompt,
          model_id: modelId,
          token_lenght: predictConfigRef.current.tokenLength,
          task: predictTask,
          text: text ?? "",
          ...(requireLanguage ? {source: langSource, target: langTarget} : {}),
          ...([
              "automatic-speech-recognition",
              "speech-to-text-translation",
              "speech-to-speech-translation",
            ].includes(predictTask)
              ? {
                data: task.data["audio"],
              }
              : {}
          ),
          ...([
            "question-answering"
            ].includes(predictTask)
              ? {
                context: text ?? "",
                question,
              }
              : {}
          ),
          ...(["chat"].includes(predictTask) ? {chat} : {}),
          // ...(predictTask === "text-generation"
          //   ? {}
          //   : {
          //     voice: {
          //       data: (!base64Audio || base64Audio.length === 0) ? EMPTY_MP3 : base64Audio,
          //       file_name: (!base64Audio || base64Audio.length === 0) ? null : randomString() + ".mp3",
          //     }
          //   }),
          ...("video" in task.data
            ? {
              video_url: videoUrl,
              video_frame: videoFrame,
              video_time: videoTime,
              video_total_frame: videoTotalFrame,
              frame: predictConfigRef.current.frame,
              full_video: predictConfigRef.current.fullVideo,
            }
            : {}),
          segment_size: segmentSize,
          max_gen_len: predictConfigRef.current.maxGenLength,
          temperature: predictConfigRef.current.temperature,
          top_p: predictConfigRef.current.topP,
          seed: predictConfigRef.current.seed,
          confidence_threshold: predictConfigRef.current.confidenceThreshold,
          iou_threshold: predictConfigRef.current.iouThreshold,
          task_id: task.id,
          labels: labels.join(","),
        },
        project: project.id.toString(),
      }

      window.APP_SETTINGS.debug && console.log("AI Prompt", base64Audio, prompt);

      const requestOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }

      try {
        const r = await fetch(predictUrlRef.current, requestOptions);

        if (!r.ok) {
          toastError("Predict failed. Error: " + await extractErrorMessageFromResponse(r), {toastId: "lsfMlBackend"});
          ls.store.setFlags({predicting: false});
          return {status: "Failed"};
        }

        const data = await r.json();
        const names = ls.store.annotationStore.names.toJSON();
        let result = data?.["results"]?.["result"];

        if (Array.isArray(result) && result.length > 0) {
          if ("result" in result[0] && Array.isArray(result[0]["result"])) {
            result = result[0]["result"];
          }

          // @ts-ignore
          result.forEach((r) => {
            if (["Question Answering"].includes(project.label_config_title)) {
              const _qaText = r?.["value"]?.["text"]?.[0];

              if (_qaText && text && text.includes(_qaText)) {
                const _qaIdx = text.indexOf(_qaText);

                r = {
                  value: {
                    start: _qaIdx,
                    end: _qaIdx + _qaText.length,
                    text: _qaText,
                    labels: ["Answer"],
                  },
                  id: randomString(),
                  from_name: "answer",
                  to_name: "text",
                  type: "labels",
                  origin: "manual"
                }
              }
            }
            else if  (["Named Entity Recognition"].includes(project.label_config_title)) {
              if (!Array.isArray(r?.["value"]?.["text"])) {
                return;
              }

              r["value"]["text"].forEach(entity => {
                if (!("word" in entity) || !("entity" in entity) || typeof entity["word"] !== "string" || typeof entity["entity"] === "string") {
                  window.APP_SETTINGS.debug && console.error("Wrong NER entity format", entity);
                  return;
                }

                let lastIdx = 0;
                let foundIdx = 0;

                while (true) {
                  foundIdx = text?.indexOf(entity["word"], lastIdx) ?? -1;
                  if (foundIdx === -1) break;

                  lastIdx = foundIdx + entity["word"].length;
                  checkLabel(entity["entity"], "text");
                  ls.store.annotationStore.selected.appendResults([{
                    from_name: "label",
                    id: randomString(),
                    to_name: "text",
                    type: "labels",
                    value: {
                      start: foundIdx,
                      end: foundIdx + entity["word"].length,
                      text: entity["word"],
                      labels: [entity["entity"]],
                    },
                  }]);
                }
              });

              return;
            }
            else if (["Text Classification"].includes(project.label_config_title)) {
              if (!Array.isArray(r?.["value"]?.["text"])) {
                return;
              }

              ls.store.annotationStore.selected.appendResults([{
                from_name: "sentiment",
                id: randomString(),
                to_name: "text",
                type: "choices",
                value: {
                  choices: r["value"]["text"],
                },
              }]);

              return;
            }
            else if ([
              "Text to speech",
              "Speech-to-Speech Translation",
              "Text-to-Speech Translation",
            ].includes(project.label_config_title)) {
              if (typeof r?.["value"]?.["url"] !== "string") {
                return;
              }

              ls.store.annotationStore.selected.appendResults([{
                from_name: "audiofile",
                id: randomString(),
                to_name: "audiofile",
                type: "audiofile",
                value: {
                  audiofile: {
                    type: "url",
                    data: r["value"]?.["url"],
                  },
                },
              }]);

              return;
            }
            else if ([
              "Automatic Speech Recognition",
              "Speech-to-Text Translation",
            ].includes(project.label_config_title)) {
              if (typeof r?.["value"]?.["text"] !== "string") {
                return;
              }

              ls.store.annotationStore.selected.appendResults([
                {
                  value: {
                    text: [r["value"]["text"]],
                  },
                  id: randomString(),
                  from_name: "transcription",
                  to_name: "audio",
                  type: "textarea",
                }
              ]);

              return;
            }
            else if ([
              "Text-to-Text Generation - Chatbot",
            ].includes(project.label_config_title)) {
              if (Array.isArray(r?.["value"]?.["text"])) {
                r["value"]["text"] = r["value"]["text"][0];
              }

              if (typeof r?.["value"]?.["text"] !== "string") {
                return;
              }

              for (let nk in names) {
                const obj = ls.store.annotationStore.names.get(nk);

                if (obj.type !== "chat") {
                  continue;
                }

                obj.addMessage("assistant", r["value"]["text"]);
                break;
              }

              return;
            }
            else if (r.type === "textarea") {
              for (let nk in names) {
                const obj = ls.store.annotationStore.names.get(nk);

                if (obj.type === "textarea") {
                  r["from_name"] = obj.name;
                  r["to_name"] = obj.toname;
                  break;
                }
              }

              if (typeof r?.["value"]?.["text"] === "string") {
                r["value"]["text"] = [r["value"]["text"]];
              }
            }

            if (!("to_name" in r) || !("from_name" in r)) {
              window.APP_SETTINGS.debug && console.error("Missing [to_name] or [from_name] property", r);
              return;
            }

            if (!(r["to_name"] in names)) {
              window.APP_SETTINGS.debug && console.error("[to_name=" + r["to_name"] + "] not exists", r);
              return;
            }

            if (!(r["from_name"] in names)) {
              window.APP_SETTINGS.debug && console.error("[from_name=" + r["from_name"] + "] not exists", r);
              return;
            }

            if ("labels" in r["value"] && !Array.isArray(r["value"]["labels"])) {
              if (typeof r["value"]["labels"] === "string") {
                r["value"]["labels"] = [r["value"]["labels"]];
              } else {
                r["value"]["labels"] = [];
              }
            }

            if (!("labels" in r["value"])) {
              window.APP_SETTINGS.debug && console.log("No label found");
              ls.store.annotationStore.selected.appendResults([r]);
              return;
            }

            if ("sequence" in r["value"] && Array.isArray(r["value"]["sequence"])) {
              r["value"]["sequence"] = r["value"]["sequence"].map(oldObj => {
                const newObj = {...oldObj};

                if ("frame" in newObj) {
                  newObj["frame"] = parseInt(newObj["frame"]);
                }

                return {...newObj};
              });
            }

            // @ts-ignore
            r["value"]["labels"].forEach(l => checkLabel(l, r["to_name"]));
            ls.store.annotationStore.selected.appendResults([r]);
            return;
          });
        }

        ls.store.setFlags({predicting: false});
        return {status: "Ok"};
      } catch (e) {
        toastError("Predict failed. Error: " + extractErrorMessage(e), {toastId: "lsfMlBackend"});
        ls.store.setFlags({predicting: false});
        return {status: "Failed"};
      }
    });

    ls.on("AIxBlockLoad", editorLoaded);

    ls.on("redactAnnotation", async (annotation: ILsfAnnotation) => {
      const ar = call("redactAnnotation", {
        params: {id: annotation.pk ?? "0"}
      });

      ar.promise
        .then(async r => {
          if (r.ok) {
            const data = await r.clone().json();

            if ("detail" in data) {
              toastSuccess(data["detail"]);
            }

            return;
          }

          toastError(await extractErrorMessageFromResponse(r));
        })
        .catch(e => {
          toastError(extractErrorMessage(e));
        });

      return ar.promise;
    });

    return () => {
      ls.destroy();
      lsRef.current = undefined;
      // @ts-ignore
      window.ls = undefined;
    };
  }, [
    rootRef,
    isLoaded,
    task,
    editorLoaded,
    project.label_config,
    user,
    submitAnnotation,
    updateAnnotation,
    deleteAnnotation,
    submitDraft,
    deleteDraft,
    // isCheckingAudio,
    onLabelCreated,
    onLabelDeleted,
    canEdit,
    call,
    project.id,
    hasMlAssisted,
    project.label_config_title,
    labels,
    onPredictConfigChange,
    project.predict_config,
    predictTask,
    getPredictConfig,
    predictConfigRef,
    predictUrlRef,
    canApplyRedact,
  ]);

  const handleProjectMessage = React.useCallback((data: object) => {
    if ("added_labels" in data) {
      // @ts-ignore
      window.ls?.externalLabelsAdded(data["added_labels"]);
    } else if ("deleted_label" in data) {
      // @ts-ignore
      window.ls?.externalLabelDeleted(data["deleted_label"]);
    } else if ("added_pii" in data) {
      // @ts-ignore
      window.ls?.externalPiiAdded(data["added_pii"]);
    } else if ("deleted_pii" in data) {
      // @ts-ignore
      window.ls?.externalPiiDeleted(data["deleted_pii"]);
    }
  }, []);

  const handleTaskMessage = React.useCallback(async (data: object) => {
    if (!("command" in data) || data["command"] !== "redacted") {
      return;
    }

    if ("region_ids" in data && Array.isArray(data["region_ids"])) {
      // @ts-ignore
      const areas = Array.from(window.ls?.annotationStore?.selected?.areas?.values() ?? []);

      data["region_ids"].forEach(rid => {
        if (typeof rid !== "string") {
          return;
        }

        // @ts-ignore
        const area = areas.find(r => {
          // @ts-ignore
          return r.id.split("#")[0] === rid;
        })

        if (area) {
          // @ts-ignore
          window.ls?.annotationStore?.selected?.deleteArea(area);
        }
      });

      // @ts-ignore
      window.ls?.setFlags({isApplyingRedact: true});

      // @ts-ignore
      window.ls?.updateAnnotation(undefined, () => {
        // @ts-ignore
        window.ls?.setFlags({isApplyingRedact: false});
      });
    }

    if ("reload" in data && Array.isArray(data["reload"])) {
      data["reload"].forEach(n => {
        if (typeof n !== "string") {
          return;
        }

        // @ts-ignore
        window.ls?.annotationStore?.names?.get(n)?.reload?.();
      });
    }

    toastSuccess("All redaction regions have been applied and removed.")
  }, []);

  React.useEffect(() => {
    const unsubscribeProject = onProjectMessage(project.id, handleProjectMessage);
    const unsubscribeTask = onTaskMessage(task.id, handleTaskMessage);

    return () => {
      unsubscribeProject();
      unsubscribeTask();
    }
  }, [handleProjectMessage, handleTaskMessage, onProjectMessage, onTaskMessage, project.id, task.id]);

  // if (isCheckingAudio) {
  //   return <AppLoading message={"Checking audio file..."}/>;
  // }

  if (isLoading) {
    return <AppLoading message={"Loading editor..."}/>;
  }

  if (error) {
    return <>{error}</>;
  }

  return (
    <div ref={rootRef}>
      <div style={{ textAlign: "center", padding: "1rem" }}>
        Initializing editor...
      </div>
    </div>
  );
}

const LSF = memo(BaseLSF, (p, n) => {
  return p.task.id === n.task.id;
})

export default LSF;
