import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface AmbientGlowProps {
  /** Resultado de useIsDesktop(): en móvil/touch/reduced-motion el glow queda estático. */
  active: boolean;
  className: string;
  /** Duración del ciclo completo en segundos. */
  duration: number;
  /** Escala en el punto medio del ciclo (1 = sin cambio). */
  scale: number;
  /** [opacidad inicial/final, opacidad en el punto medio]. */
  opacity: [number, number];
  /** Desplazamiento horizontal en px: [inicio/fin, punto medio]. */
  x?: [number, number];
  /** Desplazamiento vertical en px: [inicio/fin, punto medio]. */
  y?: [number, number];
}

/**
 * Glow ambiental decorativo (solo desktop).
 *
 * Reemplaza los bucles infinitos de Motion (que corrían en el hilo principal
 * vía requestAnimationFrame todo el tiempo, incluso con la sección lejos del
 * viewport) por una animación CSS de transform + opacity, que se resuelve en el
 * compositor. Además la animación se pausa cuando el glow está fuera de pantalla.
 * Los keyframes (`ambient-breathe`) viven en index.css.
 */
export default function AmbientGlow({
  active,
  className,
  duration,
  scale,
  opacity,
  x = [0, 0],
  y = [0, 0],
}: AmbientGlowProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!active) {
      setInView(false);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setInView(entry.isIntersecting));
      },
      { rootMargin: '150px 0px' }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [active]);

  const style: CSSProperties | undefined = active
    ? ({
        '--ag-x0': `${x[0]}px`,
        '--ag-x1': `${x[1]}px`,
        '--ag-y0': `${y[0]}px`,
        '--ag-y1': `${y[1]}px`,
        '--ag-o0': opacity[0],
        '--ag-o1': opacity[1],
        '--ag-s1': scale,
        animation: `ambient-breathe ${duration}s ease-in-out infinite`,
        animationPlayState: inView ? 'running' : 'paused',
        willChange: inView ? 'transform, opacity' : undefined,
      } as CSSProperties)
    : undefined;

  return <div ref={ref} aria-hidden="true" className={className} style={style} />;
}
