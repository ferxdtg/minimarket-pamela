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
          bg-[#121214]
          text-zinc-100
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
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-lg text-red-500 font-black">
              🛒
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white">
                Tu Carrito
              </h2>
              <p className="text-[11px] text-zinc-400 font-medium">
                {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'} seleccionados
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all border border-zinc-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* BANNER EXPRESS */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 mb-4 flex items-center gap-3 shadow-inner">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-base shrink-0 border border-red-500/20">
            🛵
          </div>
          <div className="text-xs">
            <p className="font-bold text-red-400">Delivery Express Activo</p>
            <p className="text-zinc-400 font-medium">Tus productos llegan frescos y rápidos a la puerta.</p>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-3xl mb-3 border border-zinc-800 shadow-inner">
              🛒
            </div>
            <p className="text-zinc-200 font-bold text-sm">Tu carrito está vacío</p>
            <p className="text-zinc-500 text-xs mt-1 max-w-[200px]">Agrega productos del catálogo para armar tu pedido.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 shadow-sm transition hover:border-zinc-700"
              >
                <div className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800 shadow-inner">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-zinc-100 truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-zinc-500 text-[11px] font-medium">
                        S/ {item.price.toFixed(2)} c/u
                      </span>
                      <span className="text-red-400 font-black text-xs">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60">
                  <div className="flex items-center bg-zinc-950 rounded-xl p-1 border border-zinc-800">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center cursor-pointer transition text-xs"
                    >
                      -
                    </button>
                    <span className="text-zinc-100 font-bold w-6 text-center text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center cursor-pointer transition text-xs"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-500 hover:text-red-400 font-semibold text-[11px] transition-colors cursor-pointer bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PIE DE PAGO */}
        {cart.length > 0 && (
          <div className="mt-4 border-t border-zinc-800/80 pt-4 space-y-3 bg-[#121214]">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 flex justify-between items-center shadow-inner">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Total estimado</span>
                <span className="text-[10px] text-emerald-400 font-medium">Delivery y costos incluidos</span>
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                S/ {total.toFixed(2)}
              </span>
            </div>

            {/* BOTÓN WHATSAPP CON PROPS REQUERIDAS */}
            <WhatsAppCheckout cartItems={cart} totalAmount={total} onClose={closeCart} />

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-all cursor-pointer border border-zinc-800 shadow-sm"
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