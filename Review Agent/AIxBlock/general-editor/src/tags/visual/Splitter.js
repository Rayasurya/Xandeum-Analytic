import React, { useEffect, useMemo, useRef, useState } from "react";
import { types } from "mobx-state-tree";
import { observer } from "mobx-react";
import Registry from "../../core/Registry";
import "./Splitter.styl";

const Model = types.model({
  type: "splitter",
})
  .actions(() => ({
  }));

const SplitterModel = types.compose("Splitter", Model);

const HtxSplitter = observer(() => {
  const ref = useRef(null);
  const [turnedOn, setTurnedOn] = useState(false);

  const styles = useMemo(() => {
    return turnedOn ? {} : { display: "none" };
  }, [turnedOn]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    /** @type {HTMLDivElement} */
    const resizer = ref.current;

    /** @type {HTMLDivElement} */
    const parent = ref.current.parentElement;

    if (parent.style.display !== "flex") {
      console.warn("Splitter's parent must have 'display: flex'");
      return;
    }

    /** @type {HTMLDivElement} */
    const target = ref.current.previousElementSibling;

    if (!target) {
      console.warn("Splitter must be placed between two elements");
      return;
    }

    const isHorizontal = parent.style.flexDirection === "row";

    if (isHorizontal) {
      target.style.width = target.clientWidth + "px";
      resizer.classList.add("lsf-splitter--horizontal");
    } else {
      target.style.height = target.clientHeight + "px";
      resizer.classList.add("lsf-splitter--vertical");
    }

    target.style.flex = "";
    let mouseDownPos = null;
    let newVal = null;

    const timeout = setInterval(() => {
      if (!newVal) {
        return;
      }

      if (isHorizontal) {
        target.style.width = (target.clientWidth - (mouseDownPos - newVal)) + "px";
        mouseDownPos = newVal;
      } else {
        target.style.height = (target.clientHeight - (mouseDownPos - newVal)) + "px";
        mouseDownPos = newVal;
      }
    }, 33);

    /**
     * @param {MouseEvent} e
     */
    function mouseDown(e) {
      if (e.button !== 0) {
        return;
      }

      e.stopPropagation();
      mouseDownPos = isHorizontal ? e.clientX : e.clientY;
      resizer.classList.add("lsf-splitter--resizing");
    }

    /**
     * @param {MouseEvent} e
     */
    function mouseUp(e) {
      e.stopPropagation();
      resizer.classList.remove("lsf-splitter--resizing");
      mouseDownPos = null;
      newVal = null;
    }

    /**
     * @param {MouseEvent} e
     */
    function mouseMove(e) {
      if (!mouseDownPos) {
        return;
      }

      if (isHorizontal) {
        newVal = e.clientX;
      } else {
        newVal = e.clientY;
      }
    }

    resizer.addEventListener("mousedown", mouseDown);
    document.addEventListener("mouseup", mouseUp);
    document.addEventListener("mousemove", mouseMove);

    setTurnedOn(true);

    return () => {
      clearInterval(timeout);
      resizer.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("mouseup", mouseUp);
      document.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  return (
    <div className="lsf-splitter" ref={ref} style={styles} />
  );
});

Registry.addTag("splitter", SplitterModel, HtxSplitter);

export { HtxSplitter, SplitterModel };
