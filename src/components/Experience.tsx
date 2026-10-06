import { useState, useRef, useEffect } from 'react';
import { m } from 'motion/react';
import { Play, ArrowRight } from 'lucide-react';

interface ExperienceVideoItem {
  id: string;
  label: string;
  title: string;
  tagline: string;
  videoSrc: string;
  posterSrc: string;
  playAriaLabel: string;
  accent: 'cyan' | 'magenta';
}

const experienceItems: ExperienceVideoItem[] = [
  {
    id: 'exp-01',
    label: 'VIDEO 01',
    title: 'ENERGÍA EN PISTA',
    tagline: 'La pista responde. La energía sube.',
    videoSrc: '/assets/videos/experiencia-01.mp4',
    posterSrc: '/assets/videos/experiencia-01-poster.jpg',
    playAriaLabel: 'Reproducir experiencia en vivo: Energía en pista',
    accent: 'cyan',
  },
  {
    id: 'exp-02',
    label: 'VIDEO 02',
    title: 'EL SHOW EN VIVO',
    tagline: 'Luces, mezcla y conexión con el público.',
    videoSrc: '/assets/videos/experiencia-02.mp4',
    posterSrc: '/assets/videos/experiencia-02-poster.jpg',
    playAriaLabel: 'Reproducir experiencia en vivo: El show en vivo',
    accent: 'magenta',
  },
];

export default function Experience() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  // Espejo del estado para que el IntersectionObserver no tenga que recrearse en cada Play
  const activeVideoIdRef = useRef<string | null>(null);

  // Manejador de Play: asegura que solo un video reproduzca a la vez y monta el MP4 solo tras el clic
  const handlePlay = (id: string) => {
    // Si otro video está activo, pausarlo inmediatamente
    if (activeVideoId && activeVideoId !== id) {
      const prev = videoRefs.current[activeVideoId];
      if (prev && !prev.paused) {
        prev.pause();
      }
    }
    activeVideoIdRef.current = id;
    setActiveVideoId(id);
  };

  // Observador de intersección: pausa el video activo si el usuario hace scroll fuera de la sección
  // NO reanuda automáticamente: el control permanece siempre en manos del usuario
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            const currentId = activeVideoIdRef.current;
            const activeVid = currentId ? videoRefs.current[currentId] : null;
            if (activeVid && !activeVid.paused) {
              activeVid.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section 
      id="experience" 
      ref={sectionRef}
      className="scroll-mt-20 py-24 sm:py-28 md:py-36 bg-black relative border-t border-zinc-900 overflow-hidden"
    >
      {/* =========================================================================
          ILUMINACIÓN ESCÉNICA Y PROFUNDIDAD CINEMATOGRÁFICA (FESTIVAL & CLUB)
          ========================================================================= */}
      
      {/* 1. Spotlight / haz de luz cónico desde arriba centrado en la pista */}
      <div 
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),rgba(59,130,246,0.04)_40%,transparent_70%)] pointer-events-none select-none z-0 glow-flat" 
        aria-hidden="true" 
      />

      {/* 2. Halo azul eléctrico / cian lateral izquierdo detrás de Video 01 */}
      <div 
        className="absolute top-1/3 -left-32 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(6,182,212,0.1),rgba(37,99,235,0.05)_50%,transparent_75%)] rounded-full blur-[160px] pointer-events-none select-none z-0 glow-soft" 
        aria-hidden="true" 
      />

      {/* 3. Halo magenta / violeta lateral derecho detrás de Video 02 */}
      <div 
        className="absolute bottom-1/4 -right-32 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(217,70,239,0.08),rgba(147,51,234,0.04)_45%,transparent_75%)] rounded-full blur-[170px] pointer-events-none select-none z-0 glow-soft" 
        aria-hidden="true" 
      />

      {/* 4. Líneas finas horizontales de escenario que unen Hero y Experience */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* =========================================================================
            ENCABEZADO EDITORIAL CON JERARQUÍA IMPACTANTE
            ========================================================================= */}
        <div className="mb-14 sm:mb-18 md:mb-20">
          
          {/* Kicker con rail LED */}
          <m.div 
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="w-8 h-[2px] bg-gradient-to-r from-cyan-400 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.9)] animate-pulse" />
            <span className="text-cyan-400 font-mono font-bold tracking-[0.28em] uppercase text-xs drop-shadow-sm">
              EN VIVO
            </span>
          </m.div>

          {/* Headline Principal */}
          <m.h2 
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-lg mb-3"
          >
            DONDE EMPIEZA LA NOCHE
          </m.h2>

          {/* Subheadline Elegante */}
          <m.p 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="text-lg sm:text-xl font-bold tracking-tight uppercase text-blue-400/90 mb-5"
          >
            VIVE LA EXPERIENCIA
          </m.p>

          {/* Texto Descriptivo Conciso */}
          <m.p 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="text-zinc-300 text-sm sm:text-base font-light max-w-xl leading-relaxed"
          >
            Luces, música y energía en una pista que no se detiene. Así se vive una noche con DJ Bryan Acosta.
          </m.p>
        </div>

        {/* Indicador móvil discreto de carrusel */}
        <div className="md:hidden flex items-center justify-between mb-4 text-[11px] font-mono tracking-widest text-zinc-500 uppercase px-1">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            CLIPS EN VIVO
          </span>
          <span className="text-zinc-400 font-medium">DESLIZA →</span>
        </div>

        {/* =========================================================================
            SHOWCASE DE LOS 2 VIDEOS VERTICALES 9:16
            - Mobile: Carrusel horizontal snap con 82vw
            - Desktop: 2 columnas en max-w-5xl con sutil offset editorial
            ========================================================================= */}
        <div className="flex md:grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory pb-6 md:pb-0 px-6 sm:px-0 -mx-6 sm:mx-auto items-start">
          {experienceItems.map((item, index) => {
            const isPlaying = activeVideoId === item.id;
            const editorialOffset = index === 1 ? 'md:translate-y-8' : '';
            const isCyan = item.accent === 'cyan';

            const borderAccent = isCyan 
              ? 'hover:border-cyan-400/50 group-hover:shadow-[0_0_35px_rgba(6,182,212,0.2)]' 
              : 'hover:border-fuchsia-400/50 group-hover:shadow-[0_0_35px_rgba(217,70,239,0.2)]';

            const lineAccent = isCyan 
              ? 'from-transparent via-cyan-400/80 to-transparent' 
              : 'from-transparent via-fuchsia-400/80 to-transparent';

            const dotAccent = isCyan 
              ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]' 
              : 'bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.9)]';

            const labelAccent = isCyan ? 'text-cyan-400' : 'text-fuchsia-400';

            return (
              <m.article
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`w-[82vw] max-w-[340px] md:max-w-none md:w-auto shrink-0 md:shrink snap-center flex flex-col group ${editorialOffset}`}
              >
                {/* 1. PARTE SUPERIOR (Fuera del poster): Etiqueta técnica + Rail LED */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${dotAccent}`} />
                    <span className={`text-[11px] font-mono tracking-[0.25em] font-bold uppercase ${labelAccent}`}>
                      {item.label}
                    </span>
                    <span className="w-6 h-[1px] bg-gradient-to-r from-zinc-700 to-transparent" />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800">
                    9:16 HD
                  </span>
                </div>

                {/* 2. CENTRO: MARCO VERTICAL 9:16 (Únicamente poster + Play, o video activo) */}
                <div className={`relative aspect-[9/16] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl transition-all duration-500 ${borderAccent}`}>
                  
                  {/* Borde sutil superior con micro-acento LED de color */}
                  <div className={`absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r ${lineAccent} pointer-events-none z-20`} />

                  {/* CASO A: Video montado SOLO tras interacción (Play) con controles limpios */}
                  {isPlaying ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[item.id] = el;
                      }}
                      src={item.videoSrc}
                      poster={item.posterSrc}
                      playsInline
                      controls
                      autoPlay
                      preload="metadata"
                      className="w-full h-full object-cover bg-black relative z-10"
                    />
                  ) : (
                    /* CASO B: Poster inicial con botón Play (NO descarga MP4) */
                    <div className="relative w-full h-full overflow-hidden">
                      
                      {/* Imagen Poster limpia (sin textos superpuestos en el centro) */}
                      <img 
                        src={item.posterSrc} 
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out md:group-hover:scale-[1.02]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />

                      {/* Gradiente cinemático oscuro suave para contraste */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/25 pointer-events-none z-10" />

                      {/* Botón de Play ÚNICO y PERFECTAMENTE CENTRADO */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
                        <button
                          type="button"
                          onClick={() => handlePlay(item.id)}
                          aria-label={item.playAriaLabel}
                          className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center ring-1 ring-white/10 ring-offset-2 ring-offset-black/50 shadow-[0_0_25px_rgba(6,182,212,0.3)] md:hover:scale-105 md:hover:border-cyan-400 md:hover:shadow-[0_0_32px_rgba(6,182,212,0.55)] transition-all duration-300 cursor-pointer select-none active:scale-95"
                        >
                          <Play size={22} className="ml-0.5 text-white" fill="currentColor" />
                        </button>
                      </div>

                    </div>
                  )}

                </div>

                {/* 3. PARTE INFERIOR (Fuera del poster y del reproductor): Título + Microdescripción */}
                <div className="pt-4 px-1 flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-1 group-hover:text-zinc-100 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                    {item.tagline}
                  </p>
                </div>

              </m.article>
            );
          })}
        </div>

        {/* =========================================================================
            CTA FINAL DE LA SECCIÓN (ALTO IMPACTO Y ELEGANCIA)
            ========================================================================= */}
        <m.div 
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 sm:mt-20 md:mt-24 pt-10 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center"
        >
          {/* Acción principal: Lleva a Reserva / Contacto */}
          <a
            href="#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-zinc-100 text-black text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(6,182,212,0.45)] group/btn cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>QUIERO UNA EXPERIENCIA ASÍ</span>
            <ArrowRight size={15} className="text-black group-hover/btn:translate-x-1 transition-transform" />
          </a>

          {/* Enlace secundario discreto: Lleva a Servicios */}
          <a
            href="#packages"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors py-2 px-3 group/link"
          >
            <span>VER SERVICIOS</span>
            <ArrowRight size={13} className="text-zinc-500 group-hover/link:text-cyan-400 group-hover/link:translate-x-1 transition-all" />
          </a>
        </m.div>

      </div>
    </section>
  );
}

