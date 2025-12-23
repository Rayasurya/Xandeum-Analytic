import React from 'react';

import SseToolbar from "./common/SseToolbar";
import {
    CircleOutline,
    FileDownloadOutline,
    Gesture,
    Minus,
    Plus,
    PlusMinus,
    Redo,
    SquareOutline,
    Undo,
    PlusCircle,
    TrashCan,
    ArrowLeft,
} from 'mdi-material-ui';
import { Button, IconButton, MenuItem, Select, Tooltip } from "@material-ui/core";

export default class SseToolbar3d extends SseToolbar {

    constructor(props) {
        super(props);
        this.state = {
            pointSize: 2,
            selectedAnnotationId: props.annotation?.id ?? -1,
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // console.log(this.props.annotation?.id, " !== ", prevProps.annotation?.id);
        if (this.props.annotation?.id !== prevProps.annotation?.id) {
            this.setState({selectedAnnotationId: this.props.annotation?.id ?? -1});
        }
    }

    componentDidMount() {
        super.componentDidMount();


        this.addCommand("selectorCommand", "Lasso Selector", 1, "H", "selector", Gesture, undefined, undefined);
        this.addCommand("rectangleCommand", "Rectangle Selector", 1, "J", "rectangle", SquareOutline, undefined, undefined);
        this.addCommand("circleCommand", "Circle Selector", 1, "K", "circle", CircleOutline, undefined, undefined);

        this.addCommand("selectionAddCommand", "Selection Mode: Add", 2, "Y", "selection-mode-add", Plus, undefined, undefined);
        this.addCommand("selectionToggleCommand", "Selection Mode: Toggle", 2, "U", "selection-mode-toggle", PlusMinus, undefined, undefined);
        this.addCommand("selectionRemoveCommand", "Selection Mode: Remove", 2, "I", "selection-mode-remove", Minus, undefined, undefined);

        this.addCommand("moreClusterCommand", "More Cluster", false, "ctrl+up", "cluster-more", Plus, undefined, "Ctrl \u2191");
        this.addCommand("lessClusterCommand", "Less Cluster", false, "ctrl+down", "cluster-less", Minus, undefined, "Ctrl \u2193");


        this.addCommand("autoFilterCommand", "Auto Filter", false, "L", "autoFilter-checkbox");
        this.addCommand("autoFocusCommand", "Auto Focus", false, "S", "autoFocus-checkbox");
        this.addCommand("globalboxCommand", "Bounding Box", false, "G", "globalbox-checkbox");
        this.addCommand("selectionOutlineCommand", "Selection Outline", false, "V", "selectionOutline-checkbox");

        this.addCommand("undoCommand", "Undo", false, "Ctrl+Z", "undo", Undo, "disabled");
        this.addCommand("redoCommand", "Redo", false, "Ctrl+Y", "redo", Redo, "disabled");
        this.addCommand("downloadTextCommand", "PCD Output as Text", false, "", "downloadText", FileDownloadOutline);
        this.addCommand("downloadFileCommand", "PCD Output as File", false, "", "downloadFile", FileDownloadOutline);
        this.sendMsg("selector");
        this.sendMsg("selection-mode-add");
    }

    render() {
        return (
            <div className="hflex flex-justify-content-space-around sse-toolbar toolbar-3d no-shrink">
                {/*
                <div className="vflex flex-justify-content-center" style={{ paddingTop: 16 }}>
                    <Button startIcon={<ArrowLeft/>} size="large" title="Return to tasks list" onClick={() => {
                        this.props.onClose && this.props.onClose();
                    }}>
                        Back
                    </Button>
                </div>
                */}
                <div className="vflex flex-justify-content-space-between" style={{ minWidth: 320 }}>
                    <div className="tool-title" style={{ paddingRight: 68 }}>Annotations</div>
                    <div
                        className="hflex flex-align-items-center"
                        style={{ paddingBottom: 12, paddingTop: 8, gap: 4 }}
                    >
                        <Select
                            displayEmpty={true}
                            fullWidth={true}
                            onChange={(ev, item) => {
                                this.props.onSelectAnnotation && this.props.onSelectAnnotation(item.props.value);
                            }}
                            renderValue={(v) => {
                                if (this.props.annotations?.length === 0) return "-- No annotation --";
                                if (!this.props.annotation) return "-- Select annotation --";

                                return this.props.annotation.id
                                    + " / " + this.props.annotation.created_username
                                    + " / " + this.props.annotation.created_ago;
                            }}
                            tabIndex="-1"
                            value={this.state.selectedAnnotationId}
                            variant="outlined"
                            MenuProps={{
                                onKeyDown: ev => {
                                    ev.stopPropagation();
                                },
                                style: {
                                    zIndex: 100001,
                                },
                            }}
                        >
                            {this.props.annotations.map(a => (
                                <MenuItem key={"annotation-" + a.id} value={a.id}>
                                    #{a.id} / {a.created_username} / {a.created_ago}
                                </MenuItem>
                            ))}
                        </Select>
                        <IconButton
                            onClick={() => this.props.createAnnotation && this.props.createAnnotation()}
                            size="small"
                            title="Create new annotation"
                        >
                            <PlusCircle/>
                        </IconButton>
                        <IconButton
                            size="small"
                            title="Delete current annotation"
                            sx={{display: this.props.annotation ? "" : "none"}}
                            onClick={() => this.props.deleteAnnotation && this.props.deleteAnnotation()}
                        >
                            <TrashCan/>
                        </IconButton>
                    </div>
                </div>
                <div className="vflex">
                    <div className="tool-title">Selection Tool</div>
                    <div className="hflex">
                        {this.renderCommand("selectorCommand")}
                        {this.renderCommand("rectangleCommand")}
                        {this.renderCommand("circleCommand")}
                    </div>
                </div>
                <div className="vflex">
                    <div className="tool-title">Selection Mode</div>
                    <div className="hflex">
                        {this.renderCommand("selectionAddCommand")}
                        {this.renderCommand("selectionToggleCommand")}
                        {this.renderCommand("selectionRemoveCommand")}
                    </div>
                </div>
                <div className="vflex">
                    <div className="tool-title">View Interaction</div>
                    <div className="v group">
                        {this.renderCheckbox("autoFocusCommand", false)}
                        {this.renderCheckbox("autoFilterCommand", false)}
                    </div>
                </div>
                <div className="vflex">
                    <div className="tool-title">Visual Helpers</div>
                    <div className="v group">
                        {this.renderCheckbox("selectionOutlineCommand", true)}
                        {this.renderCheckbox("globalboxCommand", true)}
                    </div>
                </div>
                {/*<div className="vflex">
                    <div className="tool-title">PCD Output</div>
                    <div className="hflex">
                        {this.renderCommand("downloadTextCommand")}
                        {this.renderCommand("downloadFileCommand")}
                    </div>
                </div>*/}
            </div>
        )
    }
}