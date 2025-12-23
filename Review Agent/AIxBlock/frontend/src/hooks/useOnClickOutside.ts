import { useEffect, RefObject } from 'react';

function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      // Do nothing if clicking ref element itself
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      // Call the provided handler when clicking outside
      handler(event);
    };

    // Add a click event listener
    document.addEventListener('mousedown', listener);

    return () => {
      // Clean up the listener when the component unmounts
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
}

export default useOnClickOutside;
