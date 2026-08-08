"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useCart } from "@/lib/CartContext";
import Image from "next/image";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const { cart, increaseQuantity, decreaseQuantity, addToCart } = useCart() as any;

  // Cargar productos en tiempo real desde Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    });
    return () => unsubscribe();
  }, []);

  // Cerrar lista al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setFilteredProducts([]);
      setIsOpen(false);
    } else {
      const results = products.filter((p) =>
        p.name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(results);
      setIsOpen(true);
    }
  };

  const handleSelectProduct = (product: any) => {
    setIsOpen(false);
    setQuery("");
    setSelectedProduct(product); // Abre el modal con la información del producto
  };

  // Verificar cantidad en carrito del producto seleccionado en modal
  const cartItem = cart?.find((item: any) => item.id === selectedProduct?.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <>
      <div ref={searchRef} className="relative w-full max-w-md z-[99999]">
        <div className="relative">
          <input
            type="text"
            placeholder="Busca arroz, bebidas, snacks..."
            value={query}
            onChange={handleSearchChange}
            onFocus={() => {
              if (query.trim() !== "" && filteredProducts.length > 0) setIsOpen(true);
            }}
            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 pl-10 rounded-xl text-sm outline-none focus:border-red-600 transition shadow-inner"
          />
          <span className="absolute left-3.5 top-3.5 text-zinc-500 text-sm">🔍</span>
        </div>

        {/* Desplegable de sugerencias */}
        {isOpen && query.trim() !== "" && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectProduct(p);
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer transition border-b border-zinc-800/50 last:border-none"
                >
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    {p.image ? (
                      <Image src={p.image} alt={p.name || "Producto"} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                    <p className="text-xs text-red-500 font-bold">S/ {Number(p.price || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-zinc-400">
                No se encontraron productos
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de vista rápida al seleccionar un producto */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[999999]">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl cursor-pointer"
            >
              ✕
            </button>

            <div className="w-full h-48 bg-zinc-800 rounded-2xl overflow-hidden relative flex items-center justify-center">
              {selectedProduct.image ? (
                <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-contain p-4" />
              ) : (
                <span className="text-4xl">📦</span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-1">{selectedProduct.name}</h3>
              <p className="text-xl font-black text-red-500">S/ {Number(selectedProduct.price || 0).toFixed(2)}</p>
              <p className="text-xs text-zinc-400 mt-1">Stock disponible: {selectedProduct.stock}</p>
            </div>

            <div>
              {quantity === 0 ? (
                <button
                  onClick={() => addToCart && addToCart(selectedProduct)}
                  disabled={selectedProduct.stock <= 0}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-bold rounded-xl transition cursor-pointer shadow-lg"
                >
                  {selectedProduct.stock > 0 ? "Agregar al carrito" : "Agotado"}
                </button>
              ) : (
                <div className="flex items-center justify-between bg-zinc-800 p-2 rounded-xl border border-zinc-700">
                  <button
                    onClick={() => decreaseQuantity && decreaseQuantity(selectedProduct.id)}
                    className="w-10 h-10 rounded-lg bg-red-600 text-white font-bold text-lg flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-white font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => increaseQuantity && increaseQuantity(selectedProduct.id)}
                    disabled={quantity >= selectedProduct.stock}
                    className="w-10 h-10 rounded-lg bg-red-600 text-white font-bold text-lg flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}