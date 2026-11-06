"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { PublicRestaurant } from "@food360/types";

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
import { useTenant } from "@/context/TenantContext";

import CartFloatingBar from "@/components/cart/cart-floating-bar";
import CustomerForm from "@/components/customer/customer-form";
import CategoryBubbles from "@/components/menu/category-bubbles";
import ItemDetailModal from "@/components/menu/item-detail-modal";
import MenuProductCard from "@/components/menu/menu-product-card";
import MenuTopHeader from "@/components/menu/menu-top-header";
import PopularPicksGrid from "@/components/menu/popular-picks-grid";
import DirectionsModal from "@/components/shared/directions-modal";
import MenuCategoryCarousel from "@/components/menu/menu-category-carrousel";

export default function MenuPage({
  initialSlug,
  restaurant: boundRestaurant,
}: {
  initialSlug?: string;
  restaurant?: PublicRestaurant;
} = {}) {
  const { customerData, setCustomerData } = useSession();
  const { setTenant, setDemoTenant } = useTenant();

  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [popularDishes, setPopularDishes] = useState<MenuItem[]>([]);

  // null significa que se está mostrando toda la carta.
  const [activeCategory, setActiveCategory] = useState<MenuCategory | null>(
    null,
  );

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [menuRestaurantName, setMenuRestaurantName] = useState(
    boundRestaurant?.name ?? restaurant.name,
  );

  const [isLoadingPublicMenu, setIsLoadingPublicMenu] = useState(true);
  const [publicMenuError, setPublicMenuError] = useState<string | null>(null);

  const [isPublicRestaurantMenu, setIsPublicRestaurantMenu] = useState(
    Boolean(boundRestaurant),
  );

  const pageRef = useRef<HTMLDivElement>(null);

  // Identificar el restaurante activo.
  useEffect(() => {
    if (boundRestaurant) {
      setTenant({
        restaurantPublicId: boundRestaurant.publicId,
        slug: boundRestaurant.slug,
        name: boundRestaurant.name,
      });

      return;
    }

    const querySlug = new URLSearchParams(window.location.search)
      .get("restaurantSlug")
      ?.trim();

    const slug = initialSlug?.trim() || querySlug;

    if (!slug) {
      setDemoTenant();
    }
  }, [boundRestaurant, initialSlug, setTenant, setDemoTenant]);

  // Cargar la carta del restaurante.
  useEffect(() => {
    let active = true;

    const params = new URLSearchParams(window.location.search);

    const slug =
      boundRestaurant?.slug ||
      initialSlug?.trim() ||
      params.get("restaurantSlug")?.trim();

    async function loadPublicMenu() {
      setIsLoadingPublicMenu(true);
      setPublicMenuError(null);
      setActiveCategory(null);

      try {
        // Carta de demostración.
        if (!slug) {
          if (!active) return;

          setCategories(demoCategories);
          setMenuItems(demoMenuItems);
          setPopularDishes(demoPopularDishes);
          setMenuRestaurantName(restaurant.name);
          setIsPublicRestaurantMenu(false);

          return;
        }

        setIsPublicRestaurantMenu(true);

        // Restaurante ya identificado mediante props.
        if (boundRestaurant) {
          const menu = await getPublicMenu(slug);

          if (!active) return;

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
          setPopularDishes([]);
          setMenuRestaurantName(boundRestaurant.name);

          return;
        }

        // Resolver restaurante y carta simultáneamente.
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

        setTenant({
          restaurantPublicId: restaurantResult.restaurant.publicId,
          slug: restaurantResult.restaurant.slug,
          name: restaurantResult.restaurant.name,
        });

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
        setPopularDishes([]);
        setMenuRestaurantName(restaurantResult.restaurant.name);
      } catch (error: unknown) {
        if (!active) return;

        setCategories([]);
        setMenuItems([]);
        setPopularDishes([]);
        setActiveCategory(null);

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
  }, [initialSlug, boundRestaurant, setTenant]);

  // Animaciones GSAP de la carta.
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

      if (root.querySelector('[data-animate="menu-categories"]')) {
        timeline.from('[data-animate="menu-categories"]', {
          opacity: 0,
          y: 12,
          duration: 0.42,
        });
      }

      if (root.querySelector('[data-animate="menu-featured"]')) {
        timeline.from(
          '[data-animate="menu-featured"]',
          {
            opacity: 0,
            y: 16,
            duration: 0.45,
          },
          "-=0.16",
        );
      }
    }, root);

    return () => context.revert();
  }, [isLoadingPublicMenu, publicMenuError]);

  // Selección o eliminación del filtro por categoría.
  const handleCategorySelect = (category: MenuCategory | null) => {
    setActiveCategory(category);

    // Volver al inicio para que el nuevo resultado no aparezca
    // a mitad de la posición de desplazamiento anterior.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  // Búsqueda global por nombre, descripción y etiquetas.
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredItems = normalizedSearch
    ? menuItems.filter((item) => {
        if (!item.available) return false;

        const searchableFields = [
          item.name,
          item.description,
          ...(item.tags ?? []),
        ];

        return searchableFields.some((field) =>
          field.toLowerCase().includes(normalizedSearch),
        );
      })
    : null;

  // Determinar qué categorías y productos se muestran.
  const visibleCategories =
    activeCategory === null
      ? categories
      : categories.filter((category) => category.id === activeCategory);

  const categorySections = visibleCategories
    .map((category) => ({
      category,
      items: menuItems.filter(
        (item) => item.category === category.id && item.available,
      ),
    }))
    .filter(({ items }) => items.length > 0);

  const activeCategoryLabel = categories.find(
    (category) => category.id === activeCategory,
  )?.label;

  const hasAvailableProducts = menuItems.some((item) => item.available);

  return (
    <div
      ref={pageRef}
      className="min-h-screen w-full bg-(--color-bg-base) text-(--color-text-body)"
    >
      <MenuTopHeader
        brandName={menuRestaurantName}
        brandSubtitle="COCINA · PIDE · DISFRUTA"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
      />

      {isLoadingPublicMenu ? (
        <div className="flex min-h-64 items-center justify-center">
          <div className="text-center">
            <div
              className="mx-auto size-7 animate-spin rounded-full border-2 border-(--color-accent-terracotta) border-t-transparent"
              aria-label="Cargando carta"
            />

            <p className="mt-3 text-sm text-(--color-text-muted)">
              Cargando carta...
            </p>
          </div>
        </div>
      ) : publicMenuError ? (
        <section className="mx-auto my-10 w-full max-w-md" role="alert">
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
              className="mt-5 rounded-lg bg-(--color-forest) py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
        </section>
      ) : filteredItems !== null ? (
        /* Resultados de búsqueda global */
        <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8 lg:px-10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-editorial-serif text-lg font-medium text-(--color-text-primary) sm:text-xl">
                Resultados de búsqueda
              </h2>

              <p className="mt-1 text-xs text-(--color-text-muted)">
                {filteredItems.length}{" "}
                {filteredItems.length === 1
                  ? "producto encontrado"
                  : "productos encontrados"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="shrink-0 text-xs font-medium text-(--color-accent-terracotta) transition-opacity hover:opacity-75"
            >
              Limpiar búsqueda
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-8 text-center">
              <h3 className="font-editorial-serif text-lg font-medium text-(--color-text-primary)">
                No encontramos resultados
              </h3>

              <p className="mt-2 text-sm text-(--color-text-muted)">
                No hay productos disponibles que coincidan con &quot;
                {searchQuery}&quot;.
              </p>
            </div>
          ) : (
            <div className="grid pt-5 grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <MenuProductCard
                  key={item.id}
                  item={item}
                  categories={categories} // <--- Aquí también
                  onSelectItem={(dish) => setSelectedItem(dish)}
                />
              ))}
            </div>
          )}
        </section>
      ) : categories.length > 0 ? (
        <>
          {/* Navegación y selección de categorías */}
          <CategoryBubbles
            categories={categories}
            activeCategory={activeCategory}
            onSelect={handleCategorySelect}
          />

          {/* Los destacados de demostración solamente aparecen en Todas. */}
          {!isPublicRestaurantMenu &&
            activeCategory === null &&
            popularDishes.length > 0 && (
              <div data-animate="menu-featured">
                <PopularPicksGrid
                  dishes={popularDishes}
                  onSelectItem={(item) => setSelectedItem(item)}
                  onViewAll={() => handleCategorySelect(null)}
                />
              </div>
            )}

          <main className="mx-auto mt-4 w-full max-w-7xl space-y-9 px-4 sm:px-5 md:mt-6 md:space-y-11">
            {categorySections.length > 0 ? (
              categorySections.map(({ category, items }) => (
                <section
                  key={category.id}
                  id={category.id}
                  className="scroll-mt-36"
                >
                  <MenuCategoryCarousel
                    categoryId={String(category.id)}
                    categoryLabel={category.label}
                    categories={categories}
                    items={items}
                    onSelectItem={(dish) => setSelectedItem(dish)}
                  />
                </section>
              ))
            ) : (
              <div className="rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-8 text-center">
                <h2 className="font-editorial-serif text-lg font-medium text-(--color-text-primary)">
                  {activeCategory
                    ? "No hay productos disponibles"
                    : "La carta está en preparación"}
                </h2>

                <p className="mt-2 text-sm text-(--color-text-muted)">
                  {activeCategory
                    ? `Actualmente no hay productos disponibles en ${
                        activeCategoryLabel ?? "esta categoría"
                      }.`
                    : hasAvailableProducts
                      ? "No encontramos productos asociados a las categorías disponibles."
                      : "Este restaurante todavía no tiene productos disponibles."}
                </p>

                {activeCategory && (
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(null)}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-(--color-accent-terracotta) px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Ver toda la carta
                  </button>
                )}
              </div>
            )}
          </main>
        </>
      ) : (
        <div className="mx-auto my-10 max-w-md">
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

      <CustomerForm
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        initialData={customerData}
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
