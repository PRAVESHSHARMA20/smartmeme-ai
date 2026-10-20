import * as React from "react";

export function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOutside();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOutside]);

  return ref;
}
