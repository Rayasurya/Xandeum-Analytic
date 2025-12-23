// @flow

import type {
  MainLayoutImageAnnotationState,
  Action,
} from "../../MainLayout/types"
import { setIn } from "seamless-immutable"
import getActiveImage from "./get-active-image"

export default (state: MainLayoutImageAnnotationState, action: Action) => {
  const { currentImageIndex, pathToActiveImage, activeImage } =
    getActiveImage(state)

  switch (action.type) {
    case "IMAGE_OR_VIDEO_LOADED": {
      state = setIn(state, ["images", currentImageIndex, "base64"], action.metadata.base64);
      return setIn(state, ["images", currentImageIndex, "pixelSize"], {
        w: action.metadata.naturalWidth,
        h: action.metadata.naturalHeight,
      })
    }
  }
  return state
}
