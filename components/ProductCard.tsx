"use client";

import { useCart } from "@/lib/CartContext";
import Image from "next/image";

export default function ProductCard({ product }: { product: any }) {
  const { cart, increaseQuantity, decreaseQuantity, addToCart } = useCart() as any;

  // Garantizamos comparación con IDs en formato string/número
  const cartItem = cart?.find((item: any) => String(item.id) === String(product.id));
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div
      id={`product-${product.id}`}
      className="scroll-mt-32 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-zinc-700"
    >
      <div>
        {/* Banner de Imagen */}
        <div className="relative w-full h-48 bg-zinc-800/50 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
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

          {product.isFeatured && (
            <span className="absolute top-3 left-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] px-2.5 py-1 rounded-full font-bold">
              ⭐ Destacado
            </span>
          )}
          {product.isOnSale && (
            <span className="absolute top-3 right-3 bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] px-2.5 py-1 rounded-full font-bold">
              🔥 Oferta
            </span>
          )}
        </div>

        {/* Nombre, Precio y Stock */}
        <h3 className="text-lg font-bold text-white mb-2 truncate">{product.name}</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-black text-red-500">
            S/ {Number(product.price || 0).toFixed(2)}
          </span>
          <span className="text-xs text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/50">
            Stock: {product.stock}
          </span>
        </div>
      </div>

      {/* Controles de Selección de Cantidad */}
      <div>
        {quantity === 0 ? (
          <button
            onClick={() => addToCart && addToCart(product)}
            disabled={product.stock <= 0}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-2xl transition cursor-pointer text-sm shadow-md shadow-red-950/40"
          >
            {product.stock > 0 ? "Seleccionar cantidad" : "Agotado"}
          </button>
        ) : (
          <div className="flex items-center justify-between bg-zinc-800 p-1.5 rounded-2xl border border-zinc-700">
            <button
              onClick={() => decreaseQuantity && decreaseQuantity(product.id)}
              className="w-9 h-9 rounded-xl bg-red-600 text-white font-bold text-lg flex items-center justify-center hover:bg-red-700 transition cursor-pointer shadow-sm"
            >
              -
            </button>
            <span className="text-white font-bold text-base px-3">
              {quantity}
            </span>
            <button
              onClick={() => increaseQuantity && increaseQuantity(product.id)}
              disabled={quantity >= product.stock}
              className="w-9 h-9 rounded-xl bg-red-600 text-white font-bold text-lg flex items-center justify-center hover:bg-red-700 disabled:opacity-50 transition cursor-pointer shadow-sm"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}