"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { restaurant } from "@/data/restaurant";
import {
  categories as demoCategories,
  menuItems as demoMenuItems,
  popularDishes as demoPopularDishes,
} from "@/data/menu";

import type { CategoryInfo, MenuCategory, MenuItem } from "@/types";

import { getPublicMenu } from "@/services/public-menu.service";
import { getPublicRestaurant } from "@/services/public-restaurant.service";

import { useSession } from "@/context/SessionContext";
import { useCart } from "@/context/CartContext";

import CartFloatingBar from "@/components/cart/cart-floating-bar";
import CustomerForm from "@/components/customer/customer-form";
import CategoryBubbles from "@/components/menu/category-bubbles";
import ItemDetailModal from "@/components/menu/item-detail-modal";
import MenuHeroPromo from "@/components/menu/menu-hero-promo";
import MenuProductCard from "@/components/menu/menu-product-card";
import MenuTopHeader from "@/components/menu/menu-top-header";
import PopularPicksGrid from "@/components/menu/popular-picks-grid";
import SearchModal from "@/components/menu/search-modal";
import DirectionsModal from "@/components/shared/directions-modal";

export default function MenuPage({ initialSlug }: { initialSlug?: string } = {}) {
  const { setCustomerData } = useSession();
  const { setRestaurantScope } = useCart();

  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [popularDishes, setPopularDishes] = useState<MenuItem[]>([]);

  const [activeCategory, setActiveCategory] =
    useState<MenuCategory>("summer-bites");

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [menuRestaurantName, setMenuRestaurantName] = useState(restaurant.name);

  const [isLoadingPublicMenu, setIsLoadingPublicMenu] = useState(true);
  const [publicMenuError, setPublicMenuError] = useState<string | null>(null);
  const [isPublicRestaurantMenu, setIsPublicRestaurantMenu] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const querySlug = new URLSearchParams(window.location.search)
      .get("restaurantSlug")
      ?.trim();
    setRestaurantScope(initialSlug?.trim() || querySlug || "demo");
  }, [initialSlug, setRestaurantScope]);

  // Cargar la carta del restaurante identificado en la URL.
  useEffect(() => {
    let active = true;

    const params = new URLSearchParams(window.location.search);
    const slug = initialSlug?.trim() || params.get("restaurantSlug")?.trim();

    async function loadPublicMenu() {
      setIsLoadingPublicMenu(true);
      setPublicMenuError(null);

      try {
        // La ruta antigua /menu conserva su funcionamiento de demostración.
        // Las páginas de restaurantes utilizan exclusivamente datos reales.
        if (!slug) {
          if (!active) return;

          setCategories(demoCategories);
          setMenuItems(demoMenuItems);
          setPopularDishes(demoPopularDishes);
          setMenuRestaurantName(restaurant.name);
          setActiveCategory(demoCategories[0]?.id ?? "summer-bites");
          setIsPublicRestaurantMenu(false);
          return;
        }

        setIsPublicRestaurantMenu(true);

        const [menu, restaurantResult] = await Promise.all([
          getPublicMenu(slug),
          getPublicRestaurant(slug),
        ]);

        if (!active) return;

        if (restaurantResult.status !== "found") {
          throw new Error(
            restaurantResult.status === "not-found"
              ? "El restaurante no existe o su página no está publicada."
              : "No se pudo cargar la información del restaurante.",
          );
        }

        const nextCategories: CategoryInfo[] = menu.categories.map(
          (category) => ({
            id: category.id as MenuCategory,
            label: category.label,
          }),
        );

        const nextMenuItems: MenuItem[] = menu.products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.categoryId as MenuCategory,
          image: product.image || "/food-placeholder.svg",
          available: product.available,
          isPopular: false,
        }));

        setCategories(nextCategories);
        setMenuItems(nextMenuItems);

        // La API pública todavía no proporciona popularidad.
        // No marcamos productos como populares sin información real.
        setPopularDishes([]);

        setMenuRestaurantName(restaurantResult.restaurant.name);
        setActiveCategory(nextCategories[0]?.id ?? "");
      } catch (error: unknown) {
        if (!active) return;

        setCategories([]);
        setMenuItems([]);
        setPopularDishes([]);

        setPublicMenuError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la carta del restaurante.",
        );
      } finally {
        if (active) {
          setIsLoadingPublicMenu(false);
        }
      }
    }

    void loadPublicMenu();

    return () => {
      active = false;
    };
  }, [initialSlug]);

  // Animaciones GSAP originales, ejecutadas después de la carga.
  useEffect(() => {
    if (isLoadingPublicMenu || publicMenuError) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const root = pageRef.current;
    if (!root) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      if (root.querySelector('[data-animate="menu-hero"]')) {
        timeline.from('[data-animate="menu-hero"]', {
          opacity: 0,
          y: -16,
          duration: 0.55,
        });
      }

      if (root.querySelector('[data-animate="menu-categories"]')) {
        timeline.from(
          '[data-animate="menu-categories"]',
          { opacity: 0, y: 14, duration: 0.42 },
          "-=0.2",
        );
      }

      if (root.querySelector('[data-animate="menu-featured"]')) {
        timeline.from(
          '[data-animate="menu-featured"]',
          { opacity: 0, y: 18, duration: 0.5 },
          "-=0.16",
        );
      }
    }, root);

    return () => context.revert();
  }, [isLoadingPublicMenu, publicMenuError]);

  const handleCategorySelect = (category: MenuCategory) => {
    setActiveCategory(category);

    const targetSection = sectionRefs.current[category];

    if (targetSection) {
      const yOffset = -70;
      const y =
        targetSection.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const filteredItems = searchQuery.trim()
    ? menuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : null;

  return (
    <div
      ref={pageRef}
      className="min-h-screen w-full bg-(--color-bg-base) pb-32 text-(--color-text-body)"
    >
      <MenuTopHeader
        brandName={menuRestaurantName}
        brandSubtitle="FOOD · ORDER · ENJOY"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
      />

      {isLoadingPublicMenu ? (
        <div className="flex min-h-64 items-center justify-center px-5">
          <div className="text-center">
            <div
              className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-(--color-accent-terracotta) border-t-transparent"
              aria-label="Cargando carta"
            />
            <p className="mt-3 text-sm text-(--color-text-muted)">
              Cargando carta...
            </p>
          </div>
        </div>
      ) : publicMenuError ? (
        <section className="mx-auto my-10 w-full max-w-md px-5" role="alert">
          <div className="rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-6 text-center">
            <h2 className="font-editorial-serif text-xl font-medium text-(--color-text-primary)">
              No pudimos cargar la carta
            </h2>

            <p className="mt-2 text-sm text-(--color-text-muted)">
              {publicMenuError}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-(--color-forest) px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
        </section>
      ) : filteredItems ? (
        <section className="p-4 md:p-8 lg:p-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-editorial-serif text-lg font-medium text-(--color-text-primary)">
              Resultados para &quot;{searchQuery}&quot; ({filteredItems.length})
            </h2>

            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="shrink-0 cursor-pointer text-xs font-medium text-(--color-accent-terracotta) hover:underline"
            >
              Limpiar filtro
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-8 text-center text-sm text-(--color-text-muted)">
              No se encontraron platos que coincidan con &quot;{searchQuery}
              &quot;.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <MenuProductCard
                  key={item.id}
                  item={item}
                  onSelectItem={(dish) => setSelectedItem(dish)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Conservamos la promoción estática únicamente en el menú de demostración. */}
          {!isPublicRestaurantMenu && (
            <div data-animate="menu-hero">
              <MenuHeroPromo
                onOrderNow={() => {
                  const firstCategory = categories[0];

                  if (firstCategory) {
                    handleCategorySelect(firstCategory.id);
                  }
                }}
              />
            </div>
          )}

          {categories.length > 0 ? (
            <>
              <div data-animate="menu-categories">
                <CategoryBubbles
                  activeCategory={activeCategory}
                  onSelect={handleCategorySelect}
                />
              </div>

              {/* En el menú público no inventamos platos destacados. */}
              {!isPublicRestaurantMenu && popularDishes.length > 0 && (
                <div data-animate="menu-featured">
                  <PopularPicksGrid
                    dishes={popularDishes}
                    onSelectItem={(item) => setSelectedItem(item)}
                    onViewAll={() => {
                      const firstCategory = categories[0];

                      if (firstCategory) {
                        handleCategorySelect(firstCategory.id);
                      }
                    }}
                  />
                </div>
              )}

              <main className="mt-3 space-y-7 px-4 md:mt-5 md:space-y-10 md:px-8 lg:px-10">
                {categories.map((category) => {
                  const items = menuItems.filter(
                    (item) => item.category === category.id && item.available,
                  );

                  if (items.length === 0) return null;

                  return (
                    <section
                      key={category.id}
                      id={category.id}
                      ref={(element) => {
                        sectionRefs.current[category.id] = element;
                      }}
                      className="scroll-mt-20"
                    >
                      <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-(--color-border-subtle) pb-2">
                        <div>
                          <h2 className="font-editorial-serif text-xl font-medium text-(--color-text-primary) sm:text-2xl">
                            {category.label}
                          </h2>

                          <p className="text-[12px] text-(--color-text-muted)">
                            {items.length}{" "}
                            {items.length === 1
                              ? "creación disponible"
                              : "creaciones disponibles"}
                          </p>
                        </div>

                        <span className="text-right text-[10px] font-medium uppercase tracking-[0.08em] text-(--color-text-subtle)">
                          {category.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
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

                {menuItems.length === 0 && (
                  <div className="rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-8 text-center">
                    <h2 className="font-editorial-serif text-lg font-medium text-(--color-text-primary)">
                      La carta está en preparación
                    </h2>

                    <p className="mt-2 text-sm text-(--color-text-muted)">
                      Este restaurante todavía no tiene productos disponibles.
                    </p>
                  </div>
                )}
              </main>
            </>
          ) : (
            <div className="mx-auto my-10 max-w-md px-5">
              <div className="rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-8 text-center">
                <h2 className="font-editorial-serif text-xl font-medium text-(--color-text-primary)">
                  La carta está en preparación
                </h2>

                <p className="mt-2 text-sm text-(--color-text-muted)">
                  Este restaurante todavía no tiene categorías activas.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      <footer className="mt-14 space-y-1.5 border-t border-(--color-border) bg-(--color-bg-base) px-6 py-8 text-center text-xs text-(--color-text-muted)">
        <p className="font-editorial-serif text-base font-medium text-(--color-text-primary)">
          {menuRestaurantName}
        </p>

        <p className="text-[11px] text-(--color-text-subtle)">
          © {new Date().getFullYear()} · Haute Cuisine & Digital Dining
          Platform
        </p>
      </footer>

      <CartFloatingBar />

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

      <DirectionsModal
        isOpen={isDirectionsOpen}
        onClose={() => setIsDirectionsOpen(false)}
      />
    </div>
  );
}
