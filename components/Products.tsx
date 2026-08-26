"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import ProductCard from "./ProductCard";
import SectionTitle from "./SectionTitle";

// 🧮 ALGORITMO ANTI-ERRORES ORTOGRÁFICOS (Distancia de Levenshtein)
const getLevenshteinDistance = (a: string, b: string) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
    }
  }
  return matrix[a.length][b.length];
};

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setLoading(false);
    });

    const handleFilterCategory = (e: any) => {
      if (e.detail) {
        setSelectedCategory(e.detail.toLowerCase().trim());
        setSearchQuery("");
      }
    };
    window.addEventListener("filter_category", handleFilterCategory as EventListener);

    const handleSearchProduct = (e: any) => {
      if (e.detail !== undefined) {
        setSearchQuery(e.detail.toLowerCase().trim());
        setSelectedCategory("todos");
        const section = document.getElementById("productos-section");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("search_product", handleSearchProduct as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener("filter_category", handleFilterCategory as EventListener);
      window.removeEventListener("search_product", handleSearchProduct as EventListener);
    };
  }, []);

  if (!mounted) return null;

  // 🧠 CEREBRO SEMÁNTICO (Diccionario Intenciones vs Sinónimos)
  const smartKeywords: Record<string, string[]> = {
    "desayuno": ["avena", "cereal", "leche", "cafe", "café", "pan", "mantequilla", "mermelada", "yogur", "yogurt", "queso", "huevo"],
    "limpiar": ["lejia", "lejía", "poett", "sapolio", "escoba", "trapeador", "detergente", "piso", "limpiador", "cloro", "desinfectante"],
    "piso": ["lejia", "lejía", "poett", "sapolio", "escoba", "trapeador", "detergente", "cera"],
    "sed": ["agua", "gaseosa", "coca", "inca", "jugo", "rehidratante", "cerveza", "helado", "refresco", "bebida"],
    "calor": ["agua", "gaseosa", "helado", "cerveza", "hielo", "jugo", "marciano"],
    "antojo": ["galleta", "chocolate", "piqueo", "snack", "dulce", "caramelo", "papas", "chizitos", "doritos"],
    "pelicula": ["cancha", "popcorn", "gaseosa", "snack", "piqueo", "chocolate", "doritos", "papas"],
    "dulce": ["galleta", "chocolate", "caramelo", "azucar", "azúcar", "manjar", "mermelada"],
    "fiesta": ["cerveza", "piqueo", "snack", "ron", "pisco", "hielo", "gaseosa", "vodka", "vino", "cigarro"],
    "reunion": ["cerveza", "piqueo", "snack", "ron", "pisco", "hielo", "gaseosa", "vodka", "vino"],
    "almuerzo": ["arroz", "aceite", "fideos", "pasta", "atun", "atún", "sal", "sazonador", "sopa", "menestra", "lenteja", "frijol"],
    "cena": ["arroz", "aceite", "fideos", "pasta", "atun", "atún", "sopa", "huevo", "leche"],
    "mascota": ["perro", "gato", "ricocan", "ricocat", "pedigree", "comida", "arena", "paté", "mimaskot"],
    "bebe": ["pañal", "pañales", "leche", "formula", "toallitas", "shampoo", "talco"],
    "baño": ["papel", "higienico", "jabon", "jabón", "shampoo", "acondicionador", "pasta", "cepillo", "colinos"],
  };

  // 🧹 Función para limpiar tildes y mayúsculas
  const normalizeText = (text: string) => 
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredProducts = products.filter((product) => {
    const catMatch = selectedCategory === "todos" || product.category?.toLowerCase() === selectedCategory;

    // Si no hay búsqueda, solo filtramos por categoría
    if (!searchQuery) return catMatch;

    const queryNormalized = normalizeText(searchQuery);
    const prodName = normalizeText(product.name || "");
    const prodCat = normalizeText(product.category || "");
    const prodSku = normalizeText(product.sku || "");

    // 1️⃣ Búsqueda Tradicional Literal (Coincidencia exacta)
    let matchesSearch = prodName.includes(queryNormalized) || prodSku.includes(queryNormalized) || prodCat.includes(queryNormalized);

    // 2️⃣ Búsqueda Inteligente (Cruce de diccionario y Errores Ortográficos)
    if (!matchesSearch) {
      const searchWords = queryNormalized.split(" ").filter(w => w.length > 0);
      const prodWords = prodName.split(" ").concat(prodCat.split(" ")).filter(w => w.length > 0);
      
      for (const word of searchWords) {
        
        // A. Intenciones (Si escribe "desayuno", busca los sinónimos)
        if (smartKeywords[word]) {
          const isRelated = smartKeywords[word].some(synonym => {
            const synNorm = normalizeText(synonym);
            return prodName.includes(synNorm) || prodCat.includes(synNorm);
          });
          if (isRelated) {
            matchesSearch = true;
            break;
          }
        }

        // B. Tolerancia a Errores Ortográficos (Fuzzy Match)
        // Ejemplo: Si escribe "aloz", lo comparará con "arroz" y verá que solo hay 2 letras de diferencia
        if (!matchesSearch && word.length >= 3) {
          // Si la palabra tiene 4 o más letras, perdonamos 2 errores (ej: lichi -> leche). Si tiene 3, perdonamos 1.
          const maxDistance = word.length >= 4 ? 2 : 1; 
          
          for (const pWord of prodWords) {
            if (pWord.length >= 3 && getLevenshteinDistance(word, pWord) <= maxDistance) {
              matchesSearch = true;
              break;
            }
          }
        }

        if (matchesSearch) break; // Si ya hizo match, dejamos de procesar esta palabra
      }
    }

    return catMatch && matchesSearch;
  });

  return (
    <section id="productos-section" className="py-12 px-2 sm:px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 px-2 sm:px-0">
        <SectionTitle
          title={
            searchQuery
              ? `Buscando: "${searchQuery}"`
              : selectedCategory === "todos"
              ? "Nuestros Productos"
              : `Categoría: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
          }
          subtitle="Calidad y frescura directa a tu hogar"
        />
        
        {(selectedCategory !== "todos" || searchQuery !== "") && (
          <button
            onClick={() => {
              setSelectedCategory("todos");
              setSearchQuery("");
            }}
            className="text-xs font-black bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm self-start md:self-auto cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <span>Ver todo el catálogo</span>
            <span className="bg-red-600/10 rounded-full w-5 h-5 flex items-center justify-center">✕</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 px-1 sm:px-0">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-3 sm:p-5 flex flex-col h-full animate-pulse shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="w-full aspect-square bg-slate-100 rounded-xl sm:rounded-2xl mb-4"></div>
              <div className="w-3/4 h-4 sm:h-5 bg-slate-200 rounded-full mb-3"></div>
              <div className="w-1/2 h-3 sm:h-4 bg-slate-100 rounded-full mb-6"></div>
              <div className="w-full h-10 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl mt-auto"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm mx-2 sm:mx-0">
          <div className="text-6xl mb-4 opacity-50">🛒</div>
          <p className="text-xl font-black text-slate-800 tracking-tight">No encontramos lo que buscas.</p>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Prueba buscando por categoría o usando otras palabras.</p>
          <button 
            onClick={() => { setSelectedCategory("todos"); setSearchQuery(""); }}
            className="mt-6 px-8 py-3 bg-slate-900 text-white font-black rounded-full hover:bg-black transition-colors cursor-pointer active:scale-95 shadow-lg"
          >
            Volver al inicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 px-1 sm:px-0">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}