import { useEffect, useState } from 'react';

/** Sección visible en pantalla, para resaltar el ítem del menú correspondiente. */
export function useActiveSection<T extends string>(ids: readonly T[]): T {
  const [active, setActive] = useState<T>(ids[0]);

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (!elements.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id as T);
      },
      { rootMargin: '-38% 0px -58% 0px' },
    );
    elements.forEach((element) => observer.observe(element));

    // Al llegar al final de la página se marca la última sección aunque sea corta.
    const onScroll = () => {
      const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (bottom) setActive(ids[ids.length - 1]);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [ids]);

  return active;
}

/** Marca de tiempo que se actualiza cada `intervalMs` (para el indicador "en vivo"). */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}
