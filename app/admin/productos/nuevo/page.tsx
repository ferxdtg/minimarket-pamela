"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import Image from "next/image";

export default function AdminProductsPage() {
  // Navegación principal
  const [activeTab, setActiveTab] = useState<"inventario" | "pedidos">("inventario");

  // Estados de Inventario
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Estado del formulario
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("abarrotes");
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados de Pedidos
  const [orders, setOrders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState<"todos" | "pendiente" | "entregado">("todos");

  // Referencias para carga de imágenes
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 1. Cargar Productos en tiempo real desde Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    });
    return () => unsubscribe();
  }, []);

  // 2. Cargar Pedidos en tiempo real desde Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(list);
    });
    return () => unsubscribe();
  }, []);

  // Conversión de Imagen a Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Limpiar formulario
  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setStock("");
    setCategory("abarrotes");
    setIsOnSale(false);
    setIsFeatured(false);
    setImage("");
  };

  // Cargar datos en el formulario para editar
  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name || "");
    setPrice(product.price ? String(product.price) : "");
    setStock(product.stock ? String(product.stock) : "");
    setCategory(product.category || "abarrotes");
    setIsOnSale(Boolean(product.isOnSale));
    setIsFeatured(Boolean(product.isFeatured));
    setImage(product.image || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Guardar (Crear o Actualizar) corrigiendo campos undefined
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert("Por favor completa el nombre y el precio del producto.");
      return;
    }

    setLoading(true);
    try {
      // Objeto limpio para evitar errores en Firestore por campos undefined
      const productData: any = {
        name: name.trim(),
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        category: (category || "abarrotes").toLowerCase().trim(),
        isOnSale: Boolean(isOnSale),
        isFeatured: Boolean(isFeatured),
        image: image ? image.trim() : "",
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
      } else {
        productData.createdAt = serverTimestamp();
        await addDoc(collection(db, "products"), productData);
      }

      resetForm();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Ocurrió un error al guardar el producto.");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const handleDelete = async (id: string, productName: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${productName}"?`)) {
      try {
        await deleteDoc(doc(db, "products", id));
        if (editingId === id) resetForm();
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    }
  };

  // Cambiar estado de un pedido (Pendiente <-> Entregado)
  const toggleOrderStatus = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === "entregado" ? "pendiente" : "entregado";
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
    }
  };

  // Filtrar Productos
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrar Pedidos
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "todos") return true;
    const status = (o.status || "pendiente").toLowerCase();
    return status === orderFilter;
  });

  const pendingCount = orders.filter(
    (o) => (o.status || "pendiente").toLowerCase() === "pendiente"
  ).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
        <div>
          <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-1">
            Panel de Control
          </p>
          <h1 className="text-2xl font-black">Minimarket Pamela</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
            ferxdtg@gmail.com
          </span>
          <button className="text-xs bg-zinc-900 hover:bg-zinc-800 text-red-400 px-4 py-2 rounded-full font-bold border border-zinc-800 transition">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("inventario")}
          className={`px-6 py-2.5 rounded-full text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === "inventario"
              ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          🏷️ INVENTARIO
        </button>
        <button
          onClick={() => setActiveTab("pedidos")}
          className={`px-6 py-2.5 rounded-full text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === "pedidos"
              ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          🧾 PEDIDOS ({pendingCount})
        </button>
      </div>

      {/* VISTA 1: INVENTARIO */}
      {activeTab === "inventario" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl h-fit space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                {editingId ? "Editar Producto" : "Agregar Nuevo Producto"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full transition"
                >
                  Cancelar Edición ✕
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1.5">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Aceite Primor 1L"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1.5">
                    Precio (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1.5">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none transition capitalize text-white"
                >
                  <option value="abarrotes">Abarrotes y Despensa</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="snacks">Snacks y Golosinas</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="bebes">Bebés</option>
                  <option value="ofertas">Ofertas Especiales</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <label className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-xl cursor-pointer">
                  <span className="text-xs font-bold">En Oferta</span>
                  <input
                    type="checkbox"
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                </label>

                <label className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-xl cursor-pointer">
                  <span className="text-xs font-bold">Destacado</span>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1.5">
                  Imagen del Producto
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {image && (
                  <div className="relative w-full h-36 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden mb-3 flex items-center justify-center">
                    <Image
                      src={image}
                      alt="Previsualización"
                      fill
                      className="object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold hover:bg-red-700 shadow-md cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 transition cursor-pointer"
                  >
                    📁 Subir Archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 transition cursor-pointer"
                  >
                    📷 Usar Cámara
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition cursor-pointer text-sm shadow-lg shadow-red-900/20"
              >
                {loading
                  ? "Guardando..."
                  : editingId
                  ? "Actualizar Producto"
                  : "Publicar Producto"}
              </button>
            </form>
          </div>

          {/* Catálogo de Productos */}
          <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold">
                Catálogo Actual ({products.length})
              </h2>
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white px-3 py-2 pl-8 rounded-xl outline-none focus:border-red-600 transition"
                />
                <span className="absolute left-2.5 top-2 text-xs text-zinc-500">
                  🔍
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isBeingEdited = editingId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                      isBeingEdited
                        ? "bg-red-950/20 border-red-600"
                        : "bg-zinc-950 border-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 bg-zinc-900 rounded-xl overflow-hidden shrink-0 relative border border-zinc-800 flex items-center justify-center">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold truncate text-white">
                            {p.name}
                          </h4>
                          {p.isFeatured && <span className="text-xs">⭐</span>}
                          {p.isOnSale && <span className="text-xs">🔥</span>}
                        </div>
                        <p className="text-xs text-red-500 font-bold">
                          S/ {Number(p.price || 0).toFixed(2)}{" "}
                          <span className="text-zinc-500 font-normal">
                            | Stock: {p.stock || 0}
                          </span>
                        </p>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 inline-block mt-1">
                          {p.category || "abarrotes"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(p)}
                        title="Editar producto"
                        className={`p-2.5 rounded-xl border transition text-sm cursor-pointer ${
                          isBeingEdited
                            ? "bg-red-600 text-white border-red-500"
                            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600"
                        }`}
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        title="Eliminar producto"
                        className="p-2.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-900 text-zinc-400 hover:text-red-500 rounded-xl transition text-sm cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* VISTA 2: GESTIÓN DE PEDIDOS */
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
          {/* Barra de Filtros de Pedidos */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-bold">Pedidos Recibidos</h2>
              <p className="text-xs text-zinc-400">
                Administra los estados de entrega e información de envío de los clientes.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 self-start sm:self-auto">
              <button
                onClick={() => setOrderFilter("todos")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderFilter === "todos"
                    ? "bg-zinc-800 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Todos ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter("pendiente")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderFilter === "pendiente"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                ⏳ Pendientes ({pendingCount})
              </button>
              <button
                onClick={() => setOrderFilter("entregado")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderFilter === "entregado"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                ✅ Entregados ({orders.length - pendingCount})
              </button>
            </div>
          </div>

          {/* Lista de Pedidos */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-zinc-950 rounded-2xl border border-dashed border-zinc-800 space-y-2">
              <p className="text-lg font-bold text-zinc-400">No hay pedidos disponibles</p>
              <p className="text-xs text-zinc-600">
                Los pedidos registrados en la tienda aparecerán en este panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => {
                const isPickup =
                  order.shippingType?.toLowerCase().includes("tienda") ||
                  order.deliveryType?.toLowerCase().includes("tienda") ||
                  order.isPickup;

                const isDelivered = (order.status || "pendiente").toLowerCase() === "entregado";

                return (
                  <div
                    key={order.id}
                    className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-zinc-700 transition"
                  >
                    <div className="space-y-3">
                      {/* Cabecera del Pedido */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {order.customerName || "Cliente"}
                          </h3>
                          <p className="text-xs text-zinc-500">
                            {order.phone || "Sin teléfono"}
                          </p>
                        </div>

                        {/* Etiqueta de Tipo de Envío */}
                        {isPickup ? (
                          <span className="bg-[#00FF66] text-black font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-[0_0_12px_rgba(0,255,102,0.4)] tracking-wide">
                            🏬 Recojo en Tienda
                          </span>
                        ) : (
                          <span className="bg-orange-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-[0_0_12px_rgba(234,88,12,0.5)] tracking-wide">
                            🛵 Envío a Domicilio
                          </span>
                        )}
                      </div>

                      {/* Dirección en caso de domicilio */}
                      {!isPickup && order.address && (
                        <p className="text-xs text-zinc-400 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                          📍 <span className="font-medium">{order.address}</span>
                        </p>
                      )}

                      {/* Lista de productos comprados */}
                      <div className="border-t border-zinc-800/80 pt-3 space-y-1.5">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase">
                          Productos:
                        </p>
                        <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                          {order.items?.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-xs text-zinc-300"
                            >
                              <span className="truncate pr-2">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-bold text-zinc-400 shrink-0">
                                S/ {Number(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pie de Pedido y Cambio de Estado */}
                    <div className="border-t border-zinc-800 pt-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400">Total:</span>
                        <span className="text-lg font-black text-red-500">
                          S/ {Number(order.total || 0).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleOrderStatus(order.id, order.status || "pendiente")}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                          isDelivered
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
                        }`}
                      >
                        {isDelivered ? "✅ Marcar como Pendiente" : "⏳ Marcar como Entregado"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}