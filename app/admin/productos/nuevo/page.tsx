"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"inventario" | "pedidos" | "marketing" | "caja" | "clientes" | "proveedores">("inventario");
  const [orderStatusTab, setOrderStatusTab] = useState<"PENDIENTE" | "ENTREGADO" | "RECHAZADO" | "NO_RECOGIDO">("PENDIENTE");

  // Estado para contraer/expandir el Sidebar lateral (solo en PC)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Subfiltros independientes por cada pestaña de estado logístico
  const [filtersByStatus, setFiltersByStatus] = useState({
    PENDIENTE: { type: "TODOS", startDate: "", endDate: "" },
    ENTREGADO: { type: "TODOS", startDate: "", endDate: "" },
    RECHAZADO: { type: "TODOS", startDate: "", endDate: "" },
    NO_RECOGIDO: { type: "TODOS", startDate: "", endDate: "" }
  });

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
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

  // Estados para Módulo de Compras (Facturas detalladas con múltiples ítems)
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceSupplier, setInvoiceSupplier] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<
    { name: string; quantity: number; unitCost: number; packageCost: number }[]
  >([
    { name: "", quantity: 1, unitCost: 0, packageCost: 0 }
  ]);

  // 🕒 HORA EXACTA DE LIMA, PERÚ
  const getLimaDateStr = () => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Lima",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      };
      const formatter = new Intl.DateTimeFormat("en-CA", options);
      return formatter.format(new Date());
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  };

  const todayDateStr = getLimaDateStr();

  const fallbackOrders = [
    { id: "fallback-1", client: "Pamela Gómez", phone: "9878554", address: "Calle 48 #120", type: "DELIVERY", items: "2x Sopa Maruchan, 1x Coca Cola 1.5L", total: 21.80, status: "PENDIENTE", date: todayDateStr },
    { id: "fallback-2", client: "Carlos Ruiz", phone: "9123456", address: "Av. Los Álamos 402", type: "RECOJO", items: "1x Aceite Primor 1L, 3x Arroz Costeño", total: 24.50, status: "PENDIENTE", date: todayDateStr }
  ];

  const [promos, setPromos] = useState([
    { id: 1, title: "¡Super Despensa -15%!", description: "Válido en todos los aceites y abarrotes seleccionados.", discount: "15% OFF", active: true },
    { id: 2, title: "Delivery Gratis en Zona Norte", description: "Por compras mayores a S/ 30.00 en toda la app.", discount: "ENVÍO S/0", active: true }
  ]);

  const [newPromoTitle, setNewPromoTitle] = useState("");
  const [newPromoDesc, setNewPromoDesc] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState("");

  // 🚀 ESCUCHA EN TIEMPO REAL (REAL-TIME SNAPSHOT)
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const prodList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prodList);
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar productos:", error);
      setLoading(false);
    });

    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (ordList.length > 0) {
        setOrders([...ordList]);
      } else {
        setOrders(fallbackOrders);
      }
    }, (error) => {
      console.error("Error al escuchar pedidos:", error);
      setOrders(fallbackOrders);
    });

    const unsubscribeSuppliers = onSnapshot(collection(db, "suppliers"), (snapshot) => {
      const supList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuppliers(supList);
    }, (error) => {
      console.error("Error al escuchar proveedores:", error);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeSuppliers();
    };
  }, []);

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
    if (file) compressImage(file, (base64) => setNewImage(base64));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (base64) => {
        setEditForm(prev => ({ ...prev, image: base64 }));
      });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        name: newName,
        price: parseFloat(newPrice) || 0,
        stock: parseInt(newStock) || 0,
        category: newCategory,
        isOnSale: newIsOnSale,
        isFeatured: newIsFeatured,
        image: newImage || ""
      });
      setNewName(""); setNewPrice(""); setNewStock(""); setNewCategory("Abarrotes y Despensa");
      setNewIsOnSale(false); setNewIsFeatured(false); setNewImage("");
      alert("¡Producto publicado con éxito!");
    } catch (error: any) {
      alert(`Error al publicar: ${error.message}`);
    }
  };

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
      alert(`Error al actualizar stock: ${error.message}`);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}" del inventario?`)) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (error: any) {
      alert(`Error al eliminar: ${error.message}`);
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
    setProducts(prev => prev.map(p => p.id === stringId ? { ...p, ...finalData } : p));
    try {
      const productRef = doc(db, "products", stringId);
      await updateDoc(productRef, finalData);
      setEditingProduct(null);
    } catch (error: any) {
      alert(`Error al editar: ${error.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: any, newStatus: string) => {
    const stringOrderId = String(orderId).trim();
    setOrders(prev => prev.map(o => String(o.id).trim() === stringOrderId ? { ...o, status: newStatus } : o));
    
    if (stringOrderId.startsWith("fallback-")) {
      try {
        const targetOrder = orders.find(o => String(o.id).trim() === stringOrderId);
        if (targetOrder) {
          await addDoc(collection(db, "orders"), {
            client: targetOrder.client,
            phone: targetOrder.phone,
            address: targetOrder.address,
            type: targetOrder.type,
            items: targetOrder.items,
            total: targetOrder.total,
            status: newStatus,
            date: targetOrder.date
          });
        }
      } catch (err) {
        console.error("Error al registrar orden en Firebase:", err);
      }
      return;
    }

    try {
      const orderRef = doc(db, "orders", stringOrderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error: any) {
      console.error("Error al actualizar estado en Firebase:", error);
    }
  };

  const handleAddInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { name: "", quantity: 1, unitCost: 0, packageCost: 0 }]);
  };

  const handleInvoiceItemChange = (index: number, field: string, value: any) => {
    const updated = [...invoiceItems];
    (updated[index] as any)[field] = value;
    setInvoiceItems(updated);
  };

  const handleRemoveInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber || !invoiceSupplier || invoiceItems.length === 0) {
      alert("Por favor completa el número de factura, proveedor y al menos un producto.");
      return;
    }

    const totalInvoiceCost = invoiceItems.reduce((sum, item) => {
      const subtotal = Number(item.packageCost) > 0 ? Number(item.packageCost) : (Number(item.quantity) * Number(item.unitCost));
      return sum + subtotal;
    }, 0);

    try {
      await addDoc(collection(db, "suppliers"), {
        invoiceNumber,
        supplier: invoiceSupplier,
        items: invoiceItems,
        totalCost: totalInvoiceCost,
        date: todayDateStr,
        createdAt: new Date()
      });

      setInvoiceNumber("");
      setInvoiceSupplier("");
      setInvoiceItems([{ name: "", quantity: 1, unitCost: 0, packageCost: 0 }]);
      alert("¡Factura de compra registrada con éxito!");
    } catch (error: any) {
      alert(`Error al registrar factura: ${error.message}`);
    }
  };

  const currentSubFilter = filtersByStatus[orderStatusTab];

  const updateSubFilter = (field: "type" | "startDate" | "endDate", value: string) => {
    setFiltersByStatus(prev => ({
      ...prev,
      [orderStatusTab]: {
        ...prev[orderStatusTab],
        [field]: value
      }
    }));
  };

  const filteredOrders = orders.filter(o => {
    if (o.status !== orderStatusTab) return false;
    if (currentSubFilter.type !== "TODOS" && o.type !== currentSubFilter.type) return false;
    if (currentSubFilter.startDate && o.date < currentSubFilter.startDate) return false;
    if (currentSubFilter.endDate && o.date > currentSubFilter.endDate) return false;
    return true;
  });

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalSales = orders.filter(o => o.status === "ENTREGADO").reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingCount = orders.filter(o => o.status === "PENDIENTE").length;
  const deliveredCount = orders.filter(o => o.status === "ENTREGADO").length;
  const rejectedCount = orders.filter(o => o.status === "RECHAZADO").length;
  const uncollectedCount = orders.filter(o => o.status === "NO_RECOGIDO").length;

  const todaySalesOrders = orders.filter(o => o.status === "ENTREGADO" && o.date === todayDateStr);
  const todaySalesTotal = todaySalesOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const todayTicketAverage = todaySalesOrders.length > 0 ? (todaySalesTotal / todaySalesOrders.length) : 0;

  const clientsMap = new Map();
  orders.forEach(o => {
    if (o.client) {
      const phone = o.phone || "Sin teléfono";
      if (!clientsMap.has(phone)) {
        clientsMap.set(phone, {
          name: o.client,
          phone: phone,
          address: o.address || "No especificada",
          totalOrders: 1,
          spent: Number(o.total) || 0
        });
      } else {
        const clientData = clientsMap.get(phone);
        clientData.totalOrders += 1;
        clientData.spent += Number(o.total) || 0;
      }
    }
  });
  const clientsList = Array.from(clientsMap.values());

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex font-sans selection:bg-red-600 selection:text-white">
      
      {/* 🎨 SIDEBAR RETRÁCTIL (PC) */}
      <aside 
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        className={`transition-all duration-300 ease-in-out bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between hidden md:flex shrink-0 z-40 select-none cursor-pointer ${
          isSidebarExpanded ? "w-64 shadow-2xl" : "w-20"
        }`}
      >
        <div className="p-4 space-y-6 overflow-hidden">
          <div className="flex items-center gap-3 px-2 py-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            {isSidebarExpanded && (
              <div className="whitespace-nowrap transition-opacity duration-300">
                <h2 className="text-xs font-black tracking-tight text-white">Minimarket Pamela</h2>
                <p className="text-[9px] text-zinc-400">Navegación Rápida</p>
              </div>
            )}
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("inventario"); setIsSidebarExpanded(false); }}
              title="Inventario & Stock"
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === "inventario" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="text-base shrink-0">📦</span>
              {isSidebarExpanded && <span className="whitespace-nowrap">Inventario & Stock</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("pedidos"); setIsSidebarExpanded(false); }}
              title="Centro Logístico"
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === "pedidos" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-4">
                <span className="text-base shrink-0">🛒</span>
                {isSidebarExpanded && <span className="whitespace-nowrap">Centro Logístico</span>}
              </span>
              {pendingCount > 0 && <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0">{pendingCount}</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("caja"); setIsSidebarExpanded(false); }}
              title="Caja & Reportes"
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === "caja" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="text-base shrink-0">📊</span>
              {isSidebarExpanded && <span className="whitespace-nowrap">Caja & Reportes</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("clientes"); setIsSidebarExpanded(false); }}
              title="Clientes CRM"
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === "clientes" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-4">
                <span className="text-base shrink-0">👥</span>
                {isSidebarExpanded && <span className="whitespace-nowrap">Clientes CRM</span>}
              </span>
              {isSidebarExpanded && <span className="text-[10px] text-zinc-500 shrink-0">({clientsList.length})</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("proveedores"); setIsSidebarExpanded(false); }}
              title="Facturas Compras"
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === "proveedores" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-4">
                <span className="text-base shrink-0">🧾</span>
                {isSidebarExpanded && <span className="whitespace-nowrap">Facturas Compras</span>}
              </span>
              {isSidebarExpanded && <span className="text-[10px] text-zinc-500 shrink-0">({suppliers.length})</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("marketing"); setIsSidebarExpanded(false); }}
              title="Marketing & Promos"
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTab === "marketing" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="text-base shrink-0">🎯</span>
              {isSidebarExpanded && <span className="whitespace-nowrap">Marketing & Promos</span>}
            </button>
          </nav>
        </div>

        <div className="p-3 border-t border-zinc-900 m-3 bg-zinc-900/50 rounded-xl space-y-2">
          {isSidebarExpanded ? (
            <div className="space-y-2">
              <div className="text-[11px] text-zinc-400 truncate">Op: <strong className="text-white">ferxdtg@gmail.com</strong></div>
              <button onClick={(e) => { e.stopPropagation(); }} className="w-full bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 font-bold py-2 rounded-lg transition text-xs cursor-pointer">
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" title="Sesión Activa"></span>
            </div>
          )}
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 min-h-screen p-3 sm:p-8 space-y-5 overflow-y-auto">
        
        {/* 🏢 ENCABEZADO OPTIMIZADO PARA MÓVIL Y ESCRITORIO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-900/75 backdrop-blur-md border border-zinc-800 p-3.5 sm:p-5 rounded-2xl shadow-xl">
          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tight text-white">Minimarket Pamela</h1>
            <p className="text-[11px] sm:text-xs font-semibold text-zinc-400">panel de administración</p>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-xl text-xs shadow-inner">
            <div className="flex items-center gap-2">
              {/* Indicador de operador que se enciende y apaga en verde */}
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
              <span className="text-zinc-300 font-medium truncate max-w-[140px] sm:max-w-none">ferxdtg@gmail.com</span>
            </div>
            <span className="text-[10px] bg-zinc-900 px-2.5 py-1 rounded-lg text-zinc-400 font-bold hidden sm:inline">Lima: {todayDateStr}</span>
          </div>
        </div>

        {/* PESTAÑAS MÓVILES (Celulares) */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
          <button onClick={() => setActiveTab("inventario")} className={`px-3 py-2 rounded-xl font-black text-xs shrink-0 ${activeTab === "inventario" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Stock</button>
          <button onClick={() => setActiveTab("pedidos")} className={`px-3 py-2 rounded-xl font-black text-xs shrink-0 ${activeTab === "pedidos" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Pedidos</button>
          <button onClick={() => setActiveTab("caja")} className={`px-3 py-2 rounded-xl font-black text-xs shrink-0 ${activeTab === "caja" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Caja</button>
          <button onClick={() => setActiveTab("clientes")} className={`px-3 py-2 rounded-xl font-black text-xs shrink-0 ${activeTab === "clientes" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Clientes</button>
          <button onClick={() => setActiveTab("proveedores")} className={`px-3 py-2 rounded-xl font-black text-xs shrink-0 ${activeTab === "proveedores" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Compras</button>
          <button onClick={() => setActiveTab("marketing")} className={`px-3 py-2 rounded-xl font-black text-xs shrink-0 ${activeTab === "marketing" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Promos</button>
        </div>

        {/* VISTA 1: INVENTARIO */}
        {activeTab === "inventario" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl h-fit space-y-4">
              <h2 className="text-sm font-black text-white flex items-center gap-2">✨ Registrar Nuevo Producto</h2>
              
              <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Nombre del artículo</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ej. Aceite Primor 1L"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-600 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Precio (S/)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-600 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Stock Inicial</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={e => setNewStock(e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-600 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Categoría de Tienda</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-600 transition"
                  >
                    <option>Abarrotes y Despensa</option>
                    <option>Snacks</option>
                    <option>Bebidas y Lácteos</option>
                    <option>Limpieza y Hogar</option>
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
                    En Oferta 🔥
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input
                      type="checkbox"
                      checked={newIsFeatured}
                      onChange={e => setNewIsFeatured(e.target.checked)}
                      className="accent-red-600 w-4 h-4 cursor-pointer"
                    />
                    Destacado ⭐
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-400 font-bold uppercase text-[10px]">Fotografía del Producto</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-3 rounded-xl font-bold text-zinc-300 flex items-center justify-center gap-2 transition cursor-pointer text-center">
                      📁 Subir Archivo
                      <input type="file" accept="image/*" onChange={handleNewFileChange} className="hidden" />
                    </label>
                    <label className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-3 rounded-xl font-bold text-zinc-300 flex items-center justify-center gap-2 transition cursor-pointer text-center">
                      📷 Usar Cámara
                      <input type="file" accept="image/*" capture="environment" onChange={handleNewFileChange} className="hidden" />
                    </label>
                  </div>
                  {newImage && <p className="text-[10px] text-emerald-400 font-bold pt-1">✓ Imagen capturada y optimizada</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition shadow-lg shadow-red-900/30 cursor-pointer mt-2"
                >
                  Publicar en Catálogo Web
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900/70 backdrop-blur border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
                <h2 className="text-sm font-black text-white">Inventario Activo ({filteredProducts.length})</h2>
                
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">🔍</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {loading ? (
                <p className="text-zinc-500 text-center py-12">Sincronizando inventario...</p>
              ) : (
                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {filteredProducts.map(product => {
                    const currentStock = Number(product.stock ?? 0);
                    const isOut = currentStock === 0;
                    const isLow = currentStock > 0 && currentStock <= 5;

                    return (
                      <div key={product.id} className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-zinc-700 transition">
                        <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl overflow-hidden shrink-0 border border-zinc-800">
                            {product.image ? (
                              <Image src={product.image} alt={product.name} fill className="object-contain p-1" />
                            ) : (
                              <span className="text-[9px] text-zinc-400 flex items-center justify-center h-full">N/A</span>
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5 flex-1">
                            <h3 className="text-xs font-bold text-white truncate">{product.name}</h3>
                            <p className="text-[11px] text-red-400 font-black">S/ {(Number(product.price) ?? 0).toFixed(2)}</p>
                            <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase font-bold">{product.category || "Abarrotes"}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900">
                          <div>
                            {isOut ? (
                              <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">🔴 Agotado</span>
                            ) : isLow ? (
                              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">🟡 Bajo</span>
                            ) : (
                              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">🟢 OK ({currentStock})</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                              <button
                                type="button"
                                onClick={() => handleStockUpdate(product.id, currentStock, -1)}
                                className="w-6 h-6 sm:w-7 sm:h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center cursor-pointer text-xs transition"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-black text-xs">{currentStock}</span>
                              <button
                                type="button"
                                onClick={() => handleStockUpdate(product.id, currentStock, 1)}
                                className="w-6 h-6 sm:w-7 sm:h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center cursor-pointer text-xs transition"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl font-bold text-xs transition cursor-pointer"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded-xl font-bold text-xs transition cursor-pointer"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VISTA 2: CENTRO LOGÍSTICO Y DASHBOARD */}
        {activeTab === "pedidos" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-1.5 shadow-xl">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">Ventas Totales</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">S/ {totalSales.toFixed(2)}</div>
                <p className="text-[10px] text-zinc-500">{deliveredCount} pedidos entregados</p>
              </div>

              <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-1.5 shadow-xl">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">Pendientes</span>
                <div className="text-xl sm:text-2xl font-black text-amber-400">{pendingCount}</div>
                <p className="text-[10px] text-zinc-500">Atención inmediata</p>
              </div>

              <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-1.5 shadow-xl">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">Inventario</span>
                <div className="text-xl sm:text-2xl font-black text-blue-400">{products.length}</div>
                <p className="text-[10px] text-zinc-500">Artículos activos</p>
              </div>

              <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-1.5 shadow-xl">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">Rechazados / Otros</span>
                <div className="text-xl sm:text-2xl font-black text-red-400">{rejectedCount + uncollectedCount}</div>
                <p className="text-[10px] text-zinc-500">Cancelados o devueltos</p>
              </div>
            </div>

            <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
              <div>
                <h2 className="text-sm font-black text-white">Centro Logístico en Tiempo Real (Live Feed)</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Gestión de órdenes con hora de Lima, Perú.</p>
              </div>

              {/* Pestañas principales de estado */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                <button 
                  onClick={() => setOrderStatusTab("PENDIENTE")}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${orderStatusTab === "PENDIENTE" ? "bg-amber-600 text-white shadow-lg" : "bg-zinc-950 text-zinc-400 border border-zinc-800"}`}
                >
                  ⏳ Pendientes ({pendingCount})
                </button>
                <button 
                  onClick={() => setOrderStatusTab("ENTREGADO")}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${orderStatusTab === "ENTREGADO" ? "bg-emerald-600 text-white shadow-lg" : "bg-zinc-950 text-zinc-400 border border-zinc-800"}`}
                >
                  ✓ Entregados ({deliveredCount})
                </button>
                <button 
                  onClick={() => setOrderStatusTab("RECHAZADO")}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${orderStatusTab === "RECHAZADO" ? "bg-red-600 text-white shadow-lg" : "bg-zinc-950 text-zinc-400 border border-zinc-800"}`}
                >
                  ✕ Rechazados ({rejectedCount})
                </button>
                <button 
                  onClick={() => setOrderStatusTab("NO_RECOGIDO")}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${orderStatusTab === "NO_RECOGIDO" ? "bg-purple-600 text-white shadow-lg" : "bg-zinc-950 text-zinc-400 border border-zinc-800"}`}
                >
                  🏪 No Recogidos ({uncollectedCount})
                </button>
              </div>

              {/* Subfiltros internos */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-zinc-950 border border-zinc-800/80 px-3 sm:px-4 py-3 rounded-xl text-xs">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <span className="text-zinc-400 font-bold shrink-0">Tipo:</span>
                  <div className="flex gap-1 shrink-0">
                    <button 
                      onClick={() => updateSubFilter("type", "TODOS")}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${currentSubFilter.type === "TODOS" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}
                    >
                      Todos
                    </button>
                    <button 
                      onClick={() => updateSubFilter("type", "DELIVERY")}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${currentSubFilter.type === "DELIVERY" ? "bg-blue-600 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}
                    >
                      🛵 Delivery
                    </button>
                    <button 
                      onClick={() => updateSubFilter("type", "RECOJO")}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${currentSubFilter.type === "RECOJO" ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}
                    >
                      🏪 Recojo
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
                  <span className="text-zinc-400 font-bold shrink-0">Fecha:</span>
                  <input 
                    type="date" 
                    value={currentSubFilter.startDate} 
                    onChange={e => updateSubFilter("startDate", e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none focus:border-red-600"
                  />
                  <span className="text-zinc-500">-</span>
                  <input 
                    type="date" 
                    value={currentSubFilter.endDate} 
                    onChange={e => updateSubFilter("endDate", e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none focus:border-red-600"
                  />
                  {(currentSubFilter.startDate || currentSubFilter.endDate) && (
                    <button 
                      onClick={() => { updateSubFilter("startDate", ""); updateSubFilter("endDate", ""); }}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded-lg font-bold transition cursor-pointer text-[10px]"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.length === 0 ? (
                <p className="text-zinc-500 text-center py-16 col-span-full">No hay pedidos registrados en {orderStatusTab.toLowerCase()} con estos filtros.</p>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          order.type === "DELIVERY" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        }`}>
                          {order.type === "DELIVERY" ? "🛵 Envío a Domicilio" : "🏪 Recojo en Local"}
                        </span>
                        <h3 className="text-sm font-black text-white">{order.client}</h3>
                        <p className="text-xs text-zinc-400">Tel: {order.phone} • {order.address}</p>
                        <p className="text-[10px] text-zinc-500 font-medium">Registrado: {order.date}</p>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        order.status === "PENDIENTE" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                        order.status === "ENTREGADO" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        order.status === "RECHAZADO" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        "bg-purple-500/20 text-purple-400 border-purple-500/30"
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-xl text-xs space-y-1.5">
                      <div className="text-zinc-400 font-semibold uppercase text-[10px]">Detalle de Compra:</div>
                      <div className="text-zinc-200">{order.items}</div>
                      <div className="flex justify-between font-black text-white pt-2 border-t border-zinc-800">
                        <span>TOTAL A PAGAR</span>
                        <span className="text-red-400 text-sm">S/ {(Number(order.total) || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      {order.status === "PENDIENTE" && (
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            type="button" 
                            onClick={() => handleUpdateOrderStatus(order.id, "ENTREGADO")}
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl transition cursor-pointer text-center"
                          >
                            ✓ Entregar
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleUpdateOrderStatus(order.id, "RECHAZADO")}
                            className="py-2.5 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 font-black text-[11px] rounded-xl transition cursor-pointer text-center"
                          >
                            ✕ Rechazar
                          </button>
                        </div>
                      )}

                      {order.status === "RECHAZADO" && (
                        <div className="w-full py-2.5 bg-red-950/30 text-red-400 font-bold text-xs rounded-xl text-center border border-red-900/30">
                          Pedido Rechazado / Cancelado
                        </div>
                      )}

                      {order.status === "NO_RECOGIDO" && (
                        <div className="w-full py-2.5 bg-purple-950/30 text-purple-400 font-bold text-xs rounded-xl text-center border border-purple-900/30">
                          No Recogido en Tienda (Stock Liberado)
                        </div>
                      )}

                      {order.status === "ENTREGADO" && (
                        <div className="w-full py-2.5 bg-zinc-950 text-emerald-400 font-bold text-xs rounded-xl text-center border border-emerald-900/30">
                          Completado y Entregado ✓
                        </div>
                      )}

                      {order.status === "PENDIENTE" && order.type === "RECOJO" && (
                        <button 
                          type="button" 
                          onClick={() => handleUpdateOrderStatus(order.id, "NO_RECOGIDO")}
                          className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-[10px] rounded-lg transition cursor-pointer text-center border border-zinc-800"
                        >
                          Marcar como No Recogido
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 📊 MÓDULO 1: CAJA & REPORTES DIARIOS */}
        {activeTab === "caja" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-5 space-y-2 shadow-xl">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ingresos del Día (Lima)</span>
                <div className="text-2xl font-black text-emerald-400">S/ {todaySalesTotal.toFixed(2)}</div>
                <p className="text-[11px] text-zinc-500">Fecha actual: {todayDateStr}</p>
              </div>

              <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-5 space-y-2 shadow-xl">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tickets Emitidos Hoy</span>
                <div className="text-2xl font-black text-blue-400">{todaySalesOrders.length}</div>
                <p className="text-[11px] text-zinc-500">Órdenes completadas y cobradas</p>
              </div>

              <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-5 space-y-2 shadow-xl">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ticket Promedio</span>
                <div className="text-2xl font-black text-amber-400">S/ {todayTicketAverage.toFixed(2)}</div>
                <p className="text-[11px] text-zinc-500">Valor medio por compra hoy</p>
              </div>
            </div>

            <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-black text-white">📋 Detalle de Facturación del Día</h2>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {todaySalesOrders.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-12">No hay ventas registradas para el día de hoy con hora de Lima.</p>
                ) : (
                  todaySalesOrders.map((o: any) => (
                    <div key={o.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white text-sm">{o.client} <span className="text-[10px] text-zinc-500 font-normal">({o.phone})</span></p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{o.items}</p>
                      </div>
                      <span className="text-emerald-400 font-black text-sm">S/ {(Number(o.total) || 0).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 👥 MÓDULO 3: BASE DE DATOS DE CLIENTES (CRM BÁSICO) */}
        {activeTab === "clientes" && (
          <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-black text-white">👥 Directorio de Clientes Frecuentes ({clientsList.length})</h2>
            <p className="text-xs text-zinc-400">Lista extraída automáticamente de las órdenes registradas en el minimarket.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientsList.map((client: any, idx: number) => (
                <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-black text-white">{client.name}</h3>
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">{client.totalOrders} compras</span>
                  </div>
                  <p className="text-xs text-zinc-400">📱 {client.phone}</p>
                  <p className="text-xs text-zinc-400 truncate">🏠 {client.address}</p>
                  <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs font-bold">
                    <span className="text-zinc-500">Total gastado:</span>
                    <span className="text-emerald-400">S/ {client.spent.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🧾 MÓDULO 4: REGISTRO DE COMPRAS (FACTURAS DETALLADAS - Opción A) */}
        {activeTab === "proveedores" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800/80 rounded-2xl p-6 shadow-xl h-fit space-y-4">
              <h2 className="text-sm font-black text-white flex items-center gap-2">🧾 Registrar Factura de Compra</h2>
              <p className="text-xs text-zinc-400">Agrega una factura con varios productos, especificando cantidad, costo unitario o costo por paquete.</p>

              <form onSubmit={handleSaveInvoice} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">N° de Factura / Guía</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    placeholder="Ej. F001-98234"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Proveedor / Distribuidora</label>
                  <input
                    type="text"
                    value={invoiceSupplier}
                    onChange={e => setInvoiceSupplier(e.target.value)}
                    placeholder="Ej. Distribuidora Gloria S.A."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-300 uppercase text-[10px]">Productos en la Factura</span>
                    <button
                      type="button"
                      onClick={handleAddInvoiceItem}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer"
                    >
                      + Agregar Producto
                    </button>
                  </div>

                  {invoiceItems.map((item, index) => (
                    <div key={index} className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-2.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleInvoiceItemChange(index, "name", e.target.value)}
                          placeholder="Nombre del producto"
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white"
                          required
                        />
                        {invoiceItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveInvoiceItem(index)}
                            className="bg-red-950 text-red-400 border border-red-900 px-2.5 rounded-lg font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => handleInvoiceItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Costo Unit. (S/)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={item.unitCost}
                            onChange={e => handleInvoiceItemChange(index, "unitCost", parseFloat(e.target.value) || 0)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Costo Paq. (S/)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={item.packageCost}
                            onChange={e => handleInvoiceItemChange(index, "packageCost", parseFloat(e.target.value) || 0)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition shadow-lg cursor-pointer mt-2"
                >
                  Guardar Factura en Firebase 🧾
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-black text-white">Historial de Facturas de Compra ({suppliers.length})</h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {suppliers.length === 0 ? (
                  <p className="text-zinc-500 text-center py-12 text-xs">No hay facturas registradas con proveedores todavía.</p>
                ) : (
                  suppliers.map(sup => (
                    <div key={sup.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3 text-xs">
                      <div className="flex justify-between items-start border-b border-zinc-800 pb-2">
                        <div>
                          <h3 className="font-black text-white text-sm">Factura N°: {sup.invoiceNumber}</h3>
                          <p className="text-zinc-400">Proveedor: <strong className="text-white">{sup.supplier}</strong></p>
                        </div>
                        <div className="text-right">
                          <span className="text-red-400 font-black text-sm">S/ {(Number(sup.totalCost) || 0).toFixed(2)}</span>
                          <p className="text-[10px] text-zinc-500">Fecha: {sup.date}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Detalle de Productos Facturados:</span>
                        <div className="space-y-1">
                          {sup.items?.map((it: any, i: number) => (
                            <div key={i} className="bg-zinc-900/60 p-2 rounded-lg flex justify-between items-center text-zinc-300">
                              <span>{it.quantity}x <strong className="text-white">{it.name}</strong></span>
                              <span className="text-[11px] text-zinc-400">
                                {Number(it.packageCost) > 0 ? `Paquete: S/ ${Number(it.packageCost).toFixed(2)}` : `Unit: S/ ${Number(it.unitCost).toFixed(2)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* VISTA 3: MARKETING & PROMOCIONES */}
        {activeTab === "marketing" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit space-y-4">
              <h2 className="text-sm font-black text-white">🎯 Crear Campaña Flash</h2>
              <p className="text-xs text-zinc-400">Publica un anuncio flotante o banner de descuento en la web principal.</p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newPromoTitle) return;
                setPromos([{ id: Date.now(), title: newPromoTitle, description: newPromoDesc || "Promoción especial", discount: newPromoDiscount || "OFERTA", active: true }, ...promos]);
                setNewPromoTitle(""); setNewPromoDesc(""); setNewPromoDiscount("");
                alert("¡Campaña publicada en la web!");
              }} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Título de Campaña</label>
                  <input
                    type="text"
                    value={newPromoTitle}
                    onChange={e => setNewPromoTitle(e.target.value)}
                    placeholder="Ej. ¡Mega Oferta de Lácteos!"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Descripción</label>
                  <input
                    type="text"
                    value={newPromoDesc}
                    onChange={e => setNewPromoDesc(e.target.value)}
                    placeholder="Ej. 20% en abarrotes seleccionados."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Etiqueta / Badge</label>
                  <input
                    type="text"
                    value={newPromoDiscount}
                    onChange={e => setNewPromoDiscount(e.target.value)}
                    placeholder="Ej. -20% OFF"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition shadow-lg shadow-red-900/30 cursor-pointer mt-2"
                >
                  Lanzar Anuncio en Vivo
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-black text-white">Banners y Campañas Activas ({promos.length})</h2>
              <div className="space-y-3">
                {promos.map(promo => (
                  <div key={promo.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-black">
                          {promo.discount}
                        </span>
                        <h3 className="text-xs font-bold text-white">{promo.title}</h3>
                      </div>
                      <p className="text-xs text-zinc-400">{promo.description}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        promo.active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}>
                        {promo.active ? "EN VIVO" : "PAUSADO"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, active: !p.active } : p))}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          promo.active ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                      >
                        {promo.active ? "Pausar" : "Activar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE EDICIÓN DE PRODUCTO */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-black">Modificar Producto</h3>
                <button type="button" onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Nombre</label>
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
                    <option>Bebidas y Lácteos</option>
                    <option>Limpieza y Hogar</option>
                    <option>Ofertas</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input type="checkbox" checked={editForm.isOnSale} onChange={e => setEditForm({ ...editForm, isOnSale: e.target.checked })} className="accent-red-600 w-4 h-4" /> Oferta 🔥
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
                    <input type="checkbox" checked={editForm.isFeatured} onChange={e => setEditForm({ ...editForm, isFeatured: e.target.checked })} className="accent-red-600 w-4 h-4" /> Destacado ⭐
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
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <label className="block bg-red-600 hover:bg-red-700 text-white text-center py-1.5 px-2 rounded-lg font-bold text-[10px] cursor-pointer transition">
                        📁 Subir
                        <input type="file" accept="image/*" onChange={handleEditFileChange} className="hidden" />
                      </label>
                      <label className="block bg-zinc-800 hover:bg-zinc-700 text-white text-center py-1.5 px-2 rounded-lg font-bold text-[10px] cursor-pointer transition">
                        📷 Cámara
                        <input type="file" accept="image/*" capture="environment" onChange={handleEditFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-zinc-800">
                  <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-2.5 rounded-xl bg-zinc-800 font-bold text-zinc-300 cursor-pointer">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-600 font-bold text-white cursor-pointer shadow-lg">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}