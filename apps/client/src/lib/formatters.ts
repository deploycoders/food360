export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatPhone(phone: string): string {
  // Format Venezuelan phone: +58 414-123-4567
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13 && cleaned.startsWith('58')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }
  return phone;
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function parseOriginId(id: string | null): { originId: string; originType: 'mesa' | 'delivery' | 'unknown' } {
  if (!id) {
    return { originId: 'walk-in', originType: 'unknown' };
  }

  const lowered = id.toLowerCase();

  if (lowered.startsWith('mesa') || lowered.startsWith('table')) {
    return { originId: id, originType: 'mesa' };
  }

  if (lowered === 'delivery' || lowered === 'envio') {
    return { originId: id, originType: 'delivery' };
  }

  return { originId: id, originType: 'unknown' };
}
