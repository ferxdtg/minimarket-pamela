"use client";

import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import { useState } from "react";

export default function ProductCard({ product }: { product: any }) {
  const { cart, increaseQuantity, decreaseQuantity, addToCart } = useCart() as any;
  const [isFavorite, setIsFavorite] = useState(false);

  // Garantizamos comparación con IDs en formato string/número
  const cartItem = cart?.find((item: any) => String(item.id) === String(product.id));
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div
      id={`product-${product.id}`}
      className="scroll-mt-32 bg-white rounded-3xl p-4 flex flex-col justify-between shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md"
    >
      <div>
        {/* Banner Superior con Imagen, Badge e Ícono de Corazón */}
        <div className="relative w-full h-52 bg-gray-50/50 rounded-2xl overflow-hidden mb-3 flex items-center justify-center">
          {/* Badge 'Más vendido' u 'Oferta' */}
          {(product.isOnSale || product.isFeatured) && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm z-10">
              🔥 {product.isOnSale ? "Oferta" : "Más vendido"}
            </span>
          )}

          {/* Botón de Favorito */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 transition z-10 cursor-pointer"
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>

          {/* Imagen del Producto */}
          {product.image && product.image !== "/placeholder.png" ? (
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
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{product.name}</h3>

        {/* Estrellas y Reseñas */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</span>
          <span className="text-xs text-gray-400 font-medium">(120)</span>
        </div>

        {/* Precio y Badge de Stock */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-black text-red-600">
            S/{Number(product.price || 0).toFixed(2)}
          </span>
          <span className="text-xs text-emerald-700 bg-emerald-100 font-bold px-2.5 py-0.5 rounded-full">
            Stock: {product.stock}
          </span>
        </div>
      </div>

      {/* Controles de Cantidad y Botón de Acción */}
      <div className="space-y-3">
        {/* Selector de Cantidad cuando ya se seleccionó */}
        {quantity > 0 ? (
          <div className="flex items-center justify-between bg-gray-100 p-1.5 rounded-full">
            <button
              onClick={() => decreaseQuantity && decreaseQuantity(product.id)}
              className="w-10 h-10 rounded-full bg-white text-gray-700 font-bold text-lg flex items-center justify-center hover:bg-gray-200 transition shadow-sm cursor-pointer"
            >
              -
            </button>
            <span className="text-gray-900 font-black text-base px-3">
              {quantity}
            </span>
            <button
              onClick={() => increaseQuantity && increaseQuantity(product.id)}
              disabled={quantity >= product.stock}
              className="w-10 h-10 rounded-full bg-red-600 text-white font-bold text-lg flex items-center justify-center hover:bg-red-700 disabled:opacity-50 transition shadow-sm cursor-pointer"
            >
              +
            </button>
          </div>
        ) : (
          /* Botón por defecto para seleccionar cantidad */
          <button
            onClick={() => addToCart && addToCart(product)}
            disabled={product.stock <= 0}
            className="w-full py-3 bg-gray-200 hover:bg-red-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 text-gray-600 font-bold rounded-2xl transition cursor-pointer text-sm"
          >
            {product.stock > 0 ? "Selecciona cantidad" : "Agotado"}
          </button>
        )}
      </div>
    </div>
  );
}