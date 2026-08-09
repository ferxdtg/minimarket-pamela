"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"inventario" | "marketing">("inventario");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para tu formulario original de nuevo producto
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Abarrotes Y Despensa");
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [image, setImage] = useState("");

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = querySnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      setProducts(list);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Función directa y segura para modificar stock con los botones + y -
  const handleStockUpdate = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, (Number(currentStock) || 0) + delta);
    
    // Actualización visual inmediata
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));

    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, { stock: newStock });
    } catch (error) {
      console.error("Error al actualizar stock en Firebase:", error);
      fetchProducts(); // Reintegrar datos originales si ocurre un fallo de red
    }
  };

  // Función para marketing (Oferta / Destacado)
  const handleMarketingToggle = async (id: string, field: "isOnSale" | "isFeatured", currentValue: boolean) => {
    const newValue = !currentValue;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: newValue } : p));

    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, { [field]: newValue });
    } catch (error) {
      console.error("Error al actualizar marketing:", error);
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABECERA Y PESTAÑAS DE ROL */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white">Minimarket Pamela - Panel de Control</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Gestión unificada para almacén, marketing y administración.</p>
          </div>

          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab("inventario")}
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${activeTab === "inventario" ? "bg-red-600 text-white" : "text-zinc-400"}`}
            >
              📦 Almacén y Stock
            </button>
            <button
              onClick={() => setActiveTab("marketing")}
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${activeTab === "marketing" ? "bg-red-600 text-white" : "text-zinc-400"}`}
            >
              🔥 Marketing y Ofertas
            </button>
          </div>
        </div>

        {/* VISTA 1: ALMACÉN (Formulario original + Catálogo con control rápido de stock) */}
        {activeTab === "inventario" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* TU FORMULARIO ORIGINAL DE NUEVO PRODUCTO */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl h-fit space-y-4">
              <h2 className="text-sm font-black text-zinc-200 border-b border-zinc-800 pb-3">Agregar Nuevo Producto</h2>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">NOMBRE DEL PRODUCTO</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Aceite Primor 1L"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">PRECIO (S/)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">STOCK</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={e => setStock(e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1">CATEGORÍA</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  >
                    <option>Abarrotes Y Despensa</option>
                    <option>Snacks</option>
                    <option>Ofertas</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input type="checkbox" checked={isOnSale} onChange={e => setIsOnSale(e.target.checked)} className="accent-red-600 w-4 h-4" />
                    En Oferta
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="accent-red-600 w-4 h-4" />
                    Destacado
                  </label>
                </div>
              </div>
            </div>

            {/* CATÁLOGO ACTUAL CON BOTONES DE STOCK RÁPIDO (+ / -) Y SEMÁFORO */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
              <h2 className="text-sm font-black text-zinc-200 border-b border-zinc-800 pb-3 mb-4">Catálogo Actual ({products.length})</h2>

              {loading ? (
                <p className="text-zinc-500 text-center py-10">Cargando productos...</p>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {products.map(product => {
                    const currentStock = product.stock ?? 0;
                    const isOut = currentStock === 0;
                    const isLow = currentStock > 0 && currentStock <= 5;

                    return (
                      <div key={product.id} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0">
                            {product.image ? (
                              <Image src={product.image} alt={product.name} fill className="object-contain p-1" />
                            ) : (
                              <span className="text-[9px] text-zinc-400 flex items-center justify-center h-full">N/A</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-white truncate">{product.name}</h3>
                            <p className="text-[11px] text-red-400 font-bold">S/ {(product.price ?? 0).toFixed(2)} | Stock: {currentStock}</p>
                          </div>
                        </div>

                        {/* SEMÁFORO VISUAL */}
                        <div>
                          {isOut ? (
                            <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">🔴 Agotado</span>
                          ) : isLow ? (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">🟡 Bajo</span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">🟢 OK</span>
                          )}
                        </div>

                        {/* BOTONES DE OPERACIÓN RÁPIDA DE STOCK */}
                        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                          <button
                            onClick={() => handleStockUpdate(product.id, currentStock, -1)}
                            className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center cursor-pointer text-xs"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-black text-xs">{currentStock}</span>
                          <button
                            onClick={() => handleStockUpdate(product.id, currentStock, 1)}
                            className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VISTA 2: MARKETING */}
        {activeTab === "marketing" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-black text-white">Control Rápido de Campañas y Ofertas</h2>
            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{product.name}</span>
                  <div className="flex gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.isOnSale || false}
                        onChange={() => handleMarketingToggle(product.id, "isOnSale", product.isOnSale)}
                        className="accent-red-600 w-4 h-4 cursor-pointer"
                      />
                      <span>En Oferta 🔥</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.isFeatured || false}
                        onChange={() => handleMarketingToggle(product.id, "isFeatured", product.isFeatured)}
                        className="accent-red-600 w-4 h-4 cursor-pointer"
                      />
                      <span>Destacado ⭐</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}