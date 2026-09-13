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
      <div id={`product-${productId}`} className="group scroll-mt-32 bg-white rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative h-full">
        
        <div>
          <div className="relative w-full aspect-square bg-slate-50/80 rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-slate-50">
            
            {(product?.isOnSale || product?.isFeatured) && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] uppercase px-2.5 py-1 rounded-full font-black tracking-wider shadow-md z-10 animate-pulse">
                🔥 {product?.isOnSale ? "Oferta" : "Top"}
              </span>
            )}

            <button onClick={() => setIsFavorite(!isFavorite)} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer">
              {isFavorite ? "❤️" : "🤍"}
            </button>

            {product?.image && product.image !== "/placeholder.png" ? (
              <Image src={product.image} alt={product.name || "Producto"} fill className={`object-contain p-3 drop-shadow-md transition-transform duration-500 ease-out ${!isOut && "group-hover:scale-110"}`} />
            ) : (
              <span className="text-4xl opacity-20">📦</span>
            )}

            {isOut && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Agotado
                </span>
              </div>
            )}
          </div>

          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1 line-clamp-1">
            {product?.category || "Abarrotes"}
          </p>
          <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
            {product?.name || "Producto sin nombre"}
          </h3>
          
          <div className="flex items-end justify-between mt-auto mb-4">
            <div>
              {product?.isOnSale && (
                <p className="text-[10px] text-slate-400 line-through font-bold mb-0.5">
                  S/ {(rawPrice * 1.2).toFixed(2)}
                </p>
              )}
              <div className="flex items-start text-red-600 font-black">
                <span className="text-xs mt-0.5 mr-0.5">S/</span>
                <span className="text-xl tracking-tighter leading-none">{displayPrice}</span>
              </div>
            </div>
            
            <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${isOut ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {isOut ? "Sin stock" : `${stockNumber} disp.`}
            </span>
          </div>
        </div>

        <div className="space-y-2 flex flex-col items-center w-full mt-auto">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl p-1 w-full shadow-inner">
            <button onClick={handleDecrease} disabled={localQty <= 0} className="w-8 h-8 rounded-lg bg-white text-slate-600 font-black text-lg flex items-center justify-center shadow-sm hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:shadow-none transition-all cursor-pointer">
              -
            </button>
            <span className="text-slate-900 font-black text-base px-2 select-none w-8 text-center">{localQty}</span>
            <button onClick={handleIncrease} disabled={!isOut && localQty >= stockNumber} className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-lg flex items-center justify-center shadow-md hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none transition-all cursor-pointer">
              +
            </button>
          </div>

          <button onClick={handleAddToCart} disabled={isOut || !isSelected} className={`relative overflow-hidden w-full py-2.5 font-black text-xs rounded-xl transition-all duration-300 border ${isSelected ? "bg-red-600 text-white border-red-600 shadow-md hover:bg-red-700 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer" : "bg-slate-50 text-slate-400 border-slate-200 shadow-sm cursor-not-allowed"}`}>
            <span className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 ease-in-out pointer-events-none ${isAnimating ? "translate-x-full" : "-translate-x-full"}`} />
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {isOut ? "Agotado" : isSelected ? "Agregar 🛒" : "Elegir cantidad"}
            </span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center space-y-3 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-full h-full bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner border-[3px] border-white">
                ✓
              </div>
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">
                ¡Añadido!
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-snug">
                Has agregado <strong className="text-slate-800">{localQty}x {product?.name}</strong> al carrito.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}