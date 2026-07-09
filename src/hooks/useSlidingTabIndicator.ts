import { useRef, useState, useEffect } from "react";

interface IndicatorStyle {
  left: number;
  width: number;
}

export function useSlidingTabIndicator<T extends string>(activeTab: T) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<IndicatorStyle>({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      const left  = el.offsetLeft;
      const width = el.offsetWidth;
      setIndicator((prev) =>
        prev.left === left && prev.width === width ? prev : { left, width },
      );
    }
  }, [activeTab]);

  const getTabRef = (id: string) => (el: HTMLButtonElement | null) => {
    tabRefs.current[id] = el;
    if (el && id === activeTab) {
      const left  = el.offsetLeft;
      const width = el.offsetWidth;
      setIndicator((prev) =>
        prev.left === left && prev.width === width ? prev : { left, width },
      );
    }
  };

  return { getTabRef, indicator };
}
