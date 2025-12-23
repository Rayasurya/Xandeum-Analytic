import useLibraryHook from "@/hooks/editor/useLibraryHook";

export default function LLMPreload() {
  useLibraryHook({
    scripts: window.APP_SETTINGS.llmJS ? [window.APP_SETTINGS.llmJS] : [],
    styles: window.APP_SETTINGS.llmCSS ? [window.APP_SETTINGS.llmCSS] : [],
    isAvailable: () => Object.hasOwn(window, "LLM"),
  });

  return null;
}
