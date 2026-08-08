"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cargar productos al iniciar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(list);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProducts();
  }, []);

  // Cerrar al hacer clic fuera
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
      const results = products.filter(p => 
        p.name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(results);
      setIsOpen(true);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    setQuery("");
    
    // Desplazarse suavemente hacia el producto en la página
    const element = document.getElementById(`product-${productId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-4", "ring-red-600");
      setTimeout(() => {
        element.classList.remove("ring-4", "ring-red-600");
      }, 2000);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          placeholder="Busca arroz, bebidas, snacks..."
          value={query}
          onChange={handleSearchChange}
          onFocus={() => {
            if (query.trim() !== "" && filteredProducts.length > 0) setIsOpen(true);
          }}
          className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 pl-10 rounded-2xl text-sm outline-none focus:border-red-600 transition shadow-inner"
        />
        <span className="absolute left-3.5 top-3.5 text-zinc-500 text-sm">🔍</span>
      </div>

      {/* Sugerencias desplegables con z-index alto para que nunca se oculten */}
      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[99999] max-h-72 overflow-y-auto">
          {filteredProducts.map(p => (
            <div
              key={p.id}
              onClick={() => handleSelectProduct(p.id)}
              className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer transition border-b border-zinc-800/50 last:border-none"
            >
              <div className="w-10 h-10 bg-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                {p.image ? (
                  <Image src={p.image} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <span>📦</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                <p className="text-xs text-red-500 font-bold">S/ {Number(p.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.trim() !== "" && filteredProducts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 text-center text-xs text-zinc-400 z-[99999]">
          No se encontraron productos
        </div>
      )}
    </div>
  );
}