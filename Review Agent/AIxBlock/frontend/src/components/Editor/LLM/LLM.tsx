import React, {useCallback} from "react";
import useLibraryHook from "@/hooks/editor/useLibraryHook";
import { TFromComponent } from "./types";
import EmptyContent from "../../EmptyContent/EmptyContent";

export type TLLMProps = {
  type: "editor" | "preview" | "form";
  runScript?: (props: TFromComponent) => void;
  logResponse?: string;
  onFormSubmit?: (formData: any) => void;
  preloadData?: TFromComponent;
  onLayoutUpdate?: (props: TFromComponent) => void;
};

export default function LLM({
  type,
  runScript,
  logResponse,
  onFormSubmit,
  preloadData = {
    components: [],
    layout: [],
    environments: [],
    code: "",
  },
  onLayoutUpdate,
}: TLLMProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const layoutRef = React.useRef<TFromComponent>(preloadData);
  const [forceReload, setSorceReload] = React.useState(0);
	const [formLayout, setFormLayout] = React.useState(preloadData);
  const { isLoading, isLoaded, error } = useLibraryHook({
    scripts: window.APP_SETTINGS.llmJS ? [window.APP_SETTINGS.llmJS] : [],
    styles: window.APP_SETTINGS.llmCSS ? [window.APP_SETTINGS.llmCSS] : [],
    isAvailable: () => Object.hasOwn(window, "LLM"),
  });

  const executeScript = React.useCallback((data: any) => {

  }, []);

  React.useEffect(() => {
		setFormLayout(layoutRef.current)
    setSorceReload(Math.random());
  }, [type]);

	const storeLayoutChange = useCallback((layout: TFromComponent) => {
		onLayoutUpdate?.(layout);
    layoutRef.current = layout;
  }, [onLayoutUpdate]);

  React.useEffect(() => {
    if (!isLoaded || !rootRef.current || !window.LLM) {
      return;
    }

    window.LLM(
      {
        type: type ?? "editor",
        runScript: executeScript,
        logResponse: logResponse ?? "",
        preloadData: {
          components: formLayout?.components ?? [],
          layout: formLayout?.layout ?? [],
          environments: formLayout?.environments ?? [],
          code: formLayout?.code ?? "",
        },
        onLayoutUpdate: storeLayoutChange,
      },
      rootRef.current
    );
  }, [isLoaded, rootRef, executeScript, type, logResponse, onFormSubmit, formLayout, storeLayoutChange]);

  if (isLoading) {
    return <EmptyContent message="Loading editor..." />;
  }

  if (error) {
    return <EmptyContent message={error} />;
  }

  return (
    <div ref={rootRef} key={`llm-${forceReload}`} style={{ height: "100%" }} />
  );
}
