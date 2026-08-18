"use client";

import SearchBar from "@/components/SearchBar";
import { useCartUI } from "@/lib/CartUIContext";
import { useCart } from "@/lib/CartContext";

export default function Navbar() {
  const { openCart } = useCartUI() as any;
  const { cart } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-0 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LOGO */}
        <div className="flex items-center gap-3 cursor-pointer min-w-0 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xl sm:text-2xl shadow-[0_4px_10px_rgba(220,38,38,0.3)] text-white font-black shrink-0 group-hover:scale-105 transition-transform duration-300">
            🛒
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-gray-900 tracking-tight truncate group-hover:text-red-600 transition-colors">
              Pamela Market
            </h1>
            <p className="hidden sm:block text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
              Delivery Express
            </p>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA INTEGRADA (PC) */}
        <div className="flex-1 max-w-xl hidden md:block px-4">
          <SearchBar />
        </div>

        {/* CONTENEDOR DERECHO: CARRITO + ACCESO ADMIN */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* ACCESO ADMIN SUTIL */}
          <a
            href="/admin/login"
            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 transition-all cursor-pointer shadow-sm border border-gray-200"
            title="Panel Admin"
          >
            ⚙️
          </a>

          {/* BOTÓN DE CARRITO PREMIUM */}
          <button
            onClick={() => {
              if (typeof openCart === 'function') {
                openCart();
              } else {
                window.dispatchEvent(new CustomEvent('open_cart'));
              }
            }}
            className="relative bg-zinc-900 hover:bg-black text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-zinc-800"
          >
            <span className="hidden sm:inline">Mi Carrito</span>
            <span className="text-lg leading-none">🛍️</span>
            
            {/* NOTIFICACIÓN ROJA FLOTANTE */}
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-black shadow-[0_0_10px_rgba(220,38,38,0.5)] border-2 border-white animate-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Buscador adaptable para móviles */}
      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}