"use client";

import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import { useState } from "react";

export default function ProductCard({ product }: { product: any }) {
  const { cart, increaseQuantity, decreaseQuantity, addToCart } = useCart() as any;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 1. Sanitización de ID
  const rawId = product?.id ?? "";
  const productId = typeof rawId === "number" ? rawId : String(rawId);

  // 2. Obtención segura de la cantidad desde el carrito
  const cartItem = cart?.find((item: any) => String(item.id) === String(productId));
  const quantity = cartItem && typeof cartItem.quantity === "number" && !isNaN(cartItem.quantity)
    ? cartItem.quantity
    : 0;

  // 3. Sanitización de Precio y Stock
  const rawPrice = typeof product?.price === "number" ? product.price : parseFloat(product?.price || 0);
  const displayPrice = !isNaN(rawPrice) ? rawPrice.toFixed(2) : "0.00";
  const stockNumber = Number(product?.stock) || 0;

  // Animación del slider brillante y mensaje flotante
  const triggerFeedback = () => {
    setIsAnimating(true);
    setShowToast(true);

    setTimeout(() => setIsAnimating(false), 600);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Acción del botón principal "Selecciona cantidad"
  const handleMainButtonClick = () => {
    if (stockNumber <= 0) return;

    triggerFeedback();

    // Solo agrega 1 unidad si aún no está en el carrito
    if (quantity === 0 && addToCart) {
      addToCart({
        id: productId,
        name: product?.name || "Producto",
        price: !isNaN(rawPrice) ? rawPrice : 0,
        image: product?.image || "",
        stock: stockNumber,
        quantity: 1,
      });
    }
  };

  // Botón (+) de la cápsula 3D
  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stockNumber > 0 && quantity < stockNumber) {
      if (quantity === 0) {
        handleMainButtonClick();
      } else if (increaseQuantity) {
        increaseQuantity(productId);
      }
    }
  };

  // Botón (-) de la cápsula 3D
  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (decreaseQuantity && quantity > 0) {
      decreaseQuantity(productId);
    }
  };

  return (
    <div
      id={`product-${productId}`}
      className="scroll-mt-32 bg-white rounded-3xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 transition-all duration-300 hover:shadow-lg"
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

      {/* Cápsula de Controles [ - 0 + ] y Botón Animado */}
      <div className="space-y-4 flex flex-col items-center w-full">
        {/* Cápsula Selector 3D con relieve */}
        <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-full p-1.5 w-48">
          <button
            onClick={handleDecrease}
            disabled={quantity <= 0}
            className="w-10 h-10 rounded-full bg-white text-slate-600 font-black text-xl flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.12)] hover:bg-slate-50 active:scale-95 disabled:opacity-40 transition cursor-pointer"
          >
            -
          </button>

          <span className="text-slate-900 font-black text-lg px-2 select-none">
            {quantity}
          </span>

          <button
            onClick={handleIncrease}
            disabled={stockNumber > 0 && quantity >= stockNumber}
            className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-[0_3px_8px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 disabled:opacity-50 transition cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Botón Principal con Cambio de Estado Visual y Animación Slider */}
        <button
          onClick={handleMainButtonClick}
          disabled={stockNumber <= 0}
          className={`relative overflow-hidden w-full py-3.5 font-bold rounded-2xl transition-all duration-300 cursor-pointer text-sm border shadow-[0_2px_6px_rgba(0,0,0,0.04)] ${
            quantity > 0
              ? "bg-red-600 text-white border-red-600 shadow-[0_4px_14px_rgba(220,38,38,0.35)]"
              : "bg-slate-100 text-slate-600 border-slate-200/60 hover:bg-slate-200/80"
          }`}
        >
          {/* Animación del barrido / slider brillante */}
          <span
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out pointer-events-none ${
              isAnimating ? "translate-x-full" : "-translate-x-full"
            }`}
          />

          <span className="relative z-10 flex items-center justify-center gap-1.5">
            {stockNumber <= 0
              ? "Agotado"
              : showToast
              ? "¡Agregado al carrito! 🎉"
              : quantity > 0
              ? `En el carrito (${quantity})`
              : "Selecciona cantidad"}
          </span>
        </button>
      </div>
    </div>
  );
}