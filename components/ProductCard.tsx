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
      setLocalQty(0);
      setTimeout(() => setShowModal(false), 2000);
    }, 400);
  };

  const isSelected = localQty > 0;

  return (
    <>
      <div id={`product-${productId}`} className="scroll-mt-32 bg-white rounded-[2rem] p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 transition-all duration-300 hover:border-red-100 hover:shadow-[0_15px_40px_rgba(220,38,38,0.08)] relative">
        <div>
          <div className="relative w-full h-52 bg-slate-50/50 rounded-2xl overflow-hidden mb-4 flex items-center justify-center border border-slate-100">
            {(product?.isOnSale || product?.isFeatured) && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] uppercase px-3 py-1 rounded-full font-black tracking-wider shadow-sm z-10">
                🔥 {product?.isOnSale ? "Oferta" : "Top"}
              </span>
            )}

            <button onClick={() => setIsFavorite(!isFavorite)} className="absolute top-3 right-3 w-9 h-9 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition z-10 cursor-pointer">
              {isFavorite ? "❤️" : "🤍"}
            </button>

            {product?.image && product.image !== "/placeholder.png" ? (
              <Image src={product.image} alt={product.name || "Producto"} fill className="object-contain p-4 drop-shadow-xl" />
            ) : (
              <span className="text-4xl opacity-20">📦</span>
            )}
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-1 truncate">{product?.name || "Producto sin nombre"}</h3>
          
          <div className="flex items-center gap-1 mb-3">
            <span className="text-amber-400 text-xs">⭐⭐⭐⭐⭐</span>
            <span className="text-[10px] text-slate-400 font-bold">(120)</span>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl font-black text-red-600">S/{displayPrice}</span>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${stockNumber > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              Stock: {stockNumber}
            </span>
          </div>
        </div>

        {/* Cápsula */}
        <div className="space-y-4 flex flex-col items-center w-full">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-full p-1.5 w-48 shadow-inner">
            <button onClick={handleDecrease} disabled={localQty <= 0} className="w-10 h-10 rounded-full bg-white text-slate-600 font-black text-xl flex items-center justify-center shadow-sm hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:shadow-none transition cursor-pointer">
              -
            </button>
            <span className="text-slate-900 font-black text-lg px-2 select-none">{localQty}</span>
            <button onClick={handleIncrease} disabled={stockNumber > 0 && localQty >= stockNumber} className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-[0_4px_10px_rgba(220,38,38,0.3)] hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:bg-slate-300 transition cursor-pointer disabled:shadow-none">
              +
            </button>
          </div>

          <button onClick={handleAddToCart} disabled={stockNumber <= 0 || !isSelected} className={`relative overflow-hidden w-full py-3.5 font-bold rounded-2xl transition-all duration-300 text-sm border ${isSelected ? "bg-red-600 text-white border-red-500 shadow-[0_4px_20px_rgba(220,38,38,0.3)] hover:bg-red-700 active:scale-[0.98] cursor-pointer" : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"}`}>
            <span className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 pointer-events-none ${isAnimating ? "translate-x-full" : "-translate-x-full"}`} />
            <span className="relative z-10">{stockNumber <= 0 ? "Agotado" : "Agregar al Carrito 🛒"}</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto font-bold border border-emerald-100 shadow-inner">
              ✓
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">¡Agregado!</h4>
              <p className="text-xs text-slate-500 mt-1">El artículo se sumó a tu carrito.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}