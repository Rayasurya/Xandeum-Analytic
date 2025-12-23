import useLibraryHook from "@/hooks/editor/useLibraryHook";

export default function RIAPreload() {
  useLibraryHook({
    scripts: window.APP_SETTINGS.riaJS ? [window.APP_SETTINGS.riaJS] : [],
    styles: window.APP_SETTINGS.riaCSS ? [window.APP_SETTINGS.riaCSS] : [],
    isAvailable: () => Object.hasOwn(window, "RIA"),
  });

  return null;
}
