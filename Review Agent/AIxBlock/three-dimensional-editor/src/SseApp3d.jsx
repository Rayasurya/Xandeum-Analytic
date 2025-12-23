import { MuiThemeProvider } from '@material-ui/core/styles';
import { Autorenew } from 'mdi-material-ui';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import tippy from "tippy.js";
import SseBottomBar from "./common/SseBottomBar";
import SseClassChooser from "./common/SseClassChooser";
import SseConfirmationDialog from "./common/SseConfirmationDialog";
import SseSnackbar from "./common/SsePopup";
import SseSetOfClasses from "./common/SseSetOfClasses";
import SseTheme from "./common/SseTheme";
import SseCameraToolbar from "./SseCameraToolbar";
import SseEditor3d from "./SseEditor3d";
import SseObjectToolbar from "./SseObjectToolbar";
import SseToolbar3d from "./SseToolbar3d";
import SseTooltips3d from "./SseTooltips3d";
import SseMsg from "./common/SseMsg";
import "./styles/layout.css";
import "./styles/main.css";
import "./styles/rc-slide.css";
import "./styles/tippy.css";

const theme = new SseTheme().theme;

const SseApp3d = (props) => {
    const [annotation, setAnnotation] = useState(null);
    const [annotations, setAnnotations] = useState(props.task?.annotations ?? []);
    const [annotationRefresh, setAnnotationRefresh] = useState("");
    const [classes, setClasses] = useState(null);
    const [isReady, setReady] = useState(false);
    const [mdi, setMdi] = useState(null);
    const [msg] = useState({});

    const triggerRefreshAnnotation = useCallback(() => {
        setAnnotationRefresh(Math.random().toString().substring(2, 6));
    }, []);

    const createAnnotation = useCallback((result = []) => {
        msg.sendMsg("status", { message: "Creating annotation..." });

        fetch(`/api/tasks/${props.task.id}/annotations/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ result }),
        })
            .then(r => r.json())
            .then(obj => {
                setAnnotations([...annotations, obj]);
                setAnnotation(obj);
                msg.sendMsg("status", { message: `Annotation #${obj.id} created at ${(new Date()).toLocaleString()}` });
                return obj;
            })
            .catch(e => {
                msg.sendMsg("status", { message: "An error occurred while saving annotation. Error: " + e.message });
            });
    }, [annotations, msg, props.task.id]);

    const updateAnnotation = useCallback((result = []) => {
        if (!annotation.id) {
            return;
        }

        msg.sendMsg("status", { message: "Saving annotation..." });

        fetch(`/api/annotations/${annotation.id}?taskID=${props.task.id}&project=${props.task.project}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ result: result }),
        })
            .then(r => r.json())
            .then(async obj => {
                setAnnotation(obj);
                triggerRefreshAnnotation();
                msg.sendMsg("status", { message: `Annotation #${annotation.id} updated at ${(new Date()).toLocaleString()}` });
            })
            .catch(e => {
                msg.sendMsg("status", { message: "An error occurred while saving annotation. Error: " + e.message });
            });
    }, [annotation?.id, msg, props.task.id, props.task.project, triggerRefreshAnnotation]);

    const deleteAnnotation = useCallback(() => {
        if (!annotation?.id) {
            return;
        }

        msg.sendMsg("status", { message: "Deleting annotation..." });

        fetch(`/api/annotations/${annotation.id}?taskID=${props.task.id}&project=${props.task.project}`, { method: "DELETE" })
            .then(() => {
                msg.sendMsg("status", { message: `Annotation #${annotation.id} deleted at ${(new Date()).toLocaleString()}` });
                const list = annotations.filter(a => a.id !== annotation.id);
                setAnnotations(list);
            });
    }, [annotation?.id, annotations, msg, props.task.id, props.task.project]);

    useEffect(() => {
        fetch(`/api/tasks/${props.task.id}?project=${props.task.project}`, {
            headers: { "Content-Type": "application/json" },
        })
            .then(r => r.json())
            .then(r => {
                setAnnotations(r.annotations);
            })
            .catch(e => {
                msg.sendMsg("status", { message: "An error occurred while saving annotation. Error: " + e.message });
            });
    }, [annotationRefresh, msg, props.task.id, props.task.project]);

    useEffect(() => {
        setClasses([
            new SseSetOfClasses({
                name: "Labels",
                objects: [{ label: "(Unknown)", color: "#FFFFFF" }, ...props.classes],
            })
        ]);
    }, [props.classes]);

    useEffect(() => {
        import('mdi-material-ui')
            .then(r => {
                setMdi(r);
                setReady(true);
            });
    }, []);

    useEffect(() => {
        if (annotations.length > 0) {
            setAnnotation(annotations[annotations.length - 1]);
        } else {
            setAnnotation(null);
        }
    }, [annotation, annotations]);

    useEffect(() => {
        if (!props.task?.annotations) return;
        setAnnotations(props.task?.annotations);
    }, [props.task?.annotations]);

    useEffect(() => {
        SseMsg.register(msg);
        msg.onMsg("delete-end", deleteAnnotation);
        msg.onMsg("save-annotation", (result) => {
            if (annotation) {
                updateAnnotation([result]);
            } else {
                createAnnotation([result]);
            }
        });

        return () => {
            SseMsg.unregister(msg);
        }
    }, [msg, deleteAnnotation, annotation, updateAnnotation, createAnnotation]);

    useLayoutEffect(() => {
        setTimeout(() => {
            tippy('.tde-editor [title]', {
                theme: 'sse',
                arrow: true,
                delay: [200, 0]
            });
        }, 2000);
    }, []);

    const toolbar = useMemo(() => {
        return (
            <SseToolbar3d
                annotation={annotation}
                annotations={annotations}
                createAnnotation={createAnnotation}
                deleteAnnotation={() => msg.sendMsg("delete-start")}
                onClose={props.onClose}
                onSelectAnnotation={v => {
                    setAnnotation(annotations.find(a => a.id === v) ?? null);
                }}
            />
        );
    }, [annotation, annotations, createAnnotation, msg, props.onClose]);

    const editor = useMemo(() => {
        return (
            <SseEditor3d
                annotation={annotation}
                imageUrl={props.imageUrl}
                labels={props.classes}
            />
        );
    }, [annotation, props.imageUrl, props.classes]);

    if (!classes || !isReady || !mdi) return null;

    return (
        <div className="w100 h100">
            <SseTooltips3d/>
            <MuiThemeProvider theme={theme}>
                <div className="w100 h100 editor">
                    <div className="vflex w100 h100 box1">
                        {toolbar}
                        <div className="hflex grow box2 h0">
                            <SseClassChooser mode="3d" classesSets={classes} mdi={mdi}/>
                            <div className="vflex grow relative">
                                <div className="hflex grow">
                                    <div id="canvasContainer" className="grow relative">
                                        {editor}
                                        <div id="waiting" className="hflex flex-align-items-center absolute w100 h100">
                                            <div className="grow vflex flex-align-items-center">
                                                <Autorenew/>
                                            </div>
                                        </div>
                                    </div>
                                    <SseCameraToolbar/>
                                </div>
                                <SseObjectToolbar/>
                            </div>
                        </div>
                        <SseBottomBar appProps={{ tags: { value: [] } }}/>
                    </div>
                    <SseSnackbar/>
                    <SseConfirmationDialog
                        startMessage="delete-start"
                        endMessage="delete-end"
                        title="Delete annotation"
                        text="This will delete current annotation, are you sure?">
                    </SseConfirmationDialog>
                    <SseConfirmationDialog
                        startMessage="reset-start"
                        endMessage="reset-end"
                        title="Segmentation Reset"
                        text="This will remove all existing polygons and tags, are you sure?">
                    </SseConfirmationDialog>
                </div>
            </MuiThemeProvider>
        </div>
    );
};

export default SseApp3d;
