'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { restaurant } from '@/data/restaurant';
import { categories, menuItems, popularDishes, getMenuByCategory } from '@/data/menu';
import { MenuItem, MenuCategory } from '@/types';
import { useSession } from '@/context/SessionContext';
import CartFloatingBar from '@/components/cart/cart-floating-bar';
import CustomerForm from '@/components/customer/customer-form';
import CategoryBubbles from '@/components/menu/category-bubbles';
import ItemDetailModal from '@/components/menu/item-detail-modal';
import MenuHeroPromo from '@/components/menu/menu-hero-promo';
import MenuProductCard from '@/components/menu/menu-product-card';
import MenuTopHeader from '@/components/menu/menu-top-header';
import PopularPicksGrid from '@/components/menu/popular-picks-grid';
import SearchModal from '@/components/menu/search-modal';
import DirectionsModal from '@/components/shared/directions-modal';
import WifiModal from '@/components/shared/wifi-modal';

export default function MenuPage() {
  const { setCustomerData } = useSession();

  const [activeCategory, setActiveCategory] = useState<MenuCategory>('summer-bites');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-animate="menu-hero"]', { opacity: 0, y: -16, duration: 0.55 })
        .from('[data-animate="menu-categories"]', { opacity: 0, y: 14, duration: 0.42 }, '-=0.2')
        .from('[data-animate="menu-featured"]', { opacity: 0, y: 18, duration: 0.5 }, '-=0.16');
    }, pageRef);

    return () => context.revert();
  }, []);

  const handleCategorySelect = (category: MenuCategory) => {
    setActiveCategory(category);
    const targetSection = sectionRefs.current[category];
    if (targetSection) {
      const yOffset = -70;
      const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const filteredItems = searchQuery.trim()
    ? menuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div ref={pageRef} className="w-full bg-[var(--color-bg-base)] min-h-screen pb-32 text-[var(--color-text-body)]">
      {/* 1. TOP HEADER EDITORIAL (30% Forest Green) */}
      <MenuTopHeader
        brandName="360 food"
        brandSubtitle="FOOD · ORDER · ENJOY"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
      />

      {/* Si hay búsqueda activa, mostrar resultados filtrados en cuadrícula editorial */}
      {filteredItems ? (
        <div className="p-4 md:p-8 lg:p-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-editorial-serif text-lg font-medium text-[var(--color-text-primary)]">
              Resultados para &quot;{searchQuery}&quot; ({filteredItems.length})
            </h3>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[var(--color-accent-terracotta)] font-medium hover:underline cursor-pointer"
            >
              Limpiar filtro
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
              No se encontraron platos que coincidan con &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-5">
              {filteredItems.map((item) => (
                <MenuProductCard
                  key={item.id}
                  item={item}
                  onSelectItem={(dish) => setSelectedItem(dish)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 2. HERO PROMO EDITORIAL */}
          <div data-animate="menu-hero">
            <MenuHeroPromo onOrderNow={() => handleCategorySelect('summer-bites')} />
          </div>

          {/* 3. PÍLDORAS DE FILTRO DE CATEGORÍA (Sticky con rounded-full) */}
          <div data-animate="menu-categories">
            <CategoryBubbles activeCategory={activeCategory} onSelect={handleCategorySelect} />
          </div>

          {/* 4. SECCIÓN PLATOS DESTACADOS */}
          <div data-animate="menu-featured">
            <PopularPicksGrid
              dishes={popularDishes}
              onSelectItem={(item) => setSelectedItem(item)}
              onViewAll={() => handleCategorySelect('summer-bites')}
            />
          </div>

          {/* 5. SECCIONES DE LA CARTA (Cuadrícula Editorial 2 Columnas) */}
          <main className="px-4 md:px-8 lg:px-10 space-y-7 md:space-y-10 mt-3">
            {categories.map((category) => {
              const items = getMenuByCategory(category.id);
              if (items.length === 0) return null;

              return (
                <section
                  key={category.id}
                  id={category.id}
                  ref={(el) => {
                    sectionRefs.current[category.id] = el;
                  }}
                  className="scroll-mt-20"
                >
                  {/* Encabezado H2 Editorial: 20px - 24px Serif */}
                  <div className="flex items-baseline justify-between mb-3 border-b border-[var(--color-border-subtle)] pb-2">
                    <div>
                      <h3 className="font-editorial-serif text-xl sm:text-2xl font-medium text-[var(--color-text-primary)]">
                        {category.label}
                      </h3>
                      <p className="text-[12px] text-[var(--color-text-muted)]">
                        {items.length} {items.length === 1 ? 'creación disponible' : 'creaciones disponibles'}
                      </p>
                    </div>

                    <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
                      {category.id.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Grid de 2 Columnas con Tarjetas de Plato */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                    {items.map((item) => (
                      <MenuProductCard
                        key={item.id}
                        item={item}
                        onSelectItem={(dish) => setSelectedItem(dish)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </main>
        </>
      )}

      {/* Footer Editorial */}
      <footer className="mt-14 px-6 py-8 text-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] bg-[var(--color-bg-base)] space-y-1.5">
        <p className="font-editorial-serif text-base font-medium text-[var(--color-text-primary)]">
          {restaurant.name}
        </p>
        <p className="text-[11px] text-[var(--color-text-subtle)]">
          © {new Date().getFullYear()} · Haute Cuisine & Digital Dining Platform
        </p>
      </footer>

      {/* Barra Flotante de Carrito */}
      <CartFloatingBar />

      {/* Modals */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        items={menuItems}
        onSelectItem={(item) => setSelectedItem(item)}
      />

      <CustomerForm
        isOpen={isCustomerModalOpen}
        onSubmit={(data) => {
          setCustomerData(data);
          setIsCustomerModalOpen(false);
        }}
      />

      <WifiModal
        isOpen={isWifiOpen}
        onClose={() => setIsWifiOpen(false)}
        ssid={restaurant.wifi.ssid}
        password={restaurant.wifi.password}
      />

      <DirectionsModal
        isOpen={isDirectionsOpen}
        onClose={() => setIsDirectionsOpen(false)}
      />
    </div>
  );
}
