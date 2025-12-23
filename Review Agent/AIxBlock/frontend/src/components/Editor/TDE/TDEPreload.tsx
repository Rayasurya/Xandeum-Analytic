import useLibraryHook from "@/hooks/editor/useLibraryHook";

export default function TDEPreload() {
  useLibraryHook({
    scripts: window.APP_SETTINGS.tdeJS ? [window.APP_SETTINGS.tdeJS] : [],
    styles: window.APP_SETTINGS.tdeCSS ? [window.APP_SETTINGS.tdeCSS] : [],
    isAvailable: () => Object.hasOwn(window, "TDE"),
  });

  return null;
}
