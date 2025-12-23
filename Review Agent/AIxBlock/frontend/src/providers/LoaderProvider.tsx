import React from "react";
import Loader, {TLoaderRef} from "../components/Loader/Loader";
import {useLocation} from "react-router-dom";

export type TLoaderProvider = {
  createLoader: (text: string) => (immediately?: boolean) => void,
  setTop: (top: number) => void,
  setLeft: (left: number) => void,
  waitingForPromise: (promise: Promise<any>, text: string) => void,
}

export const LoaderContext = React.createContext<TLoaderProvider>({
  createLoader: () => () => void 0,
  setTop: () => () => void 0,
  setLeft: () => () => void 0,
  waitingForPromise: () => void 0,
});

export default function LoaderProvider(props: React.PropsWithChildren) {
  const loading = React.useRef<{ id: string, text: string }[]>([]);
  const hideTimeout = React.useRef<NodeJS.Timeout>();
  const loaderRef = React.useRef<TLoaderRef | null>(null);
  const location = useLocation();

  React.useEffect(() => {
    loaderRef.current?.hideImmediately();
  }, [location]);

  const checkState = React.useCallback((immediately?: boolean) => {
    if (!loaderRef.current) {
      return;
    }

    clearTimeout(hideTimeout.current);

    if (loading.current.length > 0) {
      loaderRef.current.show();
      loaderRef.current.setText(loading.current[0].text);
      loaderRef.current.setLoading(true);
    } else {
      if (immediately) {
        loaderRef.current?.hideImmediately();
      } else {
        hideTimeout.current = setTimeout(() => {
          loaderRef.current?.hide();
        }, 150);
      }
      loaderRef.current.setLoading(false);
    }
  }, []);

  const createLoader = React.useCallback((text: string) => {
    const id = Math.random().toString().substring(2, 6);
    loading.current.push({id, text});
    checkState();

    return (immediately?: boolean) => {
      loading.current = loading.current.filter(v => v.id !== id);
      checkState(immediately);
    }
  }, [checkState]);

  const setLeft = React.useCallback((left: number) => {
    loaderRef.current?.setLeft(left);
  }, []);

  const setTop = React.useCallback((top: number) => {
    loaderRef.current?.setTop(top);
  }, []);

  const waitingForPromise = React.useCallback((promise: Promise<any>, text: string) => {
    const closeLoader = createLoader(text);
    promise.finally(() => {
      closeLoader();
    })
  }, [createLoader]);

  React.useEffect(() => {
    return () => {
      loaderRef.current?.hideImmediately();
    }
  }, [createLoader]);

  return (
    <>
      <LoaderContext.Provider value={{
        createLoader,
        setLeft,
        setTop,
        waitingForPromise,
      }}>
        {props.children}
      </LoaderContext.Provider>
      <Loader ref={r => loaderRef.current = r}/>
    </>
  );
}

export function useLoader(): TLoaderProvider {
  return React.useContext(LoaderContext);
}

export function useBooleanLoader(value: boolean, text: string) {
  const {createLoader} = useLoader();
  const loaderRef = React.useRef<Function | null>(null);

  const closeLoader = React.useCallback((immediately?: boolean) => {
    if (loaderRef.current) {
      loaderRef.current(immediately);
      loaderRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (value) {
      if (!loaderRef.current) {
        loaderRef.current = createLoader(text);
      }
    } else {
      if (loaderRef.current) {
        loaderRef.current();
        loaderRef.current = null;
      }
    }

    return closeLoader;
  }, [createLoader, value, text, closeLoader]);

  React.useEffect(() => {
    return () => {
      closeLoader(true);
    }
  }, [closeLoader]);
}

export function usePromiseLoader() {
  const mounted = React.useRef<boolean>(true);
  const [promises, setPromises] = React.useState<{id: string, promise: Promise<any>, text: string}[]>([]);
  useBooleanLoader(promises.length > 0, promises.length > 0 ? promises[promises.length - 1].text : "Loading...");

  const addPromise = React.useCallback((promise: Promise<any>, text: string) => {
    setPromises(l => {
      const id = Math.random().toString().substring(2, 8);

      promise.finally(() => {
        if (!mounted.current) {
          return;
        }

        setPromises(l => l.filter(p => p.id !== id));
      });

      return [...l, {id, promise, text}];
    });
  }, []);

  React.useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    }
  }, []);

  return React.useMemo(() => ({
    addPromise,
  }), [
    addPromise,
  ]);
}
