import {DependencyList, EffectCallback, useEffect} from "react";

export default function useDebouncedEffect(effect: EffectCallback, deps?: DependencyList, delay?: number) {
  useEffect(() => {
    const effectTimeout = setTimeout(() => {
      effect();
    }, delay ?? 100);

    return () => {
      clearTimeout(effectTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay]);
}
