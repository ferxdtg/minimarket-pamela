"use client";

import { useState, useEffect } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadAll = () => {
      const saved = localStorage.getItem("minimarket_products");
      const adminProducts = saved ? JSON.parse(saved) : [];
      
      const defaultProducts = [
        { id: 101, name: "Arroz Costeño", price: 5.90, stock: 50, category: "abarrotes", isOnSale: false, isFeatured: true, image: "/productos/arrozcosteno.jpg" },
        { id: 102, name: "Leche Gloria", price: 4.50, stock: 30, category: "abarrotes", isOnSale: false, isFeatured: true, image: "/productos/lechegloria.jpg" },
        { id: 103, name: "Sopa Maruchan", price: 6.90, stock: 25, category: "snacks", isOnSale: false, isFeatured: true, image: "/productos/maruchan.jpg" },
        { id: 104, name: "Bizcocho Bimbo", price: 7.50, stock: 20, category: "snacks", isOnSale: false, isFeatured: true, image: "/productos/bizcochobimbo.jpg" },
      ];

      // Combinar y eliminar duplicados globales por nombre
      const combined = [...adminProducts, ...defaultProducts];
      const uniqueCombined = Array.from(
        new Map(combined.map((item) => [item.name.toLowerCase().trim(), item])).values()
      );

      setAllProducts(uniqueCombined);
    };

    loadAll();
    window.addEventListener("storage", loadAll);
    window.addEventListener("product_added", loadAll);
    return () => {
      window.removeEventListener("storage", loadAll);
      window.removeEventListener("product_added", loadAll);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setResults([]);
      setSuggestions([]);
      window.dispatchEvent(new CustomEvent("search_product", { detail: "" }));
    } else {
      const filtered = allProducts.filter((p) =>
        p.name.toLowerCase().includes(value.toLowerCase())
      );

      // Filtrar resultados únicos por nombre
      const uniqueResults = Array.from(
        new Map(filtered.map((item) => [item.name.toLowerCase().trim(), item])).values()
      );
      setResults(uniqueResults);

      const otherProducts = allProducts.filter(
        (p) => !p.name.toLowerCase().includes(value.toLowerCase())
      );

      const uniqueSuggestions = Array.from(
        new Map(otherProducts.map((item) => [item.name.toLowerCase().trim(), item])).values()
      );
      setSuggestions(uniqueSuggestions.slice(0, 3));
    }
  };

  const handleSelectProduct = (productName: string) => {
    setQuery(productName);
    setResults([]);
    setSuggestions([]);

    window.dispatchEvent(new CustomEvent("search_product", { detail: productName }));

    const section = document.getElementById("productos-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Icono de Lupa Profesional */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <input
        type="text"
        placeholder="Busca arroz, bebidas, snacks..."
        value={query}
        onChange={handleSearch}
        className="w-full bg-gray-100 pl-12 pr-5 py-3 rounded-full text-sm outline-none border border-gray-200 focus:border-red-600 focus:bg-white transition shadow-sm text-gray-900 font-medium"
      />

      {(results.length > 0 || suggestions.length > 0) && query.trim() !== "" && (
        <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-3xl shadow-2xl z-[999] p-4 space-y-4">
          
          {results.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-wider">Resultados de búsqueda</p>
              <div className="space-y-2">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.name)}
                    className="flex items-center justify-between p-2 hover:bg-red-50 rounded-2xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image && product.image.trim() !== "" ? product.image : "/placeholder.png"}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-xl border border-gray-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{product.name}</h4>
                        <p className="text-[10px] text-red-600 font-extrabold">S/ {Number(product.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="text-xs text-red-600 font-bold">Ver →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-wider">💡 Otros productos sugeridos</p>
              <div className="grid grid-cols-3 gap-2">
                {suggestions.map((sug) => (
                  <div
                    key={sug.id}
                    onClick={() => handleSelectProduct(sug.name)}
                    className="bg-gray-50 p-2 rounded-2xl text-center cursor-pointer hover:bg-red-50 hover:border-red-200 border border-transparent transition"
                  >
                    <img 
                      src={sug.image && sug.image.trim() !== "" ? sug.image : "/placeholder.png"} 
                      alt={sug.name} 
                      className="w-10 h-10 object-cover mx-auto rounded-lg mb-1 border border-gray-200" 
                    />
                    <p className="text-[10px] font-bold truncate text-gray-800">{sug.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}