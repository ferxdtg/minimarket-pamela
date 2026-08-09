"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"inventario" | "pedidos">("inventario");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modal de edición
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: 0, stock: 0 });

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = querySnapshot.docs.map(document => ({
        id: document.id, // ID real de Firestore
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

  // Función corregida y blindada para actualizar stock con + y -
  const handleStockUpdate = async (id: string, currentStock: number, delta: number) => {
    const stringId = String(id).trim();
    if (!stringId) return;

    const newStock = Math.max(0, (Number(currentStock) || 0) + delta);
    
    // Actualización visual inmediata en pantalla
    setProducts(prev => prev.map(p => p.id === stringId ? { ...p, stock: newStock } : p));

    try {
      const productRef = doc(db, "products", stringId);
      await updateDoc(productRef, { stock: newStock });
      console.log("Stock actualizado en Firebase para el ID:", stringId);
    } catch (error: any) {
      console.error("Error al actualizar stock en Firebase:", error);
      alert(`No se pudo actualizar el stock: ${error.message}`);
      fetchProducts(); // Revertir si falla
    }
  };

  // Abrir modal de edición
  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: Number(product.price || 0),
      stock: Number(product.stock || 0)
    });
  };

  // Guardar cambios del modal de edición
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const stringId = String(editingProduct.id).trim();
    
    // Actualización visual inmediata
    setProducts(prev => prev.map(p => p.id === stringId ? { ...p, ...editForm } : p));

    try {
      const productRef = doc(db, "products", stringId);
      await updateDoc(productRef, {
        name: editForm.name,
        price: editForm.price,
        stock: editForm.stock
      });
      setEditingProduct(null);
      console.log("Producto editado con éxito");
    } catch (error: any) {
      console.error("Error al actualizar producto:", error);
      alert(`Error al guardar cambios: ${error.message}`);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO ORIGINAL */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
              PANEL DE CONTROL
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-1 text-white">Minimarket Pamela</h1>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-zinc-300">ferxdtg@gmail.com</span>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg transition cursor-pointer">
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* PESTAÑAS ORIGINALES */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("inventario")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
              activeTab === "inventario" ? "bg-red-600 text-white shadow-lg" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
            }`}
          >
            📦 INVENTARIO
          </button>
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
              activeTab === "pedidos" ? "bg-red-600 text-white shadow-lg" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
            }`}
          >
            🛒 PEDIDOS (12)
          </button>
        </div>

        {/* VISTA INVENTARIO */}
        {activeTab === "inventario" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* FORMULARIO ORIGINAL DE NUEVO PRODUCTO */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl h-fit space-y-4">
              <h2 className="text-sm font-black text-white">Agregar Nuevo Producto</h2>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Nombre del producto</label>
                  <input
                    type="text"
                    placeholder="Ej. Aceite Primor 1L"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Precio (S/)</label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Stock</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Categoría</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600">
                    <option>Abarrotes y Despensa</option>
                    <option>Snacks</option>
                    <option>Ofertas</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input type="checkbox" className="accent-red-600 w-4 h-4 cursor-pointer" />
                    En Oferta
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input type="checkbox" className="accent-red-600 w-4 h-4 cursor-pointer" />
                    Destacado
                  </label>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Imagen del producto</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-2.5 rounded-xl font-bold text-zinc-300 flex items-center justify-center gap-2 transition cursor-pointer">
                      📁 Subir Archivo
                    </button>
                    <button type="button" className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-2.5 rounded-xl font-bold text-zinc-300 flex items-center justify-center gap-2 transition cursor-pointer">
                      📷 Usar Cámara
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-lg cursor-pointer mt-2"
                >
                  Publicar Producto
                </button>
              </div>
            </div>

            {/* CATÁLOGO ACTUAL CON BUSCADOR, BOTONES + / - Y BOTÓN EDITAR */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-3">
                <h2 className="text-sm font-black text-white">Catálogo Actual ({filteredProducts.length})</h2>
                
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">🔍</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {loading ? (
                <p className="text-zinc-500 text-center py-10">Cargando catálogo...</p>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {filteredProducts.map(product => {
                    const currentStock = product.stock ?? 0;
                    const isOut = currentStock === 0;
                    const isLow = currentStock > 0 && currentStock <= 5;

                    return (
                      <div key={product.id} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-zinc-700 transition">
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
                            <span className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase font-bold tracking-wider">{product.category || "Abarrotes"}</span>
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

                        {/* ACCIONES: BOTONES + / - Y BOTÓN EDITAR */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                            <button
                              onClick={() => handleStockUpdate(product.id, currentStock, -1)}
                              className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center cursor-pointer text-xs transition"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-black text-xs">{currentStock}</span>
                            <button
                              onClick={() => handleStockUpdate(product.id, currentStock, 1)}
                              className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center cursor-pointer text-xs transition"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => openEditModal(product)}
                            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl font-bold text-xs transition cursor-pointer"
                          >
                            ✏️ Editar
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

        {/* VISTA PEDIDOS */}
        {activeTab === "pedidos" && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-white">Historial de Pedidos Recibidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white">Pamelllll</h3>
                    <p className="text-xs text-zinc-400">Tel: 9878554 • Calle 48</p>
                  </div>
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">PENDIENTE</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-zinc-300">
                    <span>2x Sopa Maruchan</span>
                    <span>S/ 13.80</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-2 border-t border-zinc-800">
                    <span>TOTAL</span>
                    <span className="text-red-400">S/ 13.80</span>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer">
                  ✓ Marcar como Entregado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE EDICIÓN RÁPIDA */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-black">Editar Producto</h3>
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="text-zinc-400 hover:text-white font-bold text-base cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Nombre del producto</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Precio (S/)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={editForm.price}
                      onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Stock</label>
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={e => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-zinc-300 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white transition cursor-pointer shadow-lg"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}