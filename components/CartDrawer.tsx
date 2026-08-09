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
        bg-black/75
        backdrop-blur-md
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
          bg-[#0d0d0f]
          text-white
          shadow-2xl
          p-6
          flex
          flex-col
          border-l
          border-zinc-800/60
          transform
          transition-transform
          duration-300
          ease-out
          ${cartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* ENCABEZADO ELITE */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-xl shadow-lg shadow-red-600/20 border border-red-500/30">
              🛒
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Tu Carrito
              </h2>
              <span className="inline-block bg-zinc-800/80 text-zinc-300 text-[11px] font-semibold px-2 py-0.5 rounded-md mt-0.5 border border-zinc-700/50">
                {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-lg font-bold transition-all border border-zinc-800 cursor-pointer shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* BANNER DE GARANTÍA CON MICRO-GRADIENTE */}
        <div className="bg-gradient-to-r from-emerald-950/50 via-zinc-900/80 to-zinc-900 border border-emerald-500/25 rounded-2xl p-4 mb-4 flex items-center gap-3.5 shadow-xl relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg shrink-0 border border-emerald-500/20">
            ⚡
          </div>
          <div className="text-xs">
            <p className="font-extrabold text-emerald-400 tracking-wider uppercase text-[10px]">Envío Prioritario Garantizado</p>
            <p className="text-zinc-300 font-medium mt-0.5 leading-snug">Tus productos saldrán directos y frescos hacia tu puerta.</p>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS CON CAPAS DE PROFUNDIDAD */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center text-4xl mb-4 border border-zinc-800 shadow-inner animate-pulse">
              🛒
            </div>
            <p className="text-zinc-200 font-bold text-base">Tu carrito está vacío</p>
            <p className="text-zinc-500 text-xs mt-1.5 max-w-[220px] leading-relaxed">Explora el minimarket y añade lo que necesites para comenzar tu pedido.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-gradient-to-b from-zinc-900/90 to-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3.5 shadow-lg transition-all hover:border-zinc-700/80"
              >
                <div className="flex gap-3.5 items-center">
                  <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800 shadow-sm">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate tracking-tight">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-zinc-400 text-xs font-medium">
                        S/ {item.price.toFixed(2)} c/u
                      </span>
                      <span className="text-red-400 font-black text-sm tracking-tight">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60">
                  <div className="flex items-center bg-zinc-950 rounded-xl p-1 border border-zinc-800/80 shadow-inner">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center cursor-pointer transition text-xs shadow-sm"
                    >
                      -
                    </button>
                    <span className="text-white font-black w-8 text-center text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center cursor-pointer transition text-xs shadow-sm"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-500 hover:text-red-400 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 bg-zinc-950/60 px-2.5 py-1.5 rounded-lg border border-zinc-800/60"
                  >
                    🗑 Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER DE CONVERSIÓN SUPREMA */}
        {cart.length > 0 && (
          <div className="mt-4 border-t border-zinc-800/80 pt-4 space-y-3 bg-[#0d0d0f]">
            {/* CAJA DE TOTAL FINANCIERO */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-inner flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">Total estimado</span>
                <span className="text-[10px] text-emerald-400 font-medium tracking-wide">Impuestos y delivery incluidos</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                S/ {total.toFixed(2)}
              </span>
            </div>

            {/* BOTÓN WHATSAPP DE MÁXIMO IMPACTO VISUAL */}
            <div className="relative group pt-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-2xl blur-lg opacity-35 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
              <div className="relative">
                <WhatsAppCheckout />
              </div>
            </div>

            {/* ACCIÓN SECUNDARIA */}
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white font-semibold text-xs transition-all cursor-pointer border border-zinc-800/80 shadow-sm"
            >
              Completar con formulario web 📋
            </button>

            <button
              onClick={closeCart}
              className="w-full py-1 text-zinc-500 hover:text-zinc-300 font-medium text-xs transition-colors cursor-pointer text-center block"
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