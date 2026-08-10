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
          h-[100dvh]
          bg-[#121214]
          text-zinc-100
          shadow-2xl
          p-4 sm:p-5
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
        {/* ENCABEZADO COMPACTO */}
        <div className="flex justify-between items-center pb-3 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm text-red-500 font-black">
              🛒
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-white">
                Tu Carrito
              </h2>
              <p className="text-[10px] text-zinc-400 font-medium">
                {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs font-bold transition-all border border-zinc-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* BANNER EXPRESS COMPACTO */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 my-3 flex items-center gap-2.5 shrink-0 shadow-inner">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-xs shrink-0 border border-red-500/20">
            🛵
          </div>
          <div className="text-[11px]">
            <p className="font-bold text-red-400 leading-tight">Delivery Express Activo</p>
            <p className="text-zinc-400 font-medium leading-tight">Rápido y seguro a tu puerta.</p>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS ULTRA COMPACTA */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-2xl mb-2.5 border border-zinc-800">
              🛒
            </div>
            <p className="text-zinc-200 font-bold text-xs">Tu carrito está vacío</p>
            <p className="text-zinc-500 text-[11px] mt-0.5">Agrega productos del catálogo.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5 shadow-sm transition hover:border-zinc-700"
              >
                <div className="flex gap-2.5 items-center">
                  <div className="relative w-11 h-11 bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-zinc-100 truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-zinc-500 text-[10px] font-medium">
                        S/ {item.price.toFixed(2)} c/u
                      </span>
                      <span className="text-red-400 font-black text-xs">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60">
                  <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-5 h-5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center cursor-pointer text-[10px]"
                    >
                      -
                    </button>
                    <span className="text-zinc-100 font-bold w-5 text-center text-[11px]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="w-5 h-5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center cursor-pointer text-[10px]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-500 hover:text-red-400 font-semibold text-[10px] transition-colors cursor-pointer bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PIE DE PAGO FIJO Y COMPACTO */}
        {cart.length > 0 && (
          <div className="mt-3 border-t border-zinc-800/80 pt-3 space-y-2.5 shrink-0 bg-[#121214]">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex justify-between items-center shadow-inner">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total a pagar</span>
              <span className="text-lg font-black text-white tracking-tight">
                S/ {total.toFixed(2)}
              </span>
            </div>

            {/* CHECKOUT WHATSAPP CON OPCIÓN DESPLEGABLE */}
            <WhatsAppCheckout cartItems={cart} totalAmount={total} onClose={closeCart} />

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-[11px] transition-all cursor-pointer border border-zinc-800"
            >
              Completar con formulario web 📋
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