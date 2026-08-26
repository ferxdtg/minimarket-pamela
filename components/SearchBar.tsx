"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Image from "next/image";

// 🧮 ALGORITMO ANTI-ERRORES ORTOGRÁFICOS
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

// 🧠 CEREBRO SEMÁNTICO (Diccionario de Intenciones)
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

// 🧹 Limpieza de tildes
const normalizeText = (text: string) => 
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 1. Cargar catálogo
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

  // 2. Cerrar al hacer clic fuera
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

  // 3. Filtrar sugerencias (AHORA CON IA Y ANTI-ERRORES)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setFilteredProducts([]);
      setIsOpen(false);
    } else {
      const queryNormalized = normalizeText(value.trim());

      const results = products.filter((p) => {
        const prodName = normalizeText(p.name || "");
        const prodCat = normalizeText(p.category || "");
        const prodSku = normalizeText(p.sku || "");

        // A. Búsqueda Tradicional Literal
        let isMatch = prodName.includes(queryNormalized) || prodSku.includes(queryNormalized) || prodCat.includes(queryNormalized);

        // B. Búsqueda Inteligente (Diccionario y Tolerancia a Errores)
        if (!isMatch) {
          const searchWords = queryNormalized.split(" ").filter(w => w.length > 0);
          const prodWords = prodName.split(" ").concat(prodCat.split(" ")).filter(w => w.length > 0);

          for (const word of searchWords) {
            // Diccionario Semántico (ej: "desayuno" -> busca leche, cafe...)
            if (smartKeywords[word]) {
              const isRelated = smartKeywords[word].some(synonym => {
                const synNorm = normalizeText(synonym);
                return prodName.includes(synNorm) || prodCat.includes(synNorm);
              });
              if (isRelated) {
                isMatch = true;
                break;
              }
            }

            // Corrector Ortográfico (Fuzzy Match)
            // Si escribe "aloz" en vez de "arroz"
            if (!isMatch && word.length >= 3) {
              const maxDistance = word.length >= 4 ? 2 : 1; 
              for (const pWord of prodWords) {
                if (pWord.length >= 3 && getLevenshteinDistance(word, pWord) <= maxDistance) {
                  isMatch = true;
                  break;
                }
              }
            }

            if (isMatch) break;
          }
        }

        return isMatch;
      });

      setFilteredProducts(results);
      setIsOpen(true);
    }
  };

  // 4. Traslado directo
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
    <div ref={searchRef} className="relative w-full max-w-md z-[99999]">
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