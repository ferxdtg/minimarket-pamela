"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import ProductCard from "./ProductCard";

// Skeleton de carga
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 animate-pulse border border-slate-100 shadow-sm h-64">
      <div className="bg-slate-100 rounded-xl w-full aspect-square mb-3" />
      <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-full mb-1" />
      <div className="h-4 bg-slate-100 rounded w-4/5 mb-3" />
      <div className="h-8 bg-slate-100 rounded-xl w-full mt-auto" />
    </div>
  );
}

// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

const smartKeywords: Record<string, string[]> = {
  "coca cola": ["gaseosa", "refresco", "bebida", "cola"],
  inca: ["inca kola", "gaseosa"],
  agua: ["agua mineral", "agua sin gas", "agua con gas"],
  pollo: ["pollo entero", "pechuga", "pierna"],
  pan: ["pan de molde", "pan de trigo", "panetón"],
  arroz: ["arroz blanco", "arroz integral"],
  aceite: ["aceite vegetal", "aceite de oliva"],
  leche: ["leche evaporada", "leche fresca", "yogurt"],
  azucar: ["azúcar", "azucar blanca"],
  café: ["cafe", "nescafe"],
};

function fuzzyMatch(query: string, productName: string): boolean {
  const q = query.toLowerCase().trim();
  const n = productName.toLowerCase();
  if (n.includes(q)) return true;
  const synonyms = smartKeywords[q] || [];
  if (synonyms.some(s => n.includes(s))) return true;
  const words = q.split(" ");
  for (const word of words) {
    if (word.length > 2) {
      const productWords = n.split(" ");
      for (const pw of productWords) {
        if (pw.length > 2 && levenshtein(word, pw) <= 1) return true;
      }
    }
  }
  return false;
}

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error productos:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Aplicar filtros + ordenamiento
  useEffect(() => {
    let list = [...products];

    // Filtro por categoría
    if (activeCategory !== "todos") {
      list = list.filter(p =>
        String(p.category || "").toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      list = list.filter(p => fuzzyMatch(searchQuery, p.name || ""));
    }

    // Ordenar: disponibles primero, agotados al final
    list.sort((a, b) => {
      const aOut = Number(a.stock) <= 0;
      const bOut = Number(b.stock) <= 0;
      if (aOut && !bOut) return 1;
      if (!aOut && bOut) return -1;
      return 0;
    });

    setFiltered(list);
  }, [products, activeCategory, searchQuery]);

  // Escuchar eventos de filtro
  useEffect(() => {
    const handleCategory = (e: CustomEvent) => {
      setActiveCategory(e.detail || "todos");
    };
    const handleSearch = (e: CustomEvent) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener("filter_category", handleCategory as EventListener);
    window.addEventListener("search_product", handleSearch as EventListener);
    return () => {
      window.removeEventListener("filter_category", handleCategory as EventListener);
      window.removeEventListener("search_product", handleSearch as EventListener);
    };
  }, []);

  return (
    <section id="productos-section" className="py-8 px-4 sm:px-6 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : activeCategory !== "todos"
                ? `📂 ${activeCategory}`
                : "Todos los Productos"}
            </h2>
            {!loading && (
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {filtered.length} {filtered.length === 1 ? "producto" : "productos"} disponibles
              </p>
            )}
          </div>
          {(activeCategory !== "todos" || searchQuery) && (
            <button
              onClick={() => {
                setActiveCategory("todos");
                setSearchQuery("");
                window.dispatchEvent(new CustomEvent("filter_category", { detail: "todos" }));
              }}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              Ver todo →
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <span className="text-6xl">🔍</span>
            <h3 className="text-xl font-black text-slate-700">Sin resultados</h3>
            <p className="text-slate-500 text-sm">
              {searchQuery
                ? `No encontramos "${searchQuery}". Prueba con otro término.`
                : "No hay productos en esta categoría aún."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}