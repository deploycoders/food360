'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface MenuHeroPromoProps {
  onOrderNow: () => void;
}

const promotionalSlides = [
  { eyebrow: 'Experiencia gastronomica', title: <>Fresco.<br />Autentico.<br /><strong>Inolvidable.</strong></>, description: 'Ingredientes selectos de origen artesanal.', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=85', alt: 'Plato gourmet destacado' },
  { eyebrow: 'Cocina de temporada', title: <>Sabores.<br />Que cuentan.<br /><strong>Historias.</strong></>, description: 'Recetas preparadas con calma, detalle y caracter.', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=85', alt: 'Ensalada de ingredientes frescos' },
  { eyebrow: 'La mesa te espera', title: <>Hecho para.<br />Compartir.<br /><strong>Disfrutar.</strong></>, description: 'Una seleccion pensada para cada momento.', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85', alt: 'Mesa con comida para compartir' },
];

export default function MenuHeroPromo({ onOrderNow }: MenuHeroPromoProps) {
  return (
    <section className="px-4 pt-4 pb-2 bg-[var(--color-bg-base)]" aria-label="Promociones destacadas">
      <Swiper modules={[Autoplay, Pagination, A11y]} slidesPerView={1} loop autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }} pagination={{ clickable: true }} className="menu-hero-swiper rounded-[24px] shadow-[0_14px_30px_-18px_rgba(28,49,33,0.42)]">
        {promotionalSlides.map((slide) => (
          <SwiperSlide key={slide.alt}>
            <article className="relative min-h-[230px] overflow-hidden rounded-[24px] p-5 sm:min-h-[250px] sm:p-6">
              <Image src={slide.image} alt={slide.alt} fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover object-right" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1C3121] via-[#1C3121]/90 to-[#1C3121]/15" />
              <div className="relative z-10 max-w-[220px] sm:max-w-[260px]">
                <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-terracotta)]">{slide.eyebrow}</p>
                <h2 className="mb-2 font-editorial-serif text-xl font-medium leading-tight text-white sm:text-2xl">{slide.title}</h2>
                <p className="mb-4 text-[12px] leading-snug text-white/75">{slide.description}</p>
                <button onClick={onOrderNow} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--color-accent-terracotta)] px-3.5 py-2 text-xs font-semibold tracking-wide text-white shadow-xs transition-colors hover:bg-[var(--color-accent-terracotta-hover)]"><span>Ver platos</span><span aria-hidden="true">→</span></button>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
