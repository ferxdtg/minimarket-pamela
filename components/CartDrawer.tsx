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
        bg-black/40
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
          bg-white
          shadow-2xl
          p-6
          flex
          flex-col
          transform
          transition-transform
          duration-300
          ease-in-out
          ${cartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-black text-gray-900">🛒 Mi carrito</h2>
          <button
            onClick={closeCart}
            className="text-gray-500 hover:text-black text-2xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
            Tu carrito está vacío
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-4"
              >
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-red-600 font-black mt-1">
                      S/ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/60">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold flex items-center justify-center cursor-pointer transition"
                    >
                      -
                    </button>
                    <span className="text-gray-900 font-bold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold flex items-center justify-center cursor-pointer transition"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="mt-6 border-t pt-5">
            <div className="flex justify-between mb-4 items-center">
              <span className="text-lg font-bold text-gray-700">Total a pagar:</span>
              <span className="text-2xl font-black text-red-600">
                S/ {total.toFixed(2)}
              </span>
            </div>

            {/* OPCIÓN PRINCIPAL: WhatsApp con el número +51 950323959 */}
            <WhatsAppCheckout />

            {/* OPCIÓN SECUNDARIA: Procesar pedido interno del sistema */}
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full mt-2.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm transition cursor-pointer border border-gray-300"
            >
              Procesar por plataforma web 📋
            </button>

            <button
              onClick={closeCart}
              className="w-full mt-2 py-2 text-gray-500 hover:text-gray-800 font-semibold text-xs transition cursor-pointer text-center"
            >
              ← Seguir comprando
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