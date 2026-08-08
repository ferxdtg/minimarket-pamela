"use client";

import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import { useState } from "react";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart() as any;
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Estado local del contador de la tarjeta
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

  // Botón (+) de la cápsula local
  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stockNumber > 0 && localQty < stockNumber) {
      setLocalQty((prev) => prev + 1);
    }
  };

  // Botón (-) de la cápsula local
  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localQty > 0) {
      setLocalQty((prev) => prev - 1);
    }
  };

  // Disparador al hacer clic en "Selecciona cantidad"
  const handleAddToCart = () => {
    if (stockNumber <= 0) return;

    const qtyToAdd = localQty === 0 ? 1 : localQty;

    // 1. Iniciar animación de recorrido (Slider / Sweep)
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);

      // 2. Enviar datos al carrito
      if (addToCart) {
        addToCart({
          id: productId,
          name: product?.name || "Producto",
          price: !isNaN(rawPrice) ? rawPrice : 0,
          image: product?.image || "",
          stock: stockNumber,
          quantity: qtyToAdd,
        });
      }

      // 3. Mostrar la ventana emergente Pop-up
      setShowModal(true);

      // 4. Resetear el contador de la tarjeta a 0 (regresa al estado pasivo)
      setLocalQty(0);
    }, 400);
  };

  const isSelected = localQty > 0;

  return (
    <>
      <div
        id={`product-${productId}`}
        className="scroll-mt-32 bg-white rounded-3xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 transition-all duration-300 hover:shadow-lg relative"
      >
        <div>
          {/* Banner Superior: Imagen, Badge e Ícono de Corazón */}
          <div className="relative w-full h-52 bg-gray-50/70 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
            {(product?.isOnSale || product?.isFeatured) && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm z-10">
                🔥 {product?.isOnSale ? "Oferta" : "Más vendido"}
              </span>
            )}

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-gray-400 hover:text-red-500 transition z-10 cursor-pointer"
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>

            {product?.image && product.image !== "/placeholder.png" ? (
              <Image
                src={product.image}
                alt={product.name || "Producto"}
                fill
                className="object-contain p-4"
              />
            ) : (
              <span className="text-4xl">📦</span>
            )}
          </div>

          {/* Nombre del Producto */}
          <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
            {product?.name || "Producto sin nombre"}
          </h3>

          {/* Estrellas y Reseñas */}
          <div className="flex items-center gap-1 mb-3">
            <span className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</span>
            <span className="text-xs text-gray-400 font-medium">(120)</span>
          </div>

          {/* Precio y Badge de Stock */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl font-black text-red-600">
              S/{displayPrice}
            </span>
            <span className="text-xs text-emerald-700 bg-emerald-100/80 border border-emerald-200 font-bold px-3 py-1 rounded-full">
              Stock: {stockNumber}
            </span>
          </div>
        </div>

        {/* Cápsula de Controles y Botón Animado */}
        <div className="space-y-4 flex flex-col items-center w-full">
          {/* Cápsula Selector 3D */}
          <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-full p-1.5 w-48">
            <button
              onClick={handleDecrease}
              disabled={localQty <= 0}
              className="w-10 h-10 rounded-full bg-white text-slate-600 font-black text-xl flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.12)] hover:bg-slate-50 active:scale-95 disabled:opacity-40 transition cursor-pointer"
            >
              -
            </button>

            <span className="text-slate-900 font-black text-lg px-2 select-none">
              {localQty}
            </span>

            <button
              onClick={handleIncrease}
              disabled={stockNumber > 0 && localQty >= stockNumber}
              className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-[0_3px_8px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 disabled:opacity-50 transition cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Botón Principal (Se fuerza el cambio de color con inline-styles) */}
          <button
            onClick={handleAddToCart}
            disabled={stockNumber <= 0}
            style={{
              backgroundColor: isSelected ? "#dc2626" : "#f1f5f9",
              color: isSelected ? "#ffffff" : "#475569",
              borderColor: isSelected ? "#dc2626" : "#cbd5e1",
              boxShadow: isSelected
                ? "0 4px 14px rgba(220, 38, 38, 0.4)"
                : "0 2px 6px rgba(0, 0, 0, 0.04)",
            }}
            className="relative overflow-hidden w-full py-3.5 font-bold rounded-2xl transition-all duration-300 cursor-pointer text-sm border active:scale-[0.98]"
          >
            {/* Barrido / Animación de Slide de lado a lado */}
            <span
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-500 ease-in-out pointer-events-none ${
                isAnimating ? "translate-x-full" : "-translate-x-full"
              }`}
            />

            <span className="relative z-10">
              {stockNumber <= 0 ? "Agotado" : "Selecciona cantidad"}
            </span>
          </button>
        </div>
      </div>

      {/* Ventana Emergente Pop-up */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto font-bold shadow-inner">
              ✓
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900">
                ¡Producto Agregado!
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                El artículo ha sido añadido al carrito con éxito.
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition cursor-pointer text-sm shadow-md shadow-red-900/20"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}