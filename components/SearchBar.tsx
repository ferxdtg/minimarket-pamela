"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Image from "next/image";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 1. Cargar catálogo de Firestore en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: String(doc.id),
        ...doc.data(),
      }));
      setProducts(list);
    });
    return () => unsubscribe();
  }, []);

  // 2. Cerrar si se hace clic fuera del buscador
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // 3. Filtrar sugerencias (Inteligente y flexible)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setFilteredProducts([]);
      setIsOpen(false);
    } else {
      const results = products.filter((p) =>
        p.name?.toLowerCase().includes(value.toLowerCase().trim())
      );
      setFilteredProducts(results);
      setIsOpen(true);
    }
  };

  // 4. Traslado directo al producto o al catálogo
  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    setQuery("");

    const targetId = `product-${productId}`;
    
    setTimeout(() => {
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-4", "ring-red-600");
        setTimeout(() => {
          element.classList.remove("ring-4", "ring-red-600");
        }, 2000);
      } else {
        window.location.hash = targetId;
      }
    }, 50);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          placeholder="Busca arroz, leche, bebidas, snacks..."
          value={query}
          onChange={handleSearchChange}
          onFocus={() => {
            if (query.trim() !== "" && filteredProducts.length > 0) setIsOpen(true);
          }}
          className="w-full bg-slate-100 hover:bg-slate-200/60 focus:bg-white text-slate-900 placeholder-slate-400 px-4 py-3 pl-10 rounded-2xl text-sm outline-none border border-transparent focus:border-red-600 transition-all shadow-inner"
        />
        <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
      </div>

      {/* Menú desplegable Luminoso y Limpio */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[99999] max-h-72 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleSelectProduct(p.id);
                }}
                className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition border-b border-slate-100 last:border-none active:bg-slate-100"
              >
                <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-100">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name || "Producto"}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{p.name}</h4>
                  <p className="text-xs text-red-600 font-bold">S/ {Number(p.price || 0).toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              No se encontraron productos
            </div>
          )}
        </div>
      )}
    </div>
  );
}