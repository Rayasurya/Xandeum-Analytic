import { useEffect, useState } from "react";

type Ref = React.RefObject<HTMLDivElement>;

export const useScrollbarVisibility = (ref1: Ref, ref2: Ref) => {
  const [isScrollbarVisible, setIsScrollbarVisible] = useState<boolean>(false);

  useEffect(() => {
    const checkScrollbarVisibility = () => {
      if (ref1.current && ref2.current) {
        const h1 = ref1.current.clientHeight;
        const h2 = ref2.current.clientHeight;
        setIsScrollbarVisible(h2 > h1 - 67);
      }
    };

    checkScrollbarVisibility();

    const resizeObserver = new ResizeObserver(checkScrollbarVisibility);
    if (ref1.current && ref2.current) {
      resizeObserver.observe(ref1.current);
      resizeObserver.observe(ref2.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref1, ref2]);

  return isScrollbarVisible;
};
