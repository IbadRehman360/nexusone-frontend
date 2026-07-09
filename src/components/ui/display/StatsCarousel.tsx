"use client";

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatsCard from "./StatsCard";
import type { StatsCardProps } from "./StatsCard";

interface StatsCarouselProps {
  cards: StatsCardProps[];
}

export function StatsCarousel({ cards }: StatsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(4);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const isNavigating = useRef(false);

  // Set cols immediately before paint to avoid flash, then track via ResizeObserver
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.getBoundingClientRect().width;
    const c = w < 400 ? 1 : w < 600 ? 2 : w < 750 ? 3 : 4;
    setCols(c);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const c = w < 400 ? 1 : w < 600 ? 2 : w < 750 ? 3 : 4;
      setCols(c);
      setIndex((prev) => Math.min(prev, Math.max(0, cards.length - c)));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  const maxIndex = Math.max(0, cards.length - cols);
  const canPrev  = index > 0;
  const canNext  = index < maxIndex;
  const needsNav = maxIndex > 0;

  const go = useCallback((dir: 1 | -1) => {
    isNavigating.current = true;
    setDirection(dir);
    setIndex((p) => Math.min(maxIndex, Math.max(0, p + dir)));
  }, [maxIndex]);

  const visible = cards.slice(index, index + cols);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">

        {/* Prev — only shown when there are previous pages */}
        {canPrev && (
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="shrink-0 w-8 h-8 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70 hover:bg-muted/20 flex items-center justify-center transition-all duration-200"
          >
            <ChevronLeft size={15} />
          </button>
        )}

        {/* Cards viewport — overflow-visible so hover lift isn't clipped */}
        <div ref={containerRef} className="flex-1 min-w-0 overflow-visible py-2">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={isNavigating.current ? `nav-${index}` : 'static'}
              custom={direction}
              variants={{
                enter:  (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit:   (d: number) => ({ x: d > 0 ? -50 : 50, opacity: 0 }),
              }}
              initial={isNavigating.current ? "enter" : false}
              animate="center"
              exit="exit"
              onAnimationComplete={() => { isNavigating.current = false; }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {visible.map((card) => (
                <StatsCard key={card.title} {...card} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next — only shown when there are more pages */}
        {canNext ? (
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="shrink-0 w-8 h-8 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70 hover:bg-muted/20 flex items-center justify-center transition-all duration-200"
          >
            <ChevronRight size={15} />
          </button>
        ) : (
          needsNav && <div className="shrink-0 w-8" />
        )}

      </div>

      {/* Dots */}
      {needsNav && (
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              aria-label={`Page ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === index
                  ? "w-2 h-2 bg-[rgb(var(--info))] border-2 border-[rgb(var(--info))]"
                  : "w-2 h-2 bg-border/60 hover:bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
