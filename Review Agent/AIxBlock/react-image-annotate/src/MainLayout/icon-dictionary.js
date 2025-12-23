// @flow

import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowsAlt,
  faMousePointer,
  faExpandArrowsAlt,
  faGripLines,
  faTag,
  faPaintBrush,
  faCrosshairs,
  faDrawPolygon,
  faVectorSquare,
  faHandPaper,
  faSearch,
  faMask,
  faEdit,
  faChartLine,
  faMagic, faCircle,
  faTerminal,
  faMicrophone,
  faImage,
  faDotCircle,
  faDog,
} from "@fortawesome/free-solid-svg-icons"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew"
import { BiLinkAlt, BiSearch } from "react-icons/bi"
import AutoAnnotate from "./AutoAnnotate"
import Brush from "./Brush"
import Pen from "./Pen"
import Clone from "./Clone"
import Circle from "./Clone copy"
import { IconSelect, IconAutoAnnotate, IconBrush, IconCreateOval, IconCreatePoint, IconCreateBox, IconCreatePolygon, IconPan, IconErase, IconPolyline } from "../IconEditor"

const faStyle = { marginTop: 4, width: 16, height: 16, marginBottom: 4 }

export const iconDictionary = {
  select: () => <IconSelect />,
  "auto-annotate": () => <IconAutoAnnotate />,
  "cursor-click": () => <AutoAnnotate style={faStyle} />,
  brush: () => <IconBrush />,
  pen: () => <Pen style={faStyle} />,
  clone: () => <Clone style={faStyle} />,
  circle: () => <Circle style={faStyle} />,
  pan: () => (<FontAwesomeIcon style={faStyle} fixedWidth icon={faHandPaper} />),
  zoom: () => (
    <FontAwesomeIcon style={faStyle} fixedWidth icon={faSearch} />
  ),
  "show-tags": () => (
    <FontAwesomeIcon style={faStyle} fixedWidth icon={faTag} />
  ),
  "create-point": () => <IconCreatePoint />,
  "create-box": () => (
    <FontAwesomeIcon
      style={faStyle}
      fixedWidth
      icon={faVectorSquare}
    />
  ),
  "create-oval": () => <IconCreateOval />,
  "create-polygon": () => <IconCreatePolygon />,
  "create-expanding-line": () => (
    <FontAwesomeIcon style={faStyle} fixedWidth icon={faGripLines} />
  ),
  "create-line": () => (
    <FontAwesomeIcon style={faStyle} fixedWidth icon={faChartLine} />
  ),
  "show-mask": () => (
    <FontAwesomeIcon style={faStyle} fixedWidth icon={faMask} />
  ),
  "modify-allowed-area": () => (
    <FontAwesomeIcon style={faStyle} fixedWidth icon={faEdit} />
  ),
  "create-keypoints": AccessibilityNewIcon,
  window: FullscreenIcon,
  "create-link": () => <BiLinkAlt style={faStyle} />,
  search: () => <BiSearch style={faStyle} />,
  "prompt": () => (
    <FontAwesomeIcon style={faStyle} fixedWidth icon={faTerminal} />
  ),
  "voice": () => (
    <FontAwesomeIcon style={faStyle} fixedWidth icon={faMicrophone} />
  ),
  "image-ref": () => (
    <FontAwesomeIcon style={faStyle} fixedWidth icon={faImage} />
  ),
  "point-ref": () => (
    <FontAwesomeIcon style={faStyle} fixedWidth icon={faDotCircle} />
  ),
  "brush-tool": () => <Brush />,
  "eraser": () => <IconErase />,
  "create-polyline": () => <IconPolyline />,
  "create-skeleton": () => (
    <FontAwesomeIcon
      style={faStyle}
      fixedWidth
      icon={faDog}
    />
  ),
  "create-cuboid": () => <IconCreateBox />,
}

export default iconDictionary
