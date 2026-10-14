import { CartItem, CustomerData, OrderPayload } from '@/types';
import { restaurantId } from '@/data/restaurant';
import { generateOrderId } from './formatters';

interface ApiOrderResponse {
  success: boolean;
  order_id?: string;
  error?: string;
}

function getOrdersEndpoint(): string | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiUrl) return null;

  const normalizedUrl = apiUrl.replace(/\/+$/, '');
  return normalizedUrl.endsWith('/api/v1/orders')
    ? normalizedUrl
    : `${normalizedUrl}/api/v1/orders`;
}

/**
 * Empaqueta y envía la orden al KDS (Kitchen Display System).
 *
 * Si la API está configurada, persiste la orden en el backend central. Sin
 * configuración, conserva el modo local para poder desarrollar el menú sin
 * levantar servicios externos.
 */
export async function submitOrder(
  items: CartItem[],
  customer: CustomerData,
  originId: string,
  originType: 'mesa' | 'delivery' | 'unknown'
): Promise<OrderPayload> {
  const payload: OrderPayload = {
    id: generateOrderId(),
    items: items.map((item) => ({
      menuItemId: item.menuItem.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.menuItem.price,
      subtotal: item.menuItem.price * item.quantity,
    })),
    customer: {
      nombre: customer.nombre.trim(),
      cedula: customer.cedula.trim(),
      telefono: customer.telefono.trim(),
    },
    originId,
    originType,
    total: items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  const endpoint = getOrdersEndpoint();
  if (!endpoint) {
    return payload;
  }

  if (!restaurantId) {
    throw new Error(
      'NEXT_PUBLIC_RESTAURANT_ID es requerido cuando NEXT_PUBLIC_API_URL está configurado.',
    );
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      restaurant_id: restaurantId,
      phone: payload.customer.telefono,
      full_name: payload.customer.nombre,
      origin:
        payload.originType === 'mesa'
          ? 'DINE_IN'
          : payload.originType === 'delivery'
            ? 'DELIVERY'
            : 'WALK_IN',
      total_amount: payload.total,
      items: payload.items.map((item) => ({
        product_id: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
      })),
    }),
  });

  let result: ApiOrderResponse;
  try {
    result = (await response.json()) as ApiOrderResponse;
  } catch {
    throw new Error(`La API devolvió una respuesta inválida (${response.status}).`);
  }

  if (!response.ok || !result.success || !result.order_id) {
    throw new Error(result.error ?? `No se pudo crear la orden (${response.status}).`);
  }

  return { ...payload, id: result.order_id };
}
