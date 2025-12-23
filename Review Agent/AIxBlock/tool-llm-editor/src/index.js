import React from "react"
import ReactDOM from "react-dom"
import EditorPage from "./features/EditorPage"

window.LLM = function (props, element) {
  ReactDOM.render(<EditorPage {...props} />, element)
}
