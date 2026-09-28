import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { SetupDTO } from "@desklab/shared";
import { Card } from "./Card";
import { Price } from "./Price";
import { SetupImage } from "./ProductImage";

function usePerView(): number {
  const [perView, setPerView] = useState(1);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = (): void => setPerView(mq.matches ? 2 : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return perView;
}

// Carrusel editorial sin autoplay ni librerías: scroll-snap + botones.
// 2 visibles en desktop, 1 en mobile (swipe nativo), avance de uno en uno.
export function SetupCarousel({ setups }: { setups: SetupDTO[] }): JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);
  const perView = usePerView();
  const [index, setIndex] = useState(0);
  const pages = Math.max(1, setups.length - perView + 1);

  useEffect(() => {
    setIndex((i) => Math.min(i, pages - 1));
  }, [pages]);

  const step = useCallback((): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const card = track.querySelector<HTMLElement>(":scope > *");
    if (!card) return 0;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || "0");
    return card.offsetWidth + (Number.isNaN(gap) ? 0 : gap);
  }, []);

  const go = useCallback(
    (next: number): void => {
      const clamped = Math.max(0, Math.min(next, pages - 1));
      const track = trackRef.current;
      const s = step();
      if (track && s > 0) {
        track.scrollTo({ left: clamped * s, behavior: "smooth" });
      }
      setIndex(clamped);
    },
    [pages, step],
  );

  function onScroll(): void {
    const track = trackRef.current;
    const s = step();
    if (!track || s <= 0) return;
    setIndex(Math.max(0, Math.min(pages - 1, Math.round(track.scrollLeft / s))));
  }

  function onKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "ArrowLeft") go(index - 1);
  }

  return (
    <div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Setup anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white disabled:opacity-40"
        >
          <span aria-hidden>←</span>
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === pages - 1}
          aria-label="Setup siguiente"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white disabled:opacity-40"
        >
          <span aria-hidden>→</span>
        </button>
      </div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Setups destacados"
        className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {setups.map((setup) => (
          <article
            key={setup.id}
            aria-label={setup.name}
            className="w-full shrink-0 snap-start md:w-[calc(50%-0.75rem)]"
          >
            <Card>
              <SetupImage slug={setup.slug} name={setup.name} />
              <p className="mt-4 text-sm text-ink/60">
                {setup.style} · {setup.use}
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold">
                <Link to={`/setup/${setup.slug}`} className="hover:underline">
                  {setup.name}
                </Link>
              </h3>
              <div className="mt-3 flex items-center justify-between">
                <Price cents={setup.totalCents} />
                <Link
                  to={`/setup/${setup.slug}`}
                  className="text-sm font-medium hover:underline"
                >
                  Ver setup
                </Link>
              </div>
            </Card>
          </article>
        ))}
      </div>
      <div
        className="mt-4 flex justify-center gap-2"
        role="group"
        aria-label="Posición en el carrusel"
      >
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Ir al setup ${i + 1} de ${pages}`}
            aria-current={i === index ? "true" : undefined}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-ink" : "w-2 bg-line hover:bg-ink/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
