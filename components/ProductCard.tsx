"use client";

import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import { useState } from "react";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart() as any;
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Estado local del contador
  const [localQty, setLocalQty] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sanitización de ID
  const rawId = product?.id ?? "";
  const productId = typeof rawId === "number" ? rawId : String(rawId);

  // Sanitización de Precio y Stock
  const rawPrice = typeof product?.price === "number" ? product.price : parseFloat(product?.price || 0);
  const displayPrice = !isNaN(rawPrice) ? rawPrice.toFixed(2) : "0.00";
  const stockNumber = Number(product?.stock) || 0;

  // Botón (+) de la cápsula
  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stockNumber > 0 && localQty < stockNumber) {
      setLocalQty((prev) => prev + 1);
    }
  };

  // Botón (-) de la cápsula
  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localQty > 0) {
      setLocalQty((prev) => prev - 1);
    }
  };

  // Acción de agregar al carrito (Solo se ejecuta si localQty > 0)
  const handleAddToCart = () => {
    if (stockNumber <= 0 || localQty <= 0) return;

    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      if (addToCart) {
        addToCart({
          id: productId,
          name: product?.name || "Producto",
          price: !isNaN(rawPrice) ? rawPrice : 0,
          image: product?.image || "",
          stock: stockNumber,
          quantity: localQty,
        });
      }
      setShowModal(true);
      setLocalQty(0);
      
      // Auto-ocultar el modal para mejor UX
      setTimeout(() => setShowModal(false), 2500);
    }, 400);
  };

  const isSelected = localQty > 0;
  const isOut = stockNumber <= 0;

  return (
    <>
      <div
        id={`product-${productId}`}
        className="group scroll-mt-32 flex flex-col bg-white rounded-[2rem] p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(220,38,38,0.08)] border border-gray-100 hover:border-red-100 transition-all duration-500 relative h-full"
      >
        {/* ================= CONTENEDOR DE IMAGEN (CON ZOOM) ================= */}
        <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-[1.5rem] overflow-hidden mb-4 flex items-center justify-center p-6">
          
          {/* Etiquetas / Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {product?.isOnSale && (
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-[0_4px_10px_rgba(220,38,38,0.4)] animate-pulse">
                Oferta 🔥
              </span>
            )}
            {product?.isFeatured && (
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Top ⭐
              </span>
            )}
          </div>

          {/* Botón Favorito Flotante */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-red-50 transition-all z-10 cursor-pointer hover:scale-110 active:scale-95"
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>

          {/* Imagen con Drop Shadow y Zoom */}
          {product?.image && product.image !== "/placeholder.png" ? (
            <Image
              src={product.image}
              alt={product.name || "Producto"}
              fill
              className={`object-contain transition-transform duration-700 ease-out drop-shadow-xl ${!isOut && "group-hover:scale-110"}`}
            />
          ) : (
            <span className="text-5xl opacity-20">📦</span>
          )}

          {/* Overlay de Agotado */}
          {isOut && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-zinc-900 text-white text-xs font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-2xl">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* ================= DETALLES DEL PRODUCTO ================= */}
        <div className="flex flex-col flex-1 px-1">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1 line-clamp-1">
            {product?.category || "Abarrotes"}
          </p>
          
          <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
            {product?.name || "Producto sin nombre"}
          </h3>

          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-amber-400 text-xs tracking-widest">★★★★★</span>
            <span className="text-[10px] text-gray-400 font-bold">(+50)</span>
          </div>

          {/* Fila de Precio y Stock */}
          <div className="flex items-end justify-between mt-auto mb-5">
            <div>
              {product?.isOnSale && (
                <p className="text-[11px] text-gray-400 line-through font-bold mb-0.5">
                  S/ {(rawPrice * 1.2).toFixed(2)}
                </p>
              )}
              <div className="flex items-start text-red-600 font-black">
                <span className="text-sm mt-0.5 mr-0.5">S/</span>
                <span className="text-2xl tracking-tighter leading-none">{displayPrice}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${isOut ? "bg-red-50 text-red-500 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                {isOut ? "Sin stock" : `${stockNumber} disp.`}
              </span>
            </div>
          </div>

          {/* ================= CONTROLES Y BOTÓN DE AGREGAR ================= */}
          <div className="space-y-3 flex flex-col items-center w-full mt-auto">
            
            {/* Cápsula Elegante */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200/80 shadow-inner rounded-2xl p-1.5 w-full max-w-[200px]">
              <button
                onClick={handleDecrease}
                disabled={localQty <= 0}
                className="w-10 h-10 rounded-xl bg-white text-gray-600 font-black text-xl flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:shadow-none transition-all cursor-pointer"
              >
                -
              </button>

              <span className="text-gray-900 font-black text-lg px-2 select-none w-10 text-center">
                {localQty}
              </span>

              <button
                onClick={handleIncrease}
                disabled={!isOut && localQty >= stockNumber}
                className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-[0_4px_10px_rgba(220,38,38,0.3)] hover:bg-red-700 active:scale-95 disabled:bg-gray-300 disabled:shadow-none transition-all cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Botón de Agregar (Con Swipe Effect) */}
            <button
              onClick={handleAddToCart}
              disabled={isOut || !isSelected}
              className={`relative overflow-hidden w-full py-3.5 font-black text-sm rounded-2xl transition-all duration-300 ${
                isSelected
                  ? "bg-red-600 text-white shadow-[0_8px_20px_rgba(220,38,38,0.35)] hover:bg-red-700 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer border border-red-600"
                  : "bg-gray-50 text-gray-400 border border-gray-200 shadow-sm cursor-not-allowed"
              }`}
            >
              {/* Animación de barrido blanca */}
              <span
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 ease-in-out pointer-events-none ${
                  isAnimating ? "translate-x-full" : "-translate-x-full"
                }`}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isOut ? "Agotado temporalmente" : isSelected ? "Agregar al Carrito 🛒" : "Selecciona cantidad"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL NOTIFICACIÓN PREMIUM ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
          <div className="bg-white rounded-[2rem] p-8 max-w-xs w-full text-center space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-full h-full bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner border-[4px] border-white">
                ✓
              </div>
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 tracking-tight">
                ¡Excelente elección!
              </h4>
              <p className="text-sm text-gray-500 mt-2 font-medium leading-snug">
                Has añadido <strong className="text-gray-800">{localQty}x {product?.name}</strong> a tu carrito de compras.
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition cursor-pointer text-sm shadow-xl hover:-translate-y-0.5 mt-2"
            >
              Seguir comprando
            </button>
          </div>
        </div>
      )}
    </>
  );
}