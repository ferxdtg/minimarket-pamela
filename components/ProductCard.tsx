"use client";

import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import { useState } from "react";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart() as any;
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [localQty, setLocalQty] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const rawId = product?.id ?? "";
  const productId = typeof rawId === "number" ? rawId : String(rawId);
  const rawPrice = typeof product?.price === "number" ? product.price : parseFloat(product?.price || 0);
  const displayPrice = !isNaN(rawPrice) ? rawPrice.toFixed(2) : "0.00";
  const stockNumber = Number(product?.stock) || 0;

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stockNumber > 0 && localQty < stockNumber) setLocalQty((prev) => prev + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localQty > 0) setLocalQty((prev) => prev - 1);
  };

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
      
      // Auto-ocultar el modal para mejor UX sin quitarle la magia
      setTimeout(() => {
        setShowModal(false);
        setLocalQty(0);
      }, 2500);
    }, 400);
  };

  const isSelected = localQty > 0;
  const isOut = stockNumber <= 0;

  return (
    <>
      {/* 🚀 EL CONTENEDOR VUELVE A TENER "group" Y EFECTO FLOTANTE (-translate-y-1) */}
      <div id={`product-${productId}`} className="group scroll-mt-32 bg-white rounded-[2rem] p-3 sm:p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 transition-all duration-500 hover:border-red-100 hover:shadow-[0_20px_40px_rgba(220,38,38,0.08)] hover:-translate-y-1 relative h-full">
        
        <div>
          <div className="relative w-full aspect-square bg-slate-50/80 rounded-2xl overflow-hidden mb-4 flex items-center justify-center border border-slate-100">
            
            {/* 🚀 VUELVE EL EFECTO LATIDO (animate-pulse) */}
            {(product?.isOnSale || product?.isFeatured) && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] uppercase px-3 py-1 rounded-full font-black tracking-wider shadow-[0_4px_10px_rgba(220,38,38,0.4)] z-10 animate-pulse">
                🔥 {product?.isOnSale ? "Oferta" : "Top"}
              </span>
            )}

            {/* 🚀 BOTÓN FAVORITO CON EFECTO ESCALA */}
            <button onClick={() => setIsFavorite(!isFavorite)} className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer">
              {isFavorite ? "❤️" : "🤍"}
            </button>

            {/* 🚀 VUELVE EL ZOOM SUAVE DE LA FOTO (group-hover:scale-110) */}
            {product?.image && product.image !== "/placeholder.png" ? (
              <Image src={product.image} alt={product.name || "Producto"} fill className={`object-contain p-4 drop-shadow-xl transition-transform duration-700 ease-out ${!isOut && "group-hover:scale-110"}`} />
            ) : (
              <span className="text-4xl opacity-20">📦</span>
            )}

            {isOut && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                <span className="bg-slate-900 text-white text-xs font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-2xl">
                  Agotado
                </span>
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1 line-clamp-1">
            {product?.category || "Abarrotes"}
          </p>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
            {product?.name || "Producto sin nombre"}
          </h3>
          
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-amber-400 text-xs tracking-widest">★★★★★</span>
            <span className="text-[10px] text-slate-400 font-bold">(+50)</span>
          </div>

          <div className="flex items-end justify-between mt-auto mb-5">
            <div>
              {product?.isOnSale && (
                <p className="text-[11px] text-slate-400 line-through font-bold mb-0.5">
                  S/ {(rawPrice * 1.2).toFixed(2)}
                </p>
              )}
              <div className="flex items-start text-red-600 font-black">
                <span className="text-sm mt-0.5 mr-0.5">S/</span>
                <span className="text-2xl tracking-tighter leading-none">{displayPrice}</span>
              </div>
            </div>
            
            <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-full border ${isOut ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {isOut ? "Sin stock" : `${stockNumber} disp.`}
            </span>
          </div>
        </div>

        {/* 🚀 LA CÁPSULA (Limpia pero con los mismos efectos de hover) */}
        <div className="space-y-3 flex flex-col items-center w-full mt-auto">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl p-1.5 w-full max-w-[200px] shadow-inner">
            <button onClick={handleDecrease} disabled={localQty <= 0} className="w-10 h-10 rounded-xl bg-white text-slate-600 font-black text-xl flex items-center justify-center shadow-sm hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:shadow-none transition-all cursor-pointer">
              -
            </button>
            <span className="text-slate-900 font-black text-lg px-2 select-none w-10 text-center">{localQty}</span>
            <button onClick={handleIncrease} disabled={!isOut && localQty >= stockNumber} className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-[0_4px_10px_rgba(220,38,38,0.3)] hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none transition-all cursor-pointer">
              +
            </button>
          </div>

          <button onClick={handleAddToCart} disabled={isOut || !isSelected} className={`relative overflow-hidden w-full py-3.5 font-black text-sm rounded-2xl transition-all duration-300 border ${isSelected ? "bg-red-600 text-white border-red-600 shadow-[0_6px_20px_rgba(220,38,38,0.35)] hover:bg-red-700 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer" : "bg-slate-50 text-slate-400 border-slate-200 shadow-sm cursor-not-allowed"}`}>
            <span className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 ease-in-out pointer-events-none ${isAnimating ? "translate-x-full" : "-translate-x-full"}`} />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isOut ? "Agotado temporalmente" : isSelected ? "Agregar al Carrito 🛒" : "Selecciona cantidad"}
            </span>
          </button>
        </div>
      </div>

      {/* 🚀 VUELVE EL MODAL PREMIUM CON ANIMACIÓN RADAR Y DETALLE DE COMPRA */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
          <div className="bg-white rounded-[2rem] p-8 max-w-xs w-full text-center space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-full h-full bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner border-[4px] border-white">
                ✓
              </div>
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">
                ¡Excelente elección!
              </h4>
              <p className="text-sm text-slate-500 mt-2 font-medium leading-snug">
                Has añadido <strong className="text-slate-800">{localQty}x {product?.name}</strong> a tu carrito de compras.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}