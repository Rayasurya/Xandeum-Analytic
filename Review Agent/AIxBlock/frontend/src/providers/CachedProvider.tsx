import React, { useRef } from "react";
import { getCachedImage, someId } from "../utils/cachedImages";
export type TCachedProvider = {
  images: { [k: string]: string };
  setImage: (url: string) => void;
  getImage: (url: string,) => string;
  clearCached: (projectId: string,) => void;
};

export const CachedProviderContext = React.createContext<TCachedProvider>({
  images: {},
  setImage: () => { },
  getImage: () => '',
  clearCached: () => '',
});

export function CachedProvider(props: React.PropsWithChildren) {
  const [images, setImages] = React.useState<{ [k: string]: string }>({});
  const lastProjectId = useRef<string>('');

  const setImage = React.useCallback(
    (url: string) => {
      try {
        const cachedImage = document.createElement("img");
        cachedImage.setAttribute("src", url);
        cachedImage.onload = () => {
          const imgData = getCachedImage(cachedImage);
          try {
            setImages(img => ({ ...img, [`${someId(url)}`]: imgData }));
          } catch (error) {
            console.error(error);
          }
        };
      } catch (e) {
        console.error(e);
      }
    },
    []
  );

  const getImage = React.useCallback(
    (url: string,) => {
      return images[`${someId(url)}`] ?? '';
    },
    [images]
  );
  const clearCached = React.useCallback(
    (projectId: string) => {
      if (projectId !== lastProjectId.current) {
        setImages({})
      }
    },
    []
  );

  const providerValue = React.useMemo(
    () => ({
      images,
      setImage,
      getImage,
      clearCached,
    }),
    [
      images,
      setImage,
      getImage,
      clearCached,
    ]
  );

  return (
    <>
      <CachedProviderContext.Provider value={providerValue}>
        {props.children}
      </CachedProviderContext.Provider>
    </>
  );
}

export function useCachedImages(): TCachedProvider {
  return React.useContext(CachedProviderContext);
}
