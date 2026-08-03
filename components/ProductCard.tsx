
"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";

type ProductCardProps = {
  id: number;
  name: string;
  price: string;
  image: string;
};

export default function ProductCard({
  id,
  name,
  price,
  image,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);

  const { addToCart } = useCart();

  const { showNotification } = useCartUI();

  function addProduct() {
    if (quantity === 0) return;

    addToCart({
        id,
        name,
        image,
        price: Number(price),
        quantity,
    });

    showNotification(`${name} agregado al carrito 🛒`);

    setQuantity(0);
  }

  return (
    <div
      className="
        bg-white
        rounded-3xl
        shadow-md
        hover:shadow-2xl
        transition-all
        duration-300
        overflow-hidden
        border
        border-gray-200
        group
      "
    >
      {/* Imagen */}
      <div
        className="
          relative
          h-56
          bg-white
          flex
          items-center
          justify-center
          overflow-hidden
        "
      >
        <Image
          src={image}
          alt={name}
          fill
          className="
            object-contain
            p-5
            group-hover:scale-105
            transition-transform
            duration-300
          "
        />

        <div
          className="
            absolute
            top-3
            left-3
            bg-red-600
            text-white
            text-xs
            font-black
            px-3
            py-1
            rounded-full
            shadow
          "
        >
          🔥 Oferta
        </div>
      </div>

      {/* Información */}
      <div className="p-5">
        <h3 className="text-lg font-black text-gray-900">
          {name}
        </h3>

        <div className="mt-2 text-yellow-500 text-sm tracking-wide">
          ⭐⭐⭐⭐⭐
        </div>

        <p className="mt-3 text-3xl font-black text-red-600">
          S/ {price}
        </p>

        {/* Cantidad */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={() =>
              setQuantity((prev) => Math.max(0, prev - 1))
            }
            className="
              w-10
              h-10
              rounded-full
              bg-red-600
              text-white
              font-black
              text-xl
              flex
              items-center
              justify-center
              hover:bg-red-700
              transition
            "
          >
            −
          </button>

          <span
            className="
              w-8
              text-center
              text-xl
              font-black
              text-gray-900
            "
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((prev) => prev + 1)
            }
            className="
              w-10
              h-10
              rounded-full
              bg-red-600
              text-white
              font-black
              text-xl
              flex
              items-center
              justify-center
              hover:bg-red-700
              transition
            "
          >
            +
          </button>
        </div>

        {/* Botón agregar */}
        <button
          type="button"
          onClick={addProduct}
          disabled={quantity === 0}
          className={`
            mt-6
            w-full
            py-3
            rounded-xl
            font-black
            transition-all
            ${
              quantity === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02]"
            }
          `}
        >
          {quantity === 0
            ? "Selecciona cantidad"
            : "Agregar al carrito 🛒"}
        </button>
      </div>
    </div>
  );
}