import {useCallback, useLayoutEffect, useState} from "react";

export interface DimensionObject {
  width: number;
  height: number;
  top: number;
  left: number;
  x: number;
  y: number;
  right: number;
  bottom: number;
}

export type UseDimensionsHook = [
  (node: HTMLElement) => void,
    {} | DimensionObject,
  HTMLElement
];

export interface UseDimensionsArgs {
  liveMeasure?: boolean;
}

function getDimensionObject(node: HTMLElement): DimensionObject {
  const rect = node.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height,
    top: "x" in rect ? rect.x : rect.top,
    left: "y" in rect ? rect.y : rect.left,
    x: "x" in rect ? rect.x : rect.left,
    y: "y" in rect ? rect.y : rect.top,
    right: rect.right,
    bottom: rect.bottom
  };
}

function useDimensions({liveMeasure = true}: UseDimensionsArgs = {}): UseDimensionsHook {
  const [dimensions, setDimensions] = useState({});
  const [node, setNode] = useState(null);

  const ref = useCallback(node => {
    setNode(node);
  }, []);

  useLayoutEffect(() => {
    if (node) {
      let unmounted = false;

      const measure = () =>
        window.requestAnimationFrame(() => {
          if (unmounted) return;
          setDimensions(getDimensionObject(node));
        });
      measure();

      if (liveMeasure) {
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure);

        return () => {
          unmounted = true;
          window.removeEventListener("resize", measure);
          window.removeEventListener("scroll", measure);
        };
      }

      return () => unmounted = true;
    }
  }, [node]);

  return [ref, dimensions, node];
}

export default useDimensions;
