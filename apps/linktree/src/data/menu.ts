import { MenuItem, CategoryInfo, MenuCategory } from '@/types';

export const categories: CategoryInfo[] = [
  { id: 'summer-bites', label: 'Summer Bites' },
  { id: 'happy-hour', label: 'Happy Hour' },
  { id: 'fan-tuan', label: 'Fan Tuan' },
  { id: 'cold-appetizers', label: 'Cold Appetizers' },
  { id: 'hot-appetizers', label: 'Hot Appetizers' },
  { id: 'dim-sum', label: 'Dim Sum' },
  { id: 'main-dishes', label: 'Main Dishes' },
  { id: 'drinks', label: 'Drinks & Cocktails' },
  { id: 'desserts', label: 'Desserts' },
];

export const menuItems: MenuItem[] = [
  // --- SUMMER BITES ---
  {
    id: 'sb-001',
    name: 'Sichuan Beef Tendon',
    description: 'Sichuan chili sauce, scallion, salted roasted peanuts, fragrant sesame oil.',
    price: 12.00,
    category: 'summer-bites',
    available: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    tags: ['Spicy', 'Chef Special'],
  },
  {
    id: 'sb-002',
    name: 'Chili Crunch Burrata',
    description: 'Roasted chili jam, hot honey chili crunch, crispy onion, pickled shallot, Chinese donut croutons.',
    price: 14.00,
    category: 'summer-bites',
    available: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=600&q=80',
    tags: ['Vegetarian', 'Popular'],
  },
  {
    id: 'sb-003',
    name: 'General Tso\'s Wings',
    description: 'Crisp fried chicken wings tossed in tangy sweet chili glaze, sesame seeds, scallion.',
    price: 16.00,
    category: 'summer-bites',
    available: true,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
    tags: ['Crispy'],
  },
  {
    id: 'sb-004',
    name: 'Calamari with Mala BBQ Spice',
    description: 'Crispy wild calamari, Sichuan mala spice dust, wasabi citrus mayo, lime.',
    price: 18.00,
    category: 'summer-bites',
    available: true,
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    tags: ['Seafood', 'Spicy'],
  },

  // --- HAPPY HOUR ---
  {
    id: 'hh-001',
    name: 'Wintermelon Margarita',
    description: 'Premium tequila, empirical stonefruit, fresh wintermelon, pineapple, okinawa juice.',
    price: 10.00,
    category: 'happy-hour',
    available: true,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
    tags: ['Cocktail', '2-5 PM'],
  },
  {
    id: 'hh-002',
    name: 'Dan Dan Sesame Noodles',
    description: 'Handcrafted noodles, savory minced pork, house chili crunch, cucumber ribbons, scallion.',
    price: 12.00,
    category: 'happy-hour',
    available: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    tags: ['Handmade', 'Spicy'],
  },
  {
    id: 'hh-003',
    name: 'Crispy Fried Tofu',
    description: 'Sichuan peppercorn crust, sweet chili garlic soy reduction, toasted sesame.',
    price: 8.00,
    category: 'happy-hour',
    available: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    tags: ['Vegan'],
  },

  // --- FAN TUAN ---
  {
    id: 'ft-001',
    name: 'Fan Tuan Clásico',
    description: 'Arroz glutinoso negro prohibido, huevo frito, mostaza encurtida, rábano salado, buñuelo chino crujiente y aceite de chile casero.',
    price: 9.50,
    category: 'fan-tuan',
    available: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=600&q=80',
    tags: ['Takeout Special', 'Hasta 4 PM'],
  },
  {
    id: 'ft-002',
    name: 'Fan Tuan con Tofu Marinado',
    description: 'Arroz negro, tofu marinado a las 5 especias, huevo frito, vegetales encurtidos y salsa aromática.',
    price: 11.00,
    category: 'fan-tuan',
    available: true,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    tags: ['Vegetariano'],
  },
  {
    id: 'ft-003',
    name: 'Fan Tuan con Salchicha Taiwanesa',
    description: 'Arroz negro, salchicha artesanal dulce-salada, buñuelo chino crujiente y pork floss con salsa picante.',
    price: 12.00,
    category: 'fan-tuan',
    available: true,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    tags: ['Favorito'],
  },

  // --- COLD APPETIZERS ---
  {
    id: 'ca-001',
    name: 'Pepinos Marinados al Ajo',
    description: 'Pepino crujiente aplastado en vinagre negro añejo de Chinkiang, ajo picado, aceite de sésamo y chile.',
    price: 8.00,
    category: 'cold-appetizers',
    available: true,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    tags: ['Refrescante'],
  },
  {
    id: 'ca-002',
    name: 'Sichuan Bang Bang Chicken',
    description: 'Pollo de corral desmenuzado, aderezo cremoso de sésamo y chile Sichuan, apio chino y maní tostado.',
    price: 19.00,
    category: 'cold-appetizers',
    available: true,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    tags: ['Especialidad'],
  },

  // --- HOT APPETIZERS ---
  {
    id: 'ha-001',
    name: 'Wontons de Camarón en Aceite de Chile',
    description: 'Masa fina rellena de camarón fresco bañada en salsa picante aromática, cebollín y sésamo blanco.',
    price: 15.00,
    category: 'hot-appetizers',
    available: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80',
    tags: ['Must Try'],
  },
  {
    id: 'ha-002',
    name: 'Panqueque de Huevo con Res Braseada',
    description: 'Crepe chino crujiente con falda de res braseada, salsa hoisin picante, pepino y cilantro.',
    price: 15.00,
    category: 'hot-appetizers',
    available: true,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
  },

  // --- DIM SUM ---
  {
    id: 'ds-001',
    name: 'Shrimp Har Gow (4 uds)',
    description: 'Masa translúcida al vapor rellena de jugosos camarones enteros y bambú tierno.',
    price: 8.50,
    category: 'dim-sum',
    available: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
    tags: ['Al Vapor'],
  },
  {
    id: 'ds-002',
    name: 'Pork & Shrimp Siu Mai',
    description: 'Canastitas abiertas de cerdo magro y camarón con huevas de pescado al tope.',
    price: 8.50,
    category: 'dim-sum',
    available: true,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ds-003',
    name: 'Truffle Rice Roll (Cheung Fun)',
    description: 'Rollos sedosos de harina de arroz rellenos de camarón bañados con aceite de trufa negra y soya dulce.',
    price: 9.50,
    category: 'dim-sum',
    available: true,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80',
    tags: ['Trufa'],
  },

  // --- MAIN DISHES ---
  {
    id: 'md-001',
    name: '"Dong Po" Braised Pork Belly',
    description: 'Panceta de cerdo braseada lentamente durante 6 horas en vino Shaoxing y soya oscura, acompañada de bok choy tierno.',
    price: 22.00,
    category: 'main-dishes',
    available: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    tags: ['Firma de la Casa'],
  },
  {
    id: 'md-002',
    name: 'Golden Crab Soup Noodles',
    description: 'Fideos artesanales servidos en un concentrado y sedoso caldo de cangrejo real con jengibre y cebollín.',
    price: 24.00,
    category: 'main-dishes',
    available: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    tags: ['Plato Estrella'],
  },

  // --- DRINKS & COCKTAILS ---
  {
    id: 'dr-001',
    name: 'Yum Cha Fizz Mocktail',
    description: 'Destilado botánico Seedlip, cordial de manzana verde, melón de invierno y té de crisantemo carbonatado.',
    price: 12.00,
    category: 'drinks',
    available: true,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    tags: ['Sin Alcohol'],
  },
  {
    id: 'dr-002',
    name: 'Monkey King Slushy Cocktail',
    description: 'Ron añejo Oaxaqueño, plátano flameado, piña asada, crema de coco y jugo de cítricos.',
    price: 16.00,
    category: 'drinks',
    available: true,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
  },

  // --- DESSERTS ---
  {
    id: 'de-001',
    name: 'Peanut Chili Crunch Sundae',
    description: 'Helado artesanal de vainilla Bourbon, caramelo salado de maní, maní tostado y chili crunch casero.',
    price: 8.00,
    category: 'desserts',
    available: true,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    tags: ['Dulce & Picante'],
  },
  {
    id: 'de-002',
    name: 'Pineapple Butter Cake',
    description: 'Piña caramelizada a la brasa, toffee de mantequilla, crumble de galleta y helado de crema.',
    price: 10.00,
    category: 'desserts',
    available: true,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
  },
];

export const popularDishes = menuItems.filter((item) => item.isPopular);

export function getMenuByCategory(category: MenuCategory): MenuItem[] {
  return menuItems.filter((item) => item.category === category && item.available);
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return menuItems.find((item) => item.id === id);
}
