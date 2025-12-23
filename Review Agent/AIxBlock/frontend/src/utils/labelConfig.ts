export type TParsedLabelConfig = {
  labelsColorMap: {[k: string]: string};
  root: Element;
  labelsRoots: Element[];
  doc: XMLDocument;
  labels: string[];
  example: string | null;
  skeletonList: {[k: string]: string};
  addLabel: (type: string, label: string) => void;
  deleteLabel: (type: string, label: string) => void;
  languagePairs: Element[];
}

export const SUPPORTED_LABEL_TAGS = [
  "RectangleLabels",
  "PolygonLabels",
  "KeyPointLabels",
  "Labels",
  "BrushLabels",
  "HyperTextLabels",
  "TimeSeriesLabels",
  "ParagraphLabels",
  "Choices",
  "SkeletonLabels",
  "CuboidLabels",
  "PolylineLabels",
  "ElipLabels",
]

export function hasLabelsRoot(labelConfig: string): boolean {
  const lc = labelConfig.toLowerCase();
  let isFound = false;

  SUPPORTED_LABEL_TAGS.forEach(t => {
    if (isFound) {
      return;
    }

    if (lc.indexOf("<" + t.toLowerCase()) > -1) {
      isFound = true;
    }
  });

  return isFound;
}

export function parseLabels(labelConfig?: string | null): TParsedLabelConfig {
  if (!labelConfig) {
    return {
      doc: new XMLDocument(),
      root: document.createElement("View"),
      labels: [],
      labelsRoots: [],
      labelsColorMap: {},
      example: null,
      skeletonList: {},
      addLabel: () => void 0,
      deleteLabel: () => void 0,
      languagePairs: [],
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(labelConfig, "text/xml");
  let root = doc.querySelector("View");

  if (!root) {
    root = doc.createElement("View");
  }

  // Get all label tags
  let labelsRoots = Array.from(doc.querySelectorAll(SUPPORTED_LABEL_TAGS.join(",")));

  const labelsColorMap: { [k: string]: string } = {};
  const labels: string[] = [];
  const skeletonList: {[k:string]: any} = {};
  
  labelsRoots.forEach(labelsRoot => {
    // Append the element to the root if it's not already there
    if (!labelsRoot.parentNode) {
      root?.append(labelsRoot);
    }

    const isSkeleton = labelsRoot.tagName.toLowerCase() === "skeletonlabels";

    // Get the labels and colors from the element
    Array.from(labelsRoot.children).forEach(n => {
      const label = (n.getAttribute("value") ?? "").trim();

      if (label.length === 0) {
        return;
      }

      labels.push(label);
      labelsColorMap[label] = n.getAttribute("background") ?? "#FFFFFF";

      if (isSkeleton && n.hasAttribute("data")) {
        try {
          skeletonList[label] = JSON.parse(n.getAttribute("data") ?? "{}");
        } catch (e) {
          if (window.APP_SETTINGS.debug) {
            console.error(e);
          }
        }
      }
    });
  });

  let example = root.querySelector(".example")?.innerHTML.trim() ?? null;

  function addLabel(type: string, label: string) {
    const labelRoot = Array.from(labelsRoots).find(lr => lr.tagName.toLowerCase() === type.toLowerCase());

    if (!labelRoot) {
      return;
    }

    const newLabel = labelRoot.tagName.toLowerCase() === "choices"
      ? doc.createElement("Choice")
      : doc.createElement("Label");

    newLabel.setAttribute("value", label);
    labelRoot.prepend(newLabel);
  }

  function deleteLabel(type: string, label: string) {
    const labelRoot = Array.from(labelsRoots).find(lr => lr.tagName.toLowerCase() === type.toLowerCase());

    if (!labelRoot) {
      return;
    }

    const eleLabel = labelRoot.querySelector(`[value="${label}"]`);

    if (eleLabel) {
      labelRoot.removeChild(eleLabel);
    }
  }

  const languagePairs = Array.from(doc.querySelectorAll("LanguagePair"));

  return { doc, root, labels, labelsRoots, labelsColorMap, example, skeletonList, addLabel, deleteLabel, languagePairs };
}
