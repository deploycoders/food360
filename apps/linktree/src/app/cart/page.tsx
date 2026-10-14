'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';
import { submitOrder } from '@/lib/orderService';
import { formatCurrency } from '@/lib/formatters';
import { OrderPayload } from '@/types';
import CustomerForm from '@/components/CustomerForm';

export default function CartPage() {
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart } = useCart();
  const { originId, originType, customerData, isCustomerRegistered, setCustomerData } = useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderPayload | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const handleSendOrder = async () => {
    if (!isCustomerRegistered || !customerData) {
      setShowCustomerModal(true);
      return;
    }

    if (items.length === 0) return;

    try {
      setIsSubmitting(true);
      const result = await submitOrder(items, customerData, originId, originType);
      setSubmittedOrder(result);
      clearCart();
    } catch (err) {
      console.error('Error al enviar pedido:', err);
      alert('Hubo un problema enviando el pedido. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const originLabel = originType === 'mesa'
    ? `Mesa ${originId.replace(/^mesa-?/i, '')}`
    : originType === 'delivery'
    ? 'Servicio Delivery'
    : originId;

  // 1. VISTA: ORDEN ENVIADA AL KDS CON ÉXITO
  if (submittedOrder) {
    return (
      <main className="min-h-screen bg-[var(--color-bg-base)] flex flex-col items-center justify-center p-6 md:p-10 text-center w-full max-w-3xl mx-auto animate-fade-in text-[var(--color-text-body)]">
        <div className="w-14 h-14 rounded-full bg-[#EBF3ED] text-[var(--color-forest)] flex items-center justify-center text-xl font-bold mb-4 border border-[#D5E6D8]">
          ✓
        </div>

        <h1 className="font-editorial-serif text-2xl sm:text-3xl font-medium text-[var(--color-text-primary)] mb-2">
          Comanda Enviada a Cocina
        </h1>
        <p className="text-[13px] text-[var(--color-text-muted)] max-w-xs mb-6 font-normal">
          Tu orden ha sido estructurada y despachada hacia el sistema KDS.
        </p>

        {/* Recibo Editorial Elegante */}
        <div className="w-full max-w-sm bg-white rounded-xl p-5 text-left mb-6 space-y-3.5 border border-[var(--color-border)] shadow-xs">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">Código de Orden:</span>
            <span className="font-mono font-bold text-[var(--color-text-primary)]">{submittedOrder.id}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-text-muted)]">Comensal:</span>
            <span className="font-medium text-[var(--color-text-primary)]">{submittedOrder.customer.nombre}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-text-muted)]">Ubicación:</span>
            <span className="font-semibold text-[var(--color-forest)]">{originLabel}</span>
          </div>

          <div className="pt-2 border-t border-[var(--color-border)]">
            <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-subtle)] mb-2">
              Detalle ({submittedOrder.itemCount} platos)
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-[#F3EFE6]">
              {submittedOrder.items.map((it) => (
                <div key={it.menuItemId} className="pt-1.5 flex justify-between text-xs">
                  <span className="text-[var(--color-text-body)]">{it.quantity}x {it.name}</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(it.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] flex justify-between items-center">
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">Total a Pagar</span>
            <span className="font-editorial-serif text-xl font-medium text-[var(--color-text-primary)]">
              {formatCurrency(submittedOrder.total)}
            </span>
          </div>
        </div>

        <Link
          href="/menu"
          className="w-full max-w-sm py-3 rounded-lg bg-[var(--color-forest)] hover:bg-[#132417] text-white font-medium text-xs tracking-wide text-center no-underline cursor-pointer shadow-xs transition-colors"
        >
          Volver a la Carta
        </Link>
      </main>
    );
  }

  // 2. VISTA: CARRITO VACÍO
  if (items.length === 0) {
    return (
    <main className="min-h-screen bg-[var(--color-bg-base)] flex flex-col items-center justify-center p-6 md:p-10 text-center w-full max-w-3xl mx-auto text-[var(--color-text-body)]">
        <div className="w-14 h-14 rounded-full bg-[#F3EFE6] flex items-center justify-center text-[var(--color-text-muted)] mb-4 border border-[var(--color-border)]">
          <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h2 className="font-editorial-serif text-xl font-medium text-[var(--color-text-primary)] mb-1.5">
          Tu comanda está vacía
        </h2>
        <p className="text-[13px] text-[var(--color-text-muted)] max-w-xs mb-6 font-normal">
          Explora nuestra carta gastronómica y añade los platos que desees degustar.
        </p>
        <Link
          href="/menu"
          className="px-6 py-2.5 rounded-lg bg-[var(--color-forest)] hover:bg-[#132417] text-white font-medium text-xs tracking-wide no-underline cursor-pointer shadow-xs transition-colors"
        >
          Explorar la Carta
        </Link>
      </main>
    );
  }

  // 3. VISTA: LISTA DE CARRITO Y REVISIÓN DE COMANDA
  return (
    <main className="min-h-screen bg-[var(--color-bg-base)] flex flex-col px-4 md:px-10 lg:px-16 pt-5 md:pt-8 pb-12 w-full max-w-4xl mx-auto text-[var(--color-text-body)]">
      {/* Encabezado Superior */}
      <div className="flex items-center justify-between mb-5">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[var(--color-text-muted)] hover:text-[var(--color-forest)] no-underline transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Carta</span>
        </Link>

        <h1 className="font-editorial-serif text-xl font-medium text-[var(--color-text-primary)]">
          Revisión de Comanda
        </h1>

        <span className="text-[10px] font-semibold text-[var(--color-forest)] bg-[#F3EFE6] px-2.5 py-0.5 rounded-md border border-[var(--color-border)]">
          {originLabel}
        </span>
      </div>

      {/* Datos del Comensal */}
      <div className="bg-white rounded-xl p-3.5 mb-4 border border-[var(--color-border)] shadow-xs flex items-center justify-between">
        {customerData ? (
          <div>
            <p className="text-[10px] uppercase tracking-[0.05em] font-medium text-[var(--color-text-subtle)]">
              Datos del Comensal
            </p>
            <p className="text-[14px] font-medium text-[var(--color-text-primary)] mt-0.5">
              {customerData.nombre}
            </p>
            <p className="text-[12px] text-[var(--color-text-muted)]">
              C.I. {customerData.cedula} · Tel: {customerData.telefono}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-[var(--color-accent-terracotta)]">
              Faltan tus datos de contacto
            </p>
            <p className="text-[12px] text-[var(--color-text-muted)]">
              Requerido para procesar el pedido
            </p>
          </div>
        )}

        <button
          onClick={() => setShowCustomerModal(true)}
          className="px-2.5 py-1 rounded-md border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
        >
          {customerData ? 'Editar' : 'Completar'}
        </button>
      </div>

      {/* Lista de Platos en la Comanda */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-xs divide-y divide-[#F3EFE6] mb-5 overflow-hidden">
        {items.map((item) => (
          <div key={item.menuItem.id} className="p-3.5 flex gap-3 items-center">
            <div className="relative w-14 h-14 rounded-md overflow-hidden bg-[#F3EFE6] flex-shrink-0 border border-neutral-100">
              <Image
                src={item.menuItem.image}
                alt={item.menuItem.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="font-editorial-serif text-[14px] font-medium text-[var(--color-text-primary)] truncate">
                  {item.menuItem.name}
                </h4>
                <button
                  onClick={() => removeItem(item.menuItem.id)}
                  className="text-neutral-400 hover:text-[var(--color-accent-terracotta)] text-xs px-1 cursor-pointer transition-colors"
                  aria-label="Eliminar item"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-md border border-[var(--color-border)] flex items-center justify-center text-xs font-medium hover:bg-neutral-50 cursor-pointer"
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-semibold text-xs text-[var(--color-text-primary)]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-md border border-[var(--color-border)] flex items-center justify-center text-xs font-medium hover:bg-neutral-50 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <span className="font-sans font-bold text-[13px] text-[var(--color-text-primary)]">
                  {formatCurrency(item.menuItem.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de Cuenta */}
      <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] shadow-xs space-y-2.5 mb-4">
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>Platos Seleccionados</span>
          <span className="font-medium text-[var(--color-text-primary)]">{totalItems} uds</span>
        </div>
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>Subtotal</span>
          <span className="font-medium text-[var(--color-text-primary)]">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="h-[1px] bg-[#F3EFE6] my-1" />
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">Total a Pagar</span>
          <span className="font-editorial-serif text-xl font-semibold text-[var(--color-text-primary)]">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      {/* Botón de Enviar Pedido (10% Acento Terracota) */}
      <button
        onClick={handleSendOrder}
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-lg bg-[var(--color-accent-terracotta)] hover:bg-[var(--color-accent-terracotta-hover)] text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Despachando a Cocina...</span>
          </>
        ) : (
          <span>Enviar Comanda a Cocina</span>
        )}
      </button>

      {/* Modal de Datos del Comensal */}
      <CustomerForm
        isOpen={showCustomerModal}
        onSubmit={(data) => {
          setCustomerData(data);
          setShowCustomerModal(false);
        }}
      />
    </main>
  );
}
