import "./SkeletonBox.scss";
import {CSSProperties} from "react";

export default function SkeletonBox({style}: {style?: CSSProperties}) {
  return (
    <div className="c-skeleton-box" style={style} />
  )
}
