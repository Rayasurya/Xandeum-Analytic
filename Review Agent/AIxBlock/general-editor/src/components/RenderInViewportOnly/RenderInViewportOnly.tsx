import React, { useEffect, useRef, useState } from "react";

export default function RenderInViewportOnly({ placeholderStyle, Component, props, checkEvent = "scroll" }: {
  placeholderStyle?: React.CSSProperties,
  Component: React.ComponentType,
  props: React.ComponentProps<any>,
  checkEvent: string,
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function checkVisibility() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();

      setInView(rect.top < window.innerHeight && rect.left < window.innerWidth);
    }

    window.addEventListener(checkEvent, checkVisibility);
    checkVisibility();

    return () => {
      window.removeEventListener(checkEvent, checkVisibility);
    };
  }, []);

  if (inView) {
    return <Component {...props} domRef={ref} />;
  }
  
  return <div ref={ref} style={placeholderStyle} />;
}