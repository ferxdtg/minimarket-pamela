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
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        
        {/* LOGO */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-2xl shadow-md text-white font-black">
            🛒
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Minimarket Pamela
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Compra rápido, recibe mejor
            </p>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA INTEGRADA */}
        <div className="flex-1 max-w-xl hidden md:block">
          <SearchBar />
        </div>

        {/* BOTÓN DE CARRITO */}
        <button
          onClick={() => {
            if (typeof openCart === 'function') {
              openCart();
            } else {
              window.dispatchEvent(new CustomEvent('open_cart'));
            }
          }}
          className="relative bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-black flex items-center gap-2 transition shadow-lg cursor-pointer"
        >
          <span>🛒 Carrito</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs w-6 h-6 rounded-full flex items-center justify-center font-black shadow">
              {totalItems}
            </span>
          )}
        </button>

      </div>

      {/* Buscador adaptable para móviles */}
      <div className="px-6 pb-4 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}