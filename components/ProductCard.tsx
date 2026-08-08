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
      className="scroll-mt-32 bg-white rounded-3xl p-5 flex flex-col justify-between shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md"
    >
      <div>
        {/* Banner Superior: Imagen, Badge e Ícono de Corazón */}
        <div className="relative w-full h-52 bg-gray-50/50 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
          {/* Badge 'Más vendido' / 'Oferta' */}
          {(product.isOnSale || product.isFeatured) && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm z-10">
              🔥 {product.isOnSale ? "Oferta" : "Más vendido"}
            </span>
          )}

          {/* Botón de Favorito */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 transition z-10 cursor-pointer"
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
        <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">{product.name}</h3>

        {/* Estrellas y Reseñas */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</span>
          <span className="text-xs text-gray-400 font-medium">(120)</span>
        </div>

        {/* Precio y Badge de Stock */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl font-black text-red-600">
            S/{Number(product.price || 0).toFixed(2)}
          </span>
          <span className="text-xs text-emerald-700 bg-emerald-100 font-bold px-3 py-1 rounded-full">
            Stock: {product.stock}
          </span>
        </div>
      </div>

      {/* Selector de Cantidad + Botón (Estilo de la imagen) */}
      <div className="space-y-4 flex flex-col items-center">
        {/* Control de incremento (+) y decremento (-) circular sobre barra gris */}
        <div className="flex items-center justify-between bg-slate-100/80 p-1.5 rounded-full w-48">
          <button
            onClick={() => decreaseQuantity && decreaseQuantity(product.id)}
            disabled={quantity <= 0}
            className="w-10 h-10 rounded-full bg-white text-slate-500 font-black text-lg flex items-center justify-center shadow-sm hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer"
          >
            -
          </button>

          <span className="text-slate-900 font-black text-lg px-2">
            {quantity}
          </span>

          <button
            onClick={() => {
              if (quantity === 0) {
                addToCart && addToCart(product);
              } else {
                increaseQuantity && increaseQuantity(product.id);
              }
            }}
            disabled={quantity >= product.stock}
            className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-lg flex items-center justify-center shadow-md hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Botón Inferior "Selecciona cantidad" */}
        <button
          onClick={() => {
            if (quantity === 0) {
              addToCart && addToCart(product);
            }
          }}
          disabled={product.stock <= 0}
          className={`w-full py-3.5 font-bold rounded-2xl transition cursor-pointer text-sm ${
            quantity > 0
              ? "bg-red-600 text-white shadow-md shadow-red-900/20"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {product.stock <= 0
            ? "Agotado"
            : quantity > 0
            ? `Agregado (${quantity})`
            : "Selecciona cantidad"}
        </button>
      </div>
    </div>
  );
}