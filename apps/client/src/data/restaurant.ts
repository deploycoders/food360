import { RestaurantInfo } from '@/types';

export const restaurant: RestaurantInfo = {
  name: '360 food',
  tagline: 'Good food, made simple',
  description: '360 food ofrece una experiencia gastronómica cercana con platos para compartir, favoritos de la casa y pedidos sencillos.',
  logoText: '360 food',
  heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  address: 'Av. Principal Gastronómica, Local 4B',
  googleMapsUrl: 'https://maps.google.com/?q=360+food',
  openStatus: 'Open now',
  openUntil: 'until 10pm',
  whatsapp: '+584141234567',
  whatsappMessage: '¡Hola 360 food! Deseo hacer una consulta sobre el menú.',
  wifi: {
    ssid: '',
    password: '',
  },
  socialLinks: [
    {
      platform: 'instagram',
      url: 'https://instagram.com/quacuisine',
      label: 'Instagram',
      emoji: '📸',
    },
    {
      platform: 'tiktok',
      url: 'https://tiktok.com/@quacuisine',
      label: 'TikTok',
      emoji: '🎵',
    },
  ],
  happyHour: {
    badge: '• HAPPY HOUR •',
    title: 'Happy Hour Menu',
    schedule: 'Mon-Fri · 2 PM–5 PM · Excluding Holidays',
  },
  currency: 'USD',
  currencySymbol: '$',
};

export const restaurantId = process.env.NEXT_PUBLIC_RESTAURANT_ID ?? '';
