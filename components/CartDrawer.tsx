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

  return (
    <div
      className={`
        fixed
        inset-0
        z-50
        bg-black/70
        backdrop-blur-sm
        flex
        justify-end
        transition-opacity
        duration-300
        ${cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
    >
      <div
        className={`
          w-full
          max-w-md
          h-full
          bg-zinc-900
          text-white
          shadow-2xl
          p-6
          flex
          flex-col
          border-l
          border-zinc-800
          transform
          transition-transform
          duration-300
          ease-in-out
          ${cartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🛒</span>
            <h2 className="text-xl font-black tracking-tight">Tu Carrito</h2>
            <span className="bg-red-500/20 text-red-400 text-xs font-black px-2.5 py-0.5 rounded-full border border-red-500/30">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xl font-bold transition cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* BARRA DE CONFIANZA EXPRESS (Contraste mejorado) */}
        <div className="bg-gradient-to-r from-red-500/20 via-orange-500/10 to-transparent border border-red-500/30 rounded-2xl p-3.5 mb-4 flex items-center gap-3 shadow-inner">
          <span className="text-2xl">🛵</span>
          <div className="text-xs">
            <p className="font-bold text-red-200">Delivery Express Activo</p>
            <p className="text-zinc-300 font-medium">Tus productos llegan frescos en menos de 30 min.</p>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="text-6xl mb-3 animate-pulse">🛒</div>
            <p className="text-zinc-300 font-bold">Tu carrito está vacío</p>
            <p className="text-zinc-500 text-xs mt-1">Agrega productos para empezar tu pedido</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-zinc-800/80 border border-zinc-700/80 rounded-2xl p-4 shadow-md backdrop-blur-sm transition hover:border-zinc-600"
              >
                <div className="flex gap-3.5 items-center">
                  <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-zinc-700">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline justify-between mt-1">
                      <p className="text-zinc-400 text-xs">
                        S/ {item.price.toFixed(2)} c/u
                      </p>
                      <p className="text-red-400 font-black text-sm">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700/60">
                  <div className="flex items-center bg-zinc-900/90 rounded-xl p-1 border border-zinc-700">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center cursor-pointer transition text-xs"
                    >
                      -
                    </button>
                    <span className="text-white font-bold w-7 text-center text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center cursor-pointer transition text-xs"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-400 hover:text-red-400 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PIE DE PAGO Y ACCIONES */}
        {cart.length > 0 && (
          <div className="mt-4 border-t border-zinc-800 pt-4 space-y-3 bg-zinc-900">
            <div className="bg-zinc-800/60 border border-zinc-700/80 rounded-2xl p-4 flex justify-between items-center shadow-inner">
              <span className="text-sm font-semibold text-zinc-300">Total estimado:</span>
              <span className="text-2xl font-black text-white tracking-tight">
                S/ {total.toFixed(2)}
              </span>
            </div>

            {/* BOTÓN PRINCIPAL DE WHATSAPP */}
            <WhatsAppCheckout />

            {/* OPCIÓN SECUNDARIA */}
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition cursor-pointer border border-zinc-700"
            >
              Completar con formulario web 📋
            </button>

            <button
              onClick={closeCart}
              className="w-full py-1.5 text-zinc-500 hover:text-zinc-300 font-semibold text-xs transition cursor-pointer text-center block"
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