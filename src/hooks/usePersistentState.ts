import { useEffect, useRef, useState } from "react";

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const isHydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    isHydrated.current = true;
  }, [key]);

  useEffect(() => {
    if (!isHydrated.current) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }, 50);
    return () => clearTimeout(id);
  }, [key, value]);

  return [value, setValue] as const;
}
