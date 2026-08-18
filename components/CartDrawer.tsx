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
    <div className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end transition-opacity duration-500 ${cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      
      <div className={`w-full max-w-md h-[100dvh] bg-white text-slate-900 shadow-[-10px_0_40px_rgba(0,0,0,0.1)] p-5 sm:p-6 flex flex-col rounded-l-[2rem] border-l border-slate-100 transform transition-transform duration-500 ease-[cubic-bezier(0.3,0.9,0.4,1)] ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
              Tu Carrito
            </h2>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button onClick={closeCart} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* LISTA DE PRODUCTOS */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <div>
              <p className="text-slate-800 font-bold text-lg">Tu carrito está vacío</p>
              <p className="text-slate-500 text-sm mt-1">Explora nuestro catálogo y agrega productos.</p>
            </div>
            <button onClick={handleContinueShopping} className="px-6 py-3 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-sm transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-md mt-2">
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pt-4 pr-1 custom-scrollbar min-h-0">
            {cart.map(item => (
              <div key={item.id} className="bg-white border-b border-slate-100 pb-4 mb-2 flex flex-col gap-3">
                <div className="flex gap-3 items-start">
                  <div className="relative w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{item.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-slate-500 text-xs font-medium">S/ {item.price.toFixed(2)} c/u</span>
                      <span className="text-slate-900 font-black text-sm">S/ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
                    <button onClick={() => decreaseQuantity(item.id)} className="w-7 h-7 rounded-md bg-white hover:bg-slate-50 text-slate-600 font-bold flex items-center justify-center cursor-pointer active:scale-95 transition-all">
                      -
                    </button>
                    <span className="text-slate-900 font-bold w-6 text-center text-xs">{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)} className="w-7 h-7 rounded-md bg-white hover:bg-slate-50 text-slate-600 font-bold flex items-center justify-center cursor-pointer active:scale-95 transition-all">
                      +
                    </button>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 font-semibold text-xs transition-colors cursor-pointer underline">
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PIE DE PAGO */}
        {cart.length > 0 && (
          <div className="mt-2 pt-4 space-y-4 shrink-0 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">Total</span>
              <div className="flex items-start text-slate-900 font-black">
                <span className="text-sm mt-0.5 mr-0.5">S/</span>
                <span className="text-3xl tracking-tighter leading-none">{total.toFixed(2)}</span>
              </div>
            </div>

            <WhatsAppCheckout cartItems={cart} totalAmount={total} onClose={closeCart} />

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowCheckout(true)} className="py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer border border-slate-200 active:scale-95 text-center">
                Pago Web
              </button>
              <button onClick={handleContinueShopping} className="py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer border border-slate-200 text-center active:scale-95">
                Seguir comprando
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