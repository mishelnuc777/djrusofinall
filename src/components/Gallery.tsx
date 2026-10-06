import { useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { djData } from '../data/djData';
import { parseYouTube, youTubeEmbedUrl, youTubeThumbnail } from '../utils/media';
import { useIsDesktop } from '../hooks/useIsDesktop';
import AmbientGlow from './AmbientGlow';

interface GalleryItem {
  id: string;
  url: string; // miniatura / imagen de cuadrícula (1400px)
  smallUrl?: string; // variante ligera 720px para pantallas pequeñas (srcSet)
  width?: number; // dimensiones intrínsecas de `url` (evita layout shift)
  height?: number;
  fullUrl?: string; // versión optimizada de mayor resolución para lightbox
  alt: string;
  tag?: string; // Etiqueta editorial sutil en hover
  videoUrl?: string; // enlace de YouTube (solo para videos)
}

// 12 fotografías reales dentro de /public/assets/gallery/ (100% conservadas)
const galleryPhotos: GalleryItem[] = [
  { id: 'gal-01', url: '/assets/gallery/gallery-01-grid.webp', smallUrl: '/assets/gallery/gallery-01-720.webp', width: 1400, height: 933, fullUrl: '/assets/gallery/gallery-01-full.webp', alt: 'DJ Bryan Acosta en cabina en vivo', tag: 'EN VIVO' },
  { id: 'gal-02', url: '/assets/gallery/gallery-02-grid.webp', smallUrl: '/assets/gallery/gallery-02-720.webp', width: 1400, height: 933, fullUrl: '/assets/gallery/gallery-02-full.webp', alt: 'Montaje de iluminación y producción escénica', tag: 'PRODUCCIÓN' },
  { id: 'gal-03', url: '/assets/gallery/gallery-03-grid.webp', smallUrl: '/assets/gallery/gallery-03-720.webp', width: 1400, height: 786, fullUrl: '/assets/gallery/gallery-03-full.webp', alt: 'Público y pista de baile en fiesta', tag: 'SHOW' },
  { id: 'gal-04', url: '/assets/gallery/gallery-04-grid.webp', smallUrl: '/assets/gallery/gallery-04-720.webp', width: 1400, height: 786, fullUrl: '/assets/gallery/gallery-04-full.webp', alt: 'Equipamiento profesional de sonido y controlador', tag: 'CABINA' },
  { id: 'gal-05', url: '/assets/gallery/gallery-05-grid.webp', smallUrl: '/assets/gallery/gallery-05-720.webp', width: 1400, height: 933, fullUrl: '/assets/gallery/gallery-05-full.webp', alt: 'Efectos especiales y máquinas de humo en vivo', tag: 'SHOW' },
  { id: 'gal-06', url: '/assets/gallery/gallery-06-grid.webp', smallUrl: '/assets/gallery/gallery-06-720.webp', width: 1400, height: 786, fullUrl: '/assets/gallery/gallery-06-full.webp', alt: 'Presentación en evento corporativo y social', tag: 'EN VIVO' },
  { id: 'gal-07', url: '/assets/gallery/gallery-07-grid.webp', smallUrl: '/assets/gallery/gallery-07-720.webp', width: 1400, height: 933, fullUrl: '/assets/gallery/gallery-07-full.webp', alt: 'Show de luces robotizadas y visuales', tag: 'PRODUCCIÓN' },
  { id: 'gal-08', url: '/assets/gallery/gallery-08-grid.webp', smallUrl: '/assets/gallery/gallery-08-720.webp', width: 1400, height: 933, fullUrl: '/assets/gallery/gallery-08-full.webp', alt: 'Ambiente nocturno y energía del público', tag: 'SHOW' },
  { id: 'gal-09', url: '/assets/gallery/gallery-09-grid.webp', smallUrl: '/assets/gallery/gallery-09-720.webp', width: 1400, height: 786, fullUrl: '/assets/gallery/gallery-09-full.webp', alt: 'Sesión de mezcla y tornamesas en vivo', tag: 'CABINA' },
  { id: 'gal-10', url: '/assets/gallery/gallery-10-grid.webp', smallUrl: '/assets/gallery/gallery-10-720.webp', width: 1400, height: 933, fullUrl: '/assets/gallery/gallery-10-full.webp', alt: 'Pantallas LED y estructura para eventos', tag: 'PRODUCCIÓN' },
  { id: 'gal-11', url: '/assets/gallery/gallery-11-grid.webp', smallUrl: '/assets/gallery/gallery-11-720.webp', width: 1400, height: 786, fullUrl: '/assets/gallery/gallery-11-full.webp', alt: 'Celebración y fiesta privada en Quito', tag: 'BACKSTAGE' },
  { id: 'gal-12', url: '/assets/gallery/gallery-12-grid.webp', smallUrl: '/assets/gallery/gallery-12-720.webp', width: 1400, height: 786, fullUrl: '/assets/gallery/gallery-12-full.webp', alt: 'Producción sonora y show completo de DJ', tag: 'EN VIVO' },
];

// Videos de YouTube opcionales configurados en src/data/djData.ts (galleryVideos)
const galleryVideoItems: GalleryItem[] = (djData.galleryVideos ?? []).flatMap((video) => {
  const yt = parseYouTube(video.url);
  if (!yt) return [];
  return [{ id: video.id, url: youTubeThumbnail(yt.id), alt: video.title, tag: 'VIDEO', videoUrl: video.url }];
});

const galleryItems: GalleryItem[] = [...galleryPhotos, ...galleryVideoItems];

// Ancho aproximado (px) de cada foto en desktop (lg) según su col-span en el collage de 12 columnas
const LG_WIDTH_BY_SPAN: Record<number, number> = { 3: 280, 4: 380, 5: 480, 6: 580, 8: 780 };
const LG_SPAN_BY_INDEX = [8, 4, 4, 5, 3, 4, 8, 3, 3, 6, 6, 6];
// Fotos que ocupan las 2 columnas en tablet (sm)
const SM_FULL_WIDTH_INDEXES = new Set([0, 4, 6, 9]);

function getGridSizes(index: number): string {
  const lgPx = LG_WIDTH_BY_SPAN[LG_SPAN_BY_INDEX[index] ?? 4] ?? 380;
  const sm = SM_FULL_WIDTH_INDEXES.has(index) ? 'calc(100vw - 48px)' : 'calc((100vw - 64px) / 2)';
  return `(min-width: 1024px) ${lgPx}px, (min-width: 640px) ${sm}, calc(100vw - 48px)`;
}

export default function Gallery() {
  const isDesktop = useIsDesktop();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const getSanitizedAlt = (altText: string, index: number): string => {
    if (!altText || (altText.startsWith('[') && altText.endsWith(']'))) {
      return `Registro visual ${String(index + 1).padStart(2, '0')}`;
    }
    return altText;
  };

  const hasItems = galleryItems && galleryItems.length > 0;

  // Navigation handlers for Lightbox (funcionales: identidad estable, no dependen de selectedIndex)
  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? null : prev > 0 ? prev - 1 : galleryItems.length - 1));
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? null : prev < galleryItems.length - 1 ? prev + 1 : 0));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard accessibility and body scroll lock (solo al abrir/cerrar el lightbox, no en cada cambio de foto)
  const isLightboxOpen = selectedIndex !== null;
  useEffect(() => {
    if (!isLightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, handleClose, handlePrev, handleNext]);

  return (
    <section id="gallery" className="scroll-mt-20 py-24 md:py-36 bg-black relative border-t border-zinc-900 overflow-hidden">
      
      {/* =========================================================================
          ATMÓSFERA ESCÉNICA DE FONDO (Humo y bruma sutil en el fondo, NUNCA sobre las fotos)
          ========================================================================= */}
      {/* Foco de luz y humo azul profundo superior izquierdo */}
      <AmbientGlow
        active={isDesktop}
        duration={16}
        scale={1.08}
        opacity={[0.5, 0.75]}
        x={[-10, 15]}
        className="absolute top-1/6 -left-20 w-[650px] h-[550px] bg-[radial-gradient(circle,rgba(37,99,235,0.08),rgba(99,102,241,0.03)_50%,transparent_75%)] rounded-full blur-[160px] pointer-events-none select-none z-0 glow-flat"
      />

      {/* Foco de luz violeta y rojo tenue de escenario lateral derecho */}
      <AmbientGlow
        active={isDesktop}
        duration={18}
        scale={1.07}
        opacity={[0.4, 0.65]}
        y={[0, -20]}
        className="absolute top-1/2 -right-24 w-[700px] h-[600px] bg-[radial-gradient(circle,rgba(168,85,247,0.07),rgba(220,38,38,0.04)_45%,transparent_75%)] rounded-full blur-[170px] pointer-events-none select-none z-0 glow-flat"
      />

      {/* Bruma baja central difuminada en el fondo */}
      <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-[950px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_70%)] blur-[130px] pointer-events-none select-none z-0 glow-flat" />

      {/* Capas sutiles de neblina de show en los bordes para transición limpia */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.04),transparent_60%)] pointer-events-none select-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_90%,rgba(220,38,38,0.04),transparent_40%)] pointer-events-none select-none z-0" />

      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* =========================================================================
            EDITORIAL HEADER
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 md:mb-16 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="w-8 h-[2px] bg-gradient-to-r from-blue-500 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.9)] animate-pulse" />
              <span className="text-blue-400 font-mono font-bold tracking-[0.28em] uppercase text-xs drop-shadow-sm">
                04 / LIVE ARCHIVE
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-lg">
              LIVE
            </h2>
          </div>

          <div className="text-xs text-zinc-400 uppercase tracking-widest font-mono pb-1 self-start sm:self-end">
            <span>
              {hasItems && (
                <>
                  <span className="text-blue-400 font-bold">{galleryPhotos.length}</span> Fotografías
                  {galleryVideoItems.length > 0 && ` · ${galleryVideoItems.length} Videos`}
                </>
              )}
            </span>
          </div>
        </div>

        {/* =========================================================================
            COLLAGE ASIMÉTRICO EDITORIAL CON FOTO PROTAGONISTA
            ========================================================================= */}
        {hasItems && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
            {galleryItems.map((image, index) => {
              const altText = getSanitizedAlt(image.alt, index);

              // =====================================================================
              // COMPOSICIÓN EDITORIAL ASIMÉTRICA CON RITMO VISUAL
              // Foto 0 (gal-01): PROTAGONISTA DOMINANTE (8 cols en desktop, gran altura)
              // Foto 1: Vertical editorial complementaria (4 cols)
              // Fotos 2, 3, 4: Tríada rítmica (4 cols + 5 cols + 3 cols)
              // Fotos 5, 6: Contraste vertical + Gran panorama (4 cols + 8 cols)
              // Fotos 7, 8, 9: Tríada dinámica (3 cols + 3 cols + 6 cols)
              // Fotos 10, 11: Díptico panorámico de cierre (6 cols + 6 cols)
              // =====================================================================
              let colSpan = 'lg:col-span-4 sm:col-span-1';
              let aspectClass = 'aspect-[4/3]';
              const isProtagonist = index === 0;

              if (index === 0) {
                // FOTO PROTAGONISTA: Bryan Acosta en cabina en vivo (Gran impacto)
                colSpan = 'lg:col-span-8 sm:col-span-2';
                aspectClass = 'aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] min-h-[320px] sm:min-h-[460px] lg:min-h-[520px]';
              } else if (index === 1) {
                colSpan = 'lg:col-span-4 sm:col-span-1';
                aspectClass = 'aspect-[4/5] sm:aspect-square lg:aspect-[4/5] lg:min-h-[520px]';
              } else if (index === 2) {
                colSpan = 'lg:col-span-4 sm:col-span-1';
                aspectClass = 'aspect-[4/3] sm:aspect-[4/3]';
              } else if (index === 3) {
                colSpan = 'lg:col-span-5 sm:col-span-1';
                aspectClass = 'aspect-[16/10] sm:aspect-[16/10]';
              } else if (index === 4) {
                colSpan = 'lg:col-span-3 sm:col-span-2 lg:col-span-3';
                aspectClass = 'aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]';
              } else if (index === 5) {
                colSpan = 'lg:col-span-4 sm:col-span-1';
                aspectClass = 'aspect-[4/5] sm:aspect-square lg:aspect-[4/5]';
              } else if (index === 6) {
                colSpan = 'lg:col-span-8 sm:col-span-2';
                aspectClass = 'aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/9]';
              } else if (index === 7) {
                colSpan = 'lg:col-span-3 sm:col-span-1';
                aspectClass = 'aspect-square sm:aspect-square';
              } else if (index === 8) {
                colSpan = 'lg:col-span-3 sm:col-span-1';
                aspectClass = 'aspect-square sm:aspect-square';
              } else if (index === 9) {
                colSpan = 'lg:col-span-6 sm:col-span-2';
                aspectClass = 'aspect-[16/10] sm:aspect-[16/10]';
              } else if (index === 10 || index === 11) {
                colSpan = 'lg:col-span-6 sm:col-span-1';
                aspectClass = 'aspect-[16/10]';
              }

              return (
                <m.div
                  key={image.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: (index % 6) * 0.05, duration: 0.55 }}
                  className={`relative group overflow-hidden rounded-xl bg-zinc-950/80 border border-zinc-900/80 hover:border-zinc-700/80 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl ${colSpan}`}
                  onClick={() => setSelectedIndex(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedIndex(index);
                    }
                  }}
                  aria-label={image.videoUrl ? `Reproducir video: ${altText}` : `Ver imagen ampliada: ${altText}`}
                >
                  {/* Contenedor de la Fotografía (Limpia y Nítida) */}
                  <div className={`w-full h-full ${aspectClass} overflow-hidden`}>
                    <img 
                      src={image.url} 
                      srcSet={image.smallUrl ? `${image.smallUrl} 720w, ${image.url} 1400w` : undefined}
                      sizes={image.smallUrl ? getGridSizes(index) : undefined}
                      width={image.width}
                      height={image.height}
                      alt={altText}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Indicador de Video en caso de ítems de YouTube */}
                  {image.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg">
                        <Play size={20} className="translate-x-0.5" fill="currentColor" />
                      </span>
                    </div>
                  )}

                  {/* Micro-overlay oscuro suave al hover con etiqueta editorial y botón de zoom */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-between p-3.5 sm:p-4">
                    {/* Botón de Zoom sutil en esquina superior derecha */}
                    <div className="self-end">
                      <span className="w-8 h-8 rounded-full bg-black/70 md:backdrop-blur-md text-white/90 flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                        <ZoomIn size={14} />
                      </span>
                    </div>

                    {/* Etiqueta editorial sutil en esquina inferior izquierda */}
                    {image.tag && (
                      <div className="self-start">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-white/90 bg-black/70 md:backdrop-blur-md px-2.5 py-1 rounded border border-white/10 shadow-sm">
                          {image.tag}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Borde sutil iluminado en la foto protagonista */}
                  {isProtagonist && (
                    <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/10 group-hover:border-blue-500/30 transition-colors" />
                  )}
                </m.div>
              );
            })}
          </div>
        )}

      </div>

      {/* =========================================================================
          LIGHTBOX MODAL (PROTAGONISMO TOTAL DE LA FOTOGRAFÍA EN PANTALLA COMPLETA)
          ========================================================================= */}
      <AnimatePresence>
        {selectedIndex !== null && galleryItems[selectedIndex] && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 sm:p-6"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label="Visor de imagen"
          >
            {/* Barra superior con contador numérico y botón cerrar */}
            <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
              <span className="text-xs font-mono font-semibold tracking-widest text-zinc-300 pointer-events-auto bg-zinc-900/90 px-3.5 py-1.5 rounded-md border border-zinc-800 shadow-md">
                {String(selectedIndex + 1).padStart(2, '0')} / {String(galleryItems.length).padStart(2, '0')}
              </span>

              <button 
                className="text-zinc-400 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 p-2.5 rounded-lg transition-colors cursor-pointer pointer-events-auto shadow-md active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                aria-label="Cerrar visor"
              >
                <X size={20} />
              </button>
            </div>

            {/* Flecha Anterior (Desktop) */}
            {galleryItems.length > 1 && (
              <button
                className="absolute left-4 sm:left-6 z-20 text-zinc-400 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 p-3 rounded-lg transition-all cursor-pointer hidden sm:flex items-center justify-center shadow-lg active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Contenedor central de la Fotografía ampliada */}
            <m.div 
              key={selectedIndex}
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-6xl max-h-[88vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const current = galleryItems[selectedIndex];
                const yt = parseYouTube(current.videoUrl);
                if (yt) {
                  return (
                    <div
                      className={`rounded-lg overflow-hidden bg-black ${
                        yt.isShort
                          ? 'h-[75vh] max-h-[680px] aspect-[9/16]'
                          : 'w-[90vw] max-w-4xl aspect-video'
                      }`}
                    >
                      <iframe
                        key={current.id}
                        src={youTubeEmbedUrl(yt, { autoplay: true })}
                        title={current.alt}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                }
                return (
                  <img 
                    src={current.fullUrl ?? current.url} 
                    alt={getSanitizedAlt(current.alt, selectedIndex)}
                    decoding="async"
                    className="max-w-[92vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  />
                );
              })()}
            </m.div>

            {/* Flecha Siguiente (Desktop) */}
            {galleryItems.length > 1 && (
              <button
                className="absolute right-4 sm:right-6 z-20 text-zinc-400 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 p-3 rounded-lg transition-all cursor-pointer hidden sm:flex items-center justify-center shadow-lg active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Barra de navegación inferior para Mobile */}
            {galleryItems.length > 1 && (
              <div className="sm:hidden absolute bottom-6 inset-x-0 flex items-center justify-center gap-4 z-20 pointer-events-auto">
                <button
                  className="text-zinc-300 hover:text-white bg-zinc-900/95 border border-zinc-800 p-3 rounded-lg shadow-lg active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="text-zinc-300 hover:text-white bg-zinc-900/95 border border-zinc-800 p-3 rounded-lg shadow-lg active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

          </m.div>
        )}
      </AnimatePresence>

    </section>
  );
}
