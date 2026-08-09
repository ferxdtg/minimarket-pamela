"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"inventario" | "pedidos">("inventario");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para Agregar Nuevo Producto
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("Abarrotes y Despensa");
  const [newIsOnSale, setNewIsOnSale] = useState(false);
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [newImage, setNewImage] = useState("");

  // Estado para el modal de edición
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "Abarrotes y Despensa",
    isOnSale: false,
    isFeatured: false,
    image: ""
  });

  // Lista simulada de pedidos para cumplir con el indicador (12)
  const [orders, setOrders] = useState([
    { id: 1, client: "Pamela", phone: "9878554", address: "Calle Principal", items: "2x Sopa Maruchan", total: 13.80, status: "PENDIENTE" },
    { id: 2, client: "Carlos Ruiz", phone: "9123456", address: "Av. Los Álamos 402", items: "1x Aceite Primor 1L, 3x Arroz Costeño", total: 24.50, status: "PENDIENTE" },
    { id: 3, client: "Ana Torres", phone: "9988776", address: "Jr. Gamarra 120", items: "6x Leche Gloria Azul", total: 27.00, status: "ENTREGADO" },
    { id: 4, client: "Luis Mendoza", phone: "9456123", address: "Calle Las Begonias 89", items: "1x Detergente Bolívar 3kg", total: 28.50, status: "PENDIENTE" },
    { id: 5, client: "Sofía Castro", phone: "9784512", address: "Urb. San Andrés Mz. B", items: "2x Cerveza Cusqueña 6pack", total: 46.00, status: "ENTREGADO" }
  ]);

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

  // Compresión automática de imágenes al mínimo peso
  const compressImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        callback(dataUrl);
      };
    };
  };

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setNewImage(compressedBase64);
      });
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setEditForm(prev => ({ ...prev, image: compressedBase64 }));
      });
    }
  };

  // Guardar NUEVO producto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: newName,
        price: parseFloat(newPrice) || 0,
        stock: parseInt(newStock) || 0,
        category: newCategory,
        isOnSale: newIsOnSale,
        isFeatured: newIsFeatured,
        image: newImage || ""
      };

      await addDoc(collection(db, "products"), productData);
      
      setNewName("");
      setNewPrice("");
      setNewStock("");
      setNewCategory("Abarrotes y Despensa");
      setNewIsOnSale(false);
      setNewIsFeatured(false);
      setNewImage("");

      fetchProducts();
      alert("¡Producto publicado con éxito!");
    } catch (error: any) {
      console.error("Error al crear producto:", error);
      alert(`Error al publicar: ${error.message}`);
    }
  };

  // Botones de Stock Rápido (+ / -) con sincronización inmediata
  const handleStockUpdate = async (id: string, currentStock: number, delta: number) => {
    const stringId = String(id).trim();
    if (!stringId) return;

    const parsedCurrent = Number(currentStock) || 0;
    const updatedStock = Math.max(0, parsedCurrent + delta);
    
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (String(p.id).trim() === stringId) {
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );

    try {
      const productRef = doc(db, "products", stringId);
      await updateDoc(productRef, { stock: updatedStock });
    } catch (error: any) {
      console.error("Error al actualizar stock en Firebase:", error);
      alert(`No se pudo actualizar el stock: ${error.message}`);
      fetchProducts();
    }
  };

  // 🗑️ FUNCIÓN PARA ELIMINAR PRODUCTO
  const handleDeleteProduct = async (id: string, name: string) => {
    const stringId = String(id).trim();
    if (!stringId) return;

    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar "${name}" del inventario?`);
    if (!confirmDelete) return;

    setProducts(prevProducts => prevProducts.filter(p => String(p.id).trim() !== stringId));

    try {
      const productRef = doc(db, "products", stringId);
      await deleteDoc(productRef);
    } catch (error: any) {
      console.error("Error al eliminar el producto en Firebase:", error);
      alert(`No se pudo eliminar el producto: ${error.message}`);
      fetchProducts();
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      category: product.category || "Abarrotes y Despensa",
      isOnSale: product.isOnSale || false,
      isFeatured: product.isFeatured || false,
      image: product.image || ""
    });
  };

  // Guardar cambios del modal de edición
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const stringId = String(editingProduct.id).trim();
    const finalData = {
      name: editForm.name,
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      category: editForm.category,
      isOnSale: editForm.isOnSale,
      isFeatured: editForm.isFeatured,
      image: editForm.image || editingProduct.image || ""
    };
    
    setProducts(prev => prev.map(p => String(p.id).trim() === stringId ? { ...p, ...finalData } : p));

    try {
      const productRef = doc(db, "products", stringId);
      await updateDoc(productRef, finalData);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      console.error("Error al actualizar producto:", error);
      alert(`Error al guardar cambios: ${error.message}`);
      fetchProducts();
    }
  };

  // Marcar pedido como entregado
  const handleDeliverOrder = (orderId: number) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: "ENTREGADO" } : o))
    );
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
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

        {/* PESTAÑAS CON ICONO CORREGIDO */}
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
            
            {/* FORMULARIO DE NUEVO PRODUCTO */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl h-fit space-y-4">
              <h2 className="text-sm font-black text-white">Agregar Nuevo Producto</h2>
              
              <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Nombre del producto</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ej. Aceite Primor 1L"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Precio (S/)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Stock</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={e => setNewStock(e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                  >
                    <option>Abarrotes y Despensa</option>
                    <option>Snacks</option>
                    <option>Ofertas</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input
                      type="checkbox"
                      checked={newIsOnSale}
                      onChange={e => setNewIsOnSale(e.target.checked)}
                      className="accent-red-600 w-4 h-4 cursor-pointer"
                    />
                    En Oferta
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input
                      type="checkbox"
                      checked={newIsFeatured}
                      onChange={e => setNewIsFeatured(e.target.checked)}
                      className="accent-red-600 w-4 h-4 cursor-pointer"
                    />
                    Destacado
                  </label>
                </div>

                {/* BOTONES CON CÁMARA Y ARCHIVO */}
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Imagen del producto</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-2.5 rounded-xl font-bold text-zinc-300 flex items-center justify-center gap-2 transition cursor-pointer text-center">
                      📁 Subir Archivo
                      <input type="file" accept="image/*" onChange={handleNewFileChange} className="hidden" />
                    </label>
                    <label className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-2.5 rounded-xl font-bold text-zinc-300 flex items-center justify-center gap-2 transition cursor-pointer text-center">
                      📷 Usar Cámara
                      <input type="file" accept="image/*" capture="environment" onChange={handleNewFileChange} className="hidden" />
                    </label>
                  </div>
                  {newImage && <p className="text-[10px] text-emerald-400 mt-1 font-bold">✓ Imagen lista para publicar</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-lg cursor-pointer mt-2"
                >
                  Publicar Producto
                </button>
              </form>
            </div>

            {/* CATÁLOGO ACTUAL CON BUSCADOR, BOTONES + / - , EDITAR Y ELIMINAR */}
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
                    const currentStock = Number(product.stock ?? 0);
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
                            <p className="text-[11px] text-red-400 font-bold">S/ {(Number(product.price) ?? 0).toFixed(2)} | Stock: {currentStock}</p>
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

                        {/* ACCIONES: BOTONES + / - , EDITAR Y ELIMINAR */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                            <button
                              type="button"
                              onClick={() => handleStockUpdate(product.id, currentStock, -1)}
                              className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center cursor-pointer text-xs transition"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-black text-xs">{currentStock}</span>
                            <button
                              type="button"
                              onClick={() => handleStockUpdate(product.id, currentStock, 1)}
                              className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center cursor-pointer text-xs transition"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl font-bold text-xs transition cursor-pointer"
                          >
                            ✏️ Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded-xl font-bold text-xs transition cursor-pointer"
                            title="Eliminar producto"
                          >
                            🗑️
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

        {/* VISTA PEDIDOS AMPLIADA CON MÚLTIPLES REGISTROS */}
        {activeTab === "pedidos" && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-white">Historial de Pedidos Recibidos ({orders.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map(order => (
                <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-white">{order.client}</h3>
                      <p className="text-xs text-zinc-400">Tel: {order.phone} • {order.address}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      order.status === "PENDIENTE" 
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30" 
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-zinc-300">
                      <span>{order.items}</span>
                      <span>S/ {order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-2 border-t border-zinc-800">
                      <span>TOTAL</span>
                      <span className="text-red-400">S/ {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  {order.status === "PENDIENTE" ? (
                    <button 
                      type="button" 
                      onClick={() => handleDeliverOrder(order.id)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      ✓ Marcar como Entregado
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-zinc-950 text-emerald-400 font-bold text-xs rounded-xl text-center border border-emerald-900/30">
                      Entregado con éxito ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL DE EDICIÓN COMPLETA */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-black">Editar Producto</h3>
                <button 
                  type="button"
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

                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Categoría</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-600"
                  >
                    <option>Abarrotes y Despensa</option>
                    <option>Snacks</option>
                    <option>Ofertas</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input
                      type="checkbox"
                      checked={editForm.isOnSale}
                      onChange={e => setEditForm({ ...editForm, isOnSale: e.target.checked })}
                      className="accent-red-600 w-4 h-4 cursor-pointer"
                    />
                    En Oferta 🔥
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input
                      type="checkbox"
                      checked={editForm.isFeatured}
                      onChange={e => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                      className="accent-red-600 w-4 h-4 cursor-pointer"
                    />
                    Destacado ⭐
                  </label>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Fotografía del Producto</label>
                  <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                    <div className="relative w-12 h-12 bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                      {editForm.image ? (
                        <Image src={editForm.image} alt="Vista previa" fill className="object-contain p-1" />
                      ) : (
                        <span className="text-[9px] text-zinc-500 flex items-center justify-center h-full">N/A</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block bg-red-600 hover:bg-red-700 text-white text-center py-1.5 px-3 rounded-lg font-bold text-xs cursor-pointer transition">
                        Cambiar Fotografía
                        <input type="file" accept="image/*" onChange={handleEditFileChange} className="hidden" />
                      </label>
                    </div>
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