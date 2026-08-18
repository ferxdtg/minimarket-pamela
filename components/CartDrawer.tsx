"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";
import CheckoutModal from "./CheckoutModal";
import WhatsAppCheckout from "./WhatsAppCheckout";
import Image from "next/image";

export default function CartDrawer() {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, total } = useCart();
  const { cartOpen, closeCart } = useCartUI();
  const [showCheckout, setShowCheckout] = useState(false);
  
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleContinueShopping = () => {
    closeCart();
    const productsSection = document.getElementById("productos-section") || document.getElementById("catalogo");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 500, behavior: "smooth" });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity duration-500 ${cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      
      <div className={`w-full max-w-md h-[100dvh] bg-zinc-950/95 backdrop-blur-xl text-zinc-100 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-5 sm:p-6 flex flex-col rounded-l-[2rem] sm:rounded-l-[3rem] border-l border-zinc-800/50 transform transition-transform duration-500 ease-[cubic-bezier(0.3,0.9,0.4,1)] ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-lg text-white font-black shadow-[0_2px_10px_rgba(220,38,38,0.3)]">
              🛍️
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white leading-none">
                Tu Orden
              </h2>
              <p className="text-xs text-zinc-400 font-medium mt-1">
                {totalItemsCount} {totalItemsCount === 1 ? 'producto seleccionado' : 'productos seleccionados'}
              </p>
            </div>
          </div>
          <button onClick={closeCart} className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all border border-zinc-800 cursor-pointer hover:rotate-90">
            ✕
          </button>
        </div>

        {/* BANNER EXPRESS */}
        <div className="bg-gradient-to-r from-red-600/10 to-transparent border border-red-500/20 rounded-2xl p-3 my-4 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-sm shrink-0">
            🛵
          </div>
          <div>
            <p className="text-xs font-black text-red-400 uppercase tracking-wider">Delivery Express</p>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Llegamos volando a tu puerta ⚡</p>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-4xl border border-zinc-800 shadow-inner">
              🛒
            </div>
            <div>
              <p className="text-zinc-200 font-black text-lg">Tu carrito está vacío</p>
              <p className="text-zinc-500 text-xs mt-1 max-w-[200px] mx-auto">Parece que aún no has decidido qué llevar hoy.</p>
            </div>
            <button onClick={handleContinueShopping} className="px-6 py-3 rounded-2xl bg-white hover:bg-gray-100 text-zinc-900 font-black text-sm transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer shadow-lg mt-2">
              Explorar catálogo
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-0">
            {cart.map(item => (
              <div key={item.id} className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 flex flex-col gap-3 transition-colors hover:bg-zinc-900 hover:border-zinc-700 group">
                
                <div className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/5">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-zinc-100 truncate">{item.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-zinc-500 text-[11px] font-medium">S/ {item.price.toFixed(2)} c/u</span>
                      <span className="text-white font-black text-sm">S/ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-zinc-950/50 rounded-xl p-1 border border-zinc-800/50">
                  <div className="flex items-center gap-1">
                    <button onClick={() => decreaseQuantity(item.id)} className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black flex items-center justify-center cursor-pointer active:scale-95 transition-all text-xs">
                      -
                    </button>
                    <span className="text-white font-black w-6 text-center text-xs">{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)} className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black flex items-center justify-center cursor-pointer active:scale-95 transition-all text-xs shadow-md">
                      +
                    </button>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="text-zinc-500 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-red-500/10">
                    Quitar 🗑️
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* PIE DE PAGO */}
        {cart.length > 0 && (
          <div className="mt-4 border-t border-zinc-800/60 pt-4 space-y-3 shrink-0">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center shadow-lg">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Total a pagar</span>
              <div className="flex items-start text-red-500 font-black">
                <span className="text-sm mt-0.5 mr-0.5">S/</span>
                <span className="text-3xl tracking-tighter leading-none">{total.toFixed(2)}</span>
              </div>
            </div>

            {/* BOTÓN WHATSAPP YA ESTÁ INTEGRADO EN ESTE COMPONENTE */}
            <WhatsAppCheckout cartItems={cart} totalAmount={total} onClose={closeCart} />

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowCheckout(true)} className="py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-all cursor-pointer border border-zinc-800 active:scale-95">
                Formulario Web 📋
              </button>
              <button onClick={handleContinueShopping} className="py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-all cursor-pointer border border-zinc-800 text-center active:scale-95">
                Seguir viendo 👀
              </button>
            </div>

            {showCheckout && (
              <CheckoutModal cartItems={cart} onSuccess={() => { cart.forEach(item => removeFromCart(item.id)); }} onClose={() => { setShowCheckout(false); closeCart(); }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}