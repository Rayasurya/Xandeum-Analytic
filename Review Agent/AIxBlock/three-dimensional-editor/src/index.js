import React from "react";
import ReactDOM from "react-dom";
import SseApp3d from "./SseApp3d";

window.TDE = function(props, element) {
    ReactDOM.render(<div className="tde-editor"><SseApp3d {...props} /></div>, element);
}
