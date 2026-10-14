'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export default function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) {
      const currentInCart = getItemQuantity(item.id);
      queueMicrotask(() => {
        setQuantity(currentInCart > 0 ? currentInCart : 1);
      });
    }
  }, [item, getItemQuantity]);

  if (!item) return null;

  const handleAddToCart = () => {
    const currentInCart = getItemQuantity(item.id);
    if (currentInCart > 0) {
      updateQuantity(item.id, quantity);
    } else {
      for (let i = 0; i < quantity; i++) {
        addItem(item);
      }
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs animate-fade-in" />

      {/* Modal / Bottom Sheet */}
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Big Food Image */}
        <div className="relative h-64 sm:h-72 w-full bg-neutral-900 flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="font-sans font-black text-2xl uppercase tracking-tight text-neutral-900">
              {item.name}
            </h3>
            <span className="font-mono font-black text-2xl text-neutral-900">
              {formatCurrency(item.price)}
            </span>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
            {item.description}
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between py-4 border-t border-b border-neutral-100 mb-6">
            <span className="text-sm font-bold text-neutral-900">
              Cantidad
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-lg font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                −
              </button>
              <span className="w-8 text-center font-black text-base">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-lg font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Order Button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider flex items-center justify-between px-6 transition-all cursor-pointer shadow-lg shadow-red-600/30 active:scale-[0.98]"
          >
            <span>Agregar al Pedido</span>
            <span className="font-mono text-base">{formatCurrency(item.price * quantity)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
