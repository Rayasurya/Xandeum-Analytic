import { Location } from "react-router-dom";
import { CHILDREN_STEPS, IMPORT_STEPS, ROUTE } from "./constants";

export const createEPoint = "/create-project";


export const isCreateStep = (location: Location<unknown>): boolean => {
  return location.pathname === createEPoint;
};

export const getPath = (url: string, index: number) => {
  const pathSegments = url.split('/');
  return pathSegments[pathSegments.length - index];
}

export const isSetupProject = (url: string) => {
  let parts = url.split('/');
  let firstPartName = parts[1];

  if (firstPartName === "first-time") {
    return true;
  }

  if (["train-and-deploy", "fine-tune-and-deploy", "deploy", "label-and-validate-data"].includes(firstPartName)) {
    if (parts.length > 3 && parts[3].length > 0) {
      return true;
    }

    if (parts.length > 2 && parts[2] === "create") {
      return true;
    }
  }

  if ((url === "/projects/") || (url === "/projects" && parts.length === 2) || ROUTE.includes(firstPartName)) {
    return false;
  } else {
    return true;
  }
}

export const getNextStep = (c: string, s: string) => {
  const step = CHILDREN_STEPS.find((item) => item.value === c);
  const index = step && CHILDREN_STEPS.indexOf(step);

  if (s === "settings" && step?.value === "crowdsource") {
    return {
      c: "import",
      s: "local"
    }
  }

  if (s === "import") {
    const step = IMPORT_STEPS.find((item) => item.value === c);
    const index = step && IMPORT_STEPS.indexOf(step);

    return {
      c: "import",
      s: index !== undefined && index + 1 < IMPORT_STEPS.length && IMPORT_STEPS[index + 1].value
    };
  }

  return {
    c: "settings",
    s: index !== undefined && index + 1 < CHILDREN_STEPS.length && CHILDREN_STEPS[index + 1].value
  };
}
