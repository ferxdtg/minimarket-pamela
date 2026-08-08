"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    });
    return () => unsubscribe();
  }, []);

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
      // Filtrar productos (busca coincidencias en cualquier parte del nombre)
      const results = products.filter((p) =>
        p.name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(results);
      setIsOpen(true);
    }
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md z-[99999]">
      <div className="relative">
        <input
          type="text"
          placeholder="Busca productos..."
          value={query}
          onChange={handleSearchChange}
          onFocus={() => {
            if (query.trim() !== "" && filteredProducts.length > 0) setIsOpen(true);
          }}
          className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 pl-10 rounded-xl text-sm outline-none focus:border-red-600 transition shadow-inner"
        />
        <span className="absolute left-3.5 top-3.5 text-zinc-500 text-sm">🔍</span>
      </div>

      {/* Sugerencias usando <Link> nativo de Next.js */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <Link
                href={`/#product-${p.id}`}
                key={p.id}
                onClick={closeSearch}
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
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-zinc-400">
              No se encontraron productos
            </div>
          )}
        </div>
      )}
    </div>
  );
}