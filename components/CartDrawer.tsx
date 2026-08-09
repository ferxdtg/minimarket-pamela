"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";
import CheckoutModal from "./CheckoutModal";
import WhatsAppCheckout from "./WhatsAppCheckout";
import Image from "next/image";

export default function CartDrawer() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    total
  } = useCart();

  const {
    cartOpen,
    closeCart
  } = useCartUI();

  const [showCheckout, setShowCheckout] = useState(false);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={`
        fixed
        inset-0
        z-50
        bg-black/50
        backdrop-blur-sm
        flex
        justify-end
        transition-all
        duration-300
        ${cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
    >
      <div
        className={`
          w-full
          max-w-md
          h-full
          bg-white
          text-gray-900
          shadow-2xl
          p-6
          flex
          flex-col
          border-l
          border-gray-200
          transform
          transition-transform
          duration-300
          ease-out
          ${cartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* ENCABEZADO LIMPIO */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl shadow-sm border border-red-100 text-red-600 font-black">
              🛒
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-gray-900">
                Tu Carrito
              </h2>
              <span className="text-xs text-gray-500 font-semibold">
                {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center text-lg font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* BANNER DE CONFIANZA SUTIL */}
        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
          <span className="text-xl">🛵</span>
          <div className="text-xs">
            <p className="font-bold text-amber-900">Delivery Express Activo</p>
            <p className="text-amber-700 font-medium">Tus productos llegan frescos directo a la puerta.</p>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS LIMPIA */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-4xl mb-4 border border-gray-100 shadow-inner">
              🛒
            </div>
            <p className="text-gray-800 font-bold text-base">Tu carrito está vacío</p>
            <p className="text-gray-400 text-xs mt-1 max-w-[200px]">Agrega productos del catálogo para armar tu pedido.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-gray-50/80 border border-gray-200/70 rounded-2xl p-3.5 shadow-sm transition hover:border-gray-300"
              >
                <div className="flex gap-3.5 items-center">
                  <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-gray-500 text-xs font-medium">
                        S/ {item.price.toFixed(2)} c/u
                      </span>
                      <span className="text-red-600 font-black text-sm">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-200/60">
                  <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold flex items-center justify-center cursor-pointer transition text-xs"
                    >
                      -
                    </button>
                    <span className="text-gray-900 font-bold w-8 text-center text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold flex items-center justify-center cursor-pointer transition text-xs"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-600 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm"
                  >
                    🗑 Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PIE DE PAGO LIMPIO Y FINANCIERO */}
        {cart.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4 space-y-3 bg-white">
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">Total estimado</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Delivery y costos incluidos</span>
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                S/ {total.toFixed(2)}
              </span>
            </div>

            {/* BOTÓN WHATSAPP PROFESIONAL (Sin resplandores nucleares) */}
            <WhatsAppCheckout />

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer border border-gray-200 shadow-sm"
            >
              Completar con formulario web 📋
            </button>

            <button
              onClick={closeCart}
              className="w-full py-1 text-gray-400 hover:text-gray-700 font-medium text-xs transition-colors cursor-pointer text-center block"
            >
              ← Seguir explorando el catálogo
            </button>

            {showCheckout && (
              <CheckoutModal
                cartItems={cart}
                onSuccess={() => {
                  cart.forEach(item => removeFromCart(item.id));
                }}
                onClose={() => {
                  setShowCheckout(false);
                  closeCart();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}