"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";
import CheckoutModal from "./CheckoutModal";
import WhatsAppCheckout from "./WhatsAppCheckout";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function CartDrawer() {
  const { cart, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, total } = useCart();
  const { cartOpen, closeCart } = useCartUI();
  const [showCheckout, setShowCheckout] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const cartIds = cart.map(i => String(i.id));
        const filtered = list.filter((p: any) => !cartIds.includes(String(p.id)) && Number(p.stock) > 0);
        setSuggestedProducts(filtered.slice(0, 2));
      } catch (e) {
        console.error(e);
      }
    }
    if (cartOpen) {
      fetchSuggestions();
    }
  }, [cartOpen, cart]);

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
    <div className={`fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity duration-500 ${cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      
      <div className={`w-full max-w-md h-[100dvh] bg-white text-slate-900 shadow-[-10px_0_40px_rgba(0,0,0,0.2)] p-5 sm:p-6 flex flex-col rounded-l-[2rem] border-l border-slate-200 transform transition-transform duration-500 ease-[cubic-bezier(0.3,0.9,0.4,1)] ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* ENCABEZADO VIBRANTE */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Tu Carrito</h2>
              <p className="text-xs text-red-600 font-bold mt-1 uppercase tracking-widest">{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} listos</p>
            </div>
          </div>
          <button onClick={closeCart} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* LISTA DE PRODUCTOS */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-800 font-black text-xl">Tu carrito está vacío</p>
              <p className="text-slate-500 text-sm mt-1">Aún no has agregado productos a tu orden.</p>
            </div>
            <button onClick={handleContinueShopping} className="px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-sm transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer shadow-[0_4px_15px_rgba(220,38,38,0.4)] mt-4">
              Ver el Catálogo
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pt-4 pr-1 custom-scrollbar min-h-0">
            {cart.map(item => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col gap-3 shadow-sm hover:border-red-100 transition-colors">
                <div className="flex gap-3 items-start">
                  <div className="relative w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{item.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-slate-500 text-xs font-medium">S/ {item.price.toFixed(2)} c/u</span>
                      <span className="text-red-600 font-black text-base">S/ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-1 border border-slate-100">
                  <div className="flex items-center gap-1">
                    <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-600 font-black flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm">
                      -
                    </button>
                    <span className="text-slate-900 font-black w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)} className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 text-red-600 font-black flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm">
                      +
                    </button>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer px-3 py-1">
                    Quitar
                  </button>
                </div>
              </div>
            ))}

            {/* SUGERENCIAS / VENTA CRUZADA CORREGIDA */}
            {suggestedProducts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">¿Te falta algo para completar tu pedido? 🔥</p>
                <div className="space-y-2">
                  {suggestedProducts.map(sug => (
                    <div key={sug.id} className="flex items-center justify-between bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-10 h-10 bg-white rounded-lg overflow-hidden shrink-0 border border-amber-200">
                          <Image src={sug.image} alt={sug.name} fill className="object-contain p-1" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{sug.name}</p>
                          <p className="text-[11px] text-red-600 font-black">S/ {Number(sug.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => addToCart({ id: sug.id, name: sug.name, price: Number(sug.price), image: sug.image, quantity: 1 })}
                        className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3 py-2 rounded-lg transition shadow-sm active:scale-95 cursor-pointer shrink-0"
                      >
                        + Agregar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PIE DE PAGO VIBRANTE */}
        {cart.length > 0 && (
          <div className="mt-2 pt-4 shrink-0 bg-white border-t border-slate-100 space-y-4">
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-inner">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total a Pagar</span>
              <div className="flex items-start text-red-600 font-black">
                <span className="text-lg mt-0.5 mr-1">S/</span>
                <span className="text-4xl tracking-tighter leading-none">{total.toFixed(2)}</span>
              </div>
            </div>

            <WhatsAppCheckout cartItems={cart} totalAmount={total} onClose={closeCart} />

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowCheckout(true)} className="py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs transition-all cursor-pointer shadow-md active:scale-95 text-center">
                Pagar en Web
              </button>
              <button onClick={handleContinueShopping} className="py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-all cursor-pointer border border-red-100 text-center active:scale-95">
                + Agregar más
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