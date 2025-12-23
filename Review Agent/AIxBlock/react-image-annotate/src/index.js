// @flow

import React from "react";
import ReactDOM from "react-dom";
import Annotator from "./Annotator";

window.RIA = function(props, element) {
  ReactDOM.render(<Annotator {...props} />, element);

  return () => {
    ReactDOM.unmountComponentAtNode(element);
  }
}
