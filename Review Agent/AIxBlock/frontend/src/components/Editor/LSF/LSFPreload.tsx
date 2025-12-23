import useLibraryHook from "@/hooks/editor/useLibraryHook";

export default function LSFPreload() {
  useLibraryHook({
    scripts: [window.APP_SETTINGS.lsfJS],
    styles: [window.APP_SETTINGS.lsfCSS],
    isAvailable: () => Object.hasOwn(window, "AIxBlock"),
  });

  return null;
}
