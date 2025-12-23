import React from "react";
import useDebouncedEffect from "../useDebouncedEffect";

export type TProps = {
  scripts?: string[],
  styles?: string[],
  isAvailable: () => boolean,
}

export type TUseLibraryHook = {
  isLoading: boolean,
  isLoaded: boolean,
  error: string | null,
}

export default function useLibraryHook({scripts, styles, isAvailable}: TProps): TUseLibraryHook {
  const [isLoading, setLoading] = React.useState(false);
  const [isLoaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useDebouncedEffect(() => {
    if (isAvailable()) {
      setLoaded(true);
      return;
    }

    setLoading(true);
    const promises: Promise<void>[] = [];

    (scripts ?? []).forEach(s => {
      promises.push(new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';

        script.onload = () => {
          resolve();
        };

        script.onerror = (e) => {
          if (typeof e === "string") {
            setError(e);
          } else {
            setError("An error ocurred while loading library.")
          }
        };

        script.src = s;
        document.head.appendChild(script);
      }));
    });

    (styles ?? []).forEach(s => {
      promises.push(new Promise<void>((resolve) => {
        const link = document.createElement('link');
        link.rel = "stylesheet";
        link.type = "text/css";

        link.onload = () => {
          resolve();
        };

        link.onerror = (e) => {
          if (typeof e === "string") {
            setError(e);
          } else {
            setError("An error ocurred while loading library.")
          }
        };

        link.href = s;
        document.head.appendChild(link);
      }));
    });

    Promise.all(promises)
      .then(() => {
        setLoading(false);

        if (isAvailable()) {
          setLoaded(true);
        } else {
          setLoaded(false);
          setError("Failed to load library.");
        }
      });
  }, [scripts, styles, isAvailable]);

  return React.useMemo(() => {
    return {
      isLoading,
      isLoaded,
      error,
    };
  }, [
    isLoading,
    isLoaded,
    error,
  ]);
}
