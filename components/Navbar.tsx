"use client";

import SearchBar from "@/components/SearchBar";
import { useCartUI } from "@/lib/CartUIContext";
import { useCart } from "@/lib/CartContext";

export default function Navbar() {
  const { openCart } = useCartUI() as any;
  const { cart } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-0 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LOGO */}
        <div className="flex items-center gap-2.5 cursor-pointer min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl sm:text-2xl shadow-md text-white font-black shrink-0">
            🛒
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-gray-900 tracking-tight truncate">
              Minimarket Pamela
            </h1>
            <p className="hidden sm:block text-xs text-gray-500 font-medium">
              Compra rápido, recibe mejor
            </p>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA INTEGRADA (PC) */}
        <div className="flex-1 max-w-xl hidden md:block">
          <SearchBar />
        </div>

        {/* CONTENEDOR DERECHO: CARRITO + ACCESO ADMIN */}
        <div className="flex items-center gap-2 shrink-0">
          {/* BOTÓN DE CARRITO */}
          <button
            onClick={() => {
              if (typeof openCart === 'function') {
                openCart();
              } else {
                window.dispatchEvent(new CustomEvent('open_cart'));
              }
            }}
            className="relative bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-base flex items-center gap-1.5 sm:gap-2 transition shadow-lg cursor-pointer"
          >
            <span>🛒 Carrito</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-black shadow">
                {totalItems}
              </span>
            )}
          </button>

          {/* ACCESO ADMIN SUTIL */}
          <a
            href="/admin/login"
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 sm:p-2 text-sm sm:text-base font-semibold cursor-pointer"
            title="Panel Admin"
          >
            ⚙️
          </a>
        </div>

      </div>

      {/* Buscador adaptable para móviles */}
      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}