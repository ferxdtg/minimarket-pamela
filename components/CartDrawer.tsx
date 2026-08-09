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
        bg-black/80
        backdrop-blur-md
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
          bg-zinc-950
          text-white
          shadow-2xl
          p-6
          flex
          flex-col
          border-l
          border-zinc-800/80
          transform
          transition-transform
          duration-300
          ease-out
          ${cartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* ENCABEZADO PREMIUM */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-xl shadow-inner">
              🛒
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Tu Carrito
              </h2>
              <p className="text-xs text-zinc-400 font-medium">{totalItemsCount} productos seleccionados</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xl font-bold transition-all border border-zinc-800 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* BANNER DE GARANTÍA EXPRESS ESTILO APP GLOBAL */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/20 rounded-2xl p-3.5 mb-4 flex items-center gap-3.5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <span className="text-2xl">⚡</span>
          <div className="text-xs">
            <p className="font-extrabold text-emerald-400 tracking-wide uppercase text-[10px]">Garantía Minimarket Pamela</p>
            <p className="text-zinc-300 font-medium mt-0.5">Despacho prioritario en puerta en menos de 30 min.</p>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS ELEGANTE */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="text-6xl mb-3 animate-pulse">🛒</div>
            <p className="text-zinc-200 font-bold text-base">Tu carrito está vacío</p>
            <p className="text-zinc-500 text-xs mt-1 max-w-[200px]">Explora el catálogo y añade productos para armar tu pedido.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 shadow-xl transition-all hover:border-zinc-700 relative group"
              >
                <div className="flex gap-3.5 items-center">
                  <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-zinc-700/50 shadow-inner">
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
                    <div className="flex items-baseline justify-between mt-1.5">
                      <span className="text-zinc-400 text-xs font-medium">
                        S/ {item.price.toFixed(2)} c/u
                      </span>
                      <span className="text-red-400 font-black text-sm tracking-tight">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center bg-zinc-950 rounded-xl p-1 border border-zinc-800">
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
                    className="text-zinc-500 hover:text-red-400 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 bg-zinc-950/50 px-2.5 py-1 rounded-lg border border-zinc-800/50"
                  >
                    🗑 Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PIE DE COBRO Y CONVERSIÓN DE ALTO IMPACTO */}
        {cart.length > 0 && (
          <div className="mt-4 border-t border-zinc-800/80 pt-4 space-y-3 bg-zinc-950">
            {/* TARJETA TOTAL */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/60 border border-zinc-800 rounded-2xl p-4 shadow-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total a pagar</span>
                <p className="text-[10px] text-emerald-400 font-medium">Incluye impuestos y delivery</p>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                S/ {total.toFixed(2)}
              </span>
            </div>

            {/* BOTÓN WHATSAPP CON EFECTO PULSO Y GLOW ELITE */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl blur-md opacity-40 group-hover:opacity-80 transition duration-300 animate-pulse"></div>
              <div className="relative">
                <WhatsAppCheckout />
              </div>
            </div>

            {/* OPCIÓN SECUNDARIA MINIMALISTA */}
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs transition-all cursor-pointer border border-zinc-800 shadow-sm"
            >
              Completar con formulario web 📋
            </button>

            <button
              onClick={closeCart}
              className="w-full py-1.5 text-zinc-500 hover:text-zinc-300 font-semibold text-xs transition-colors cursor-pointer text-center block"
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