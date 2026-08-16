"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"inventario" | "pedidos" | "marketing" | "caja" | "clientes" | "proveedores" | "categorias">("inventario");
  const [orderStatusTab, setOrderStatusTab] = useState<"PENDIENTE" | "ENTREGADO" | "RECHAZADO" | "NO_RECOGIDO">("PENDIENTE");

  // Estado para contraer/expandir el Sidebar lateral
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
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para filtrar automáticamente solo los productos huérfanos con un clic
  const [filterOrphanOnly, setFilterOrphanOnly] = useState(false);

  // Estados para Agregar Nuevo Producto
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("Abarrotes y Despensa");
  const [newIsOnSale, setNewIsOnSale] = useState(false);
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [newImage, setNewImage] = useState("");

  // Estado para el modal de edición de productos
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

  // Estados declarados para Proveedores / Compras
  const [supName, setSupName] = useState("");
  const [supProduct, setSupProduct] = useState("");
  const [supCost, setSupCost] = useState("");

  // Estados declarados para Marketing & Promos
  const [newPromoTitle, setNewPromoTitle] = useState("");
  const [newPromoDesc, setNewPromoDesc] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState("");

  // Estados para Gestión, Edición y Eliminación de Categorías
  const [newCatName, setNewCatName] = useState("");
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCatName, setEditCatName] = useState("");

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

  // 🚀 INICIALIZACIÓN Y ESCUCHA EN TIEMPO REAL
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

    const unsubscribeCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const catList = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setCategoriesList(catList);
      if (catList.length > 0 && !catList.some((c: any) => c.name === newCategory)) {
        setNewCategory(catList[0].name);
      }
    }, (error) => {
      console.error("Error al escuchar categorías:", error);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeSuppliers();
      unsubscribeCategories();
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
      setNewName(""); setNewPrice(""); setNewStock(""); 
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
    const defaultCat = categoriesList.length > 0 ? categoriesList[0].name : "Abarrotes y Despensa";
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      category: product.category || defaultCat,
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
      alert("¡Producto actualizado correctamente!");
    } catch (error: any) {
      alert(`Error al editar: ${error.message}`);
    }
  };

  // 🏷️ GESTIÓN Y MODIFICACIÓN DE CATEGORÍAS
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await addDoc(collection(db, "categories"), { name: newCatName.trim() });
      setNewCatName("");
      alert("¡Categoría creada con éxito!");
    } catch (error: any) {
      alert(`Error al crear categoría: ${error.message}`);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName.trim()) return;
    const oldName = editingCategory.name;
    const newNameCat = editCatName.trim();

    try {
      if (editingCategory.id) {
        await updateDoc(doc(db, "categories", editingCategory.id), { name: newNameCat });
      }

      const affectedProducts = products.filter(p => p.category === oldName);
      for (const prod of affectedProducts) {
        await updateDoc(doc(db, "products", prod.id), { category: newNameCat });
      }

      setEditingCategory(null);
      setEditCatName("");
      alert(`¡Categoría "${oldName}" renombrada a "${newNameCat}" en todos los productos con éxito!`);
    } catch (error: any) {
      alert(`Error al actualizar categoría: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (categoriesList.length <= 1) {
      alert("Debes mantener al menos una categoría en el sistema.");
      return;
    }
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${catName}"? Los productos con esta categoría quedarán sin categoría asignada.`)) return;
    try {
      if (catId) {
        await deleteDoc(doc(db, "categories", catId));
        alert(`Categoría "${catName}" eliminada con éxito.`);
      }
    } catch (error: any) {
      alert(`Error al eliminar: ${error.message}`);
    }
  };

  // 📦 REGISTRAR PROVEEDOR / COMPRA
  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supProduct) return;
    try {
      await addDoc(collection(db, "suppliers"), {
        name: supName,
        product: supProduct,
        cost: parseFloat(supCost) || 0,
        date: todayDateStr
      });
      setSupName(""); setSupProduct(""); setSupCost("");
      alert("¡Compra y proveedor registrados con éxito!");
    } catch (error: any) {
      alert(`Error al registrar: ${error.message}`);
    }
  };

  // Pedidos
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

  const currentSubFilter = filtersByStatus[orderStatusTab] || { type: "TODOS", startDate: "", endDate: "" };

  const updateSubFilter = (field: "type" | "startDate" | "endDate", value: string) => {
    setFiltersByStatus(prev => ({
      ...prev,
      [orderStatusTab]: {
        ...(prev as any)[orderStatusTab],
        [field]: value
      }
    }));
  };

  const filteredOrders = orders?.filter(o => {
    if (o.status !== orderStatusTab) return false;
    if (currentSubFilter.type !== "TODOS" && o.type !== currentSubFilter.type) return false;
    if (currentSubFilter.startDate && o.date < currentSubFilter.startDate) return false;
    if (currentSubFilter.endDate && o.date > currentSubFilter.endDate) return false;
    return true;
  }) || [];

  const allCategoryNames = categoriesList?.map((c: any) => String(c.name || "").trim().toLowerCase()) || [];

  const orphanProducts = categoriesList.length > 0 ? products.filter(p => {
    const cat = String(p.category || "").trim().toLowerCase();
    return cat !== "" && !allCategoryNames.includes(cat);
  }) : [];

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterOrphanOnly) {
      const cat = String(p.category || "").trim().toLowerCase();
      return cat !== "" && !allCategoryNames.includes(cat);
    }
    return true;
  }) || [];

  const totalSales = orders?.filter(o => o.status === "ENTREGADO").reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;
  const pendingCount = orders?.filter(o => o.status === "PENDIENTE").length || 0;
  const deliveredCount = orders?.filter(o => o.status === "ENTREGADO").length || 0;
  const rejectedCount = orders?.filter(o => o.status === "RECHAZADO").length || 0;
  const uncollectedCount = orders?.filter(o => o.status === "NO_RECOGIDO").length || 0;

  const todaySalesOrders = orders?.filter(o => o.status === "ENTREGADO" && o.date === todayDateStr) || [];
  const todaySalesTotal = todaySalesOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const todayTicketAverage = todaySalesOrders.length > 0 ? (todaySalesTotal / todaySalesOrders.length) : 0;

  const clientsMap = new Map();
  orders?.forEach(o => {
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

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de cerrar sesión del panel de administración?")) {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex font-sans selection:bg-red-600 selection:text-white text-xs">
      
      {/* 🎨 SIDEBAR RETRÁCTIL (PC) */}
      <aside 
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        className={`transition-all duration-300 ease-in-out bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between hidden md:flex shrink-0 z-40 select-none cursor-pointer ${
          isSidebarExpanded ? "w-56 shadow-2xl" : "w-16"
        }`}
      >
        <div className="p-3 space-y-4 overflow-hidden">
          <div className="flex items-center gap-2.5 px-1 py-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            {isSidebarExpanded && (
              <div className="whitespace-nowrap transition-opacity duration-300">
                <h2 className="text-xs font-black tracking-tight text-white">Minimarket Pamela</h2>
                <p className="text-[9px] text-zinc-400">Navegación Rápida</p>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("inventario"); setFilterOrphanOnly(false); setIsSidebarExpanded(false); }}
              title="Inventario & Stock"
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "inventario" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="text-sm shrink-0">📦</span>
              {isSidebarExpanded && <span className="whitespace-nowrap">Inventario & Stock</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("pedidos"); setIsSidebarExpanded(false); }}
              title="Centro Logístico"
              className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "pedidos" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm shrink-0">🛒</span>
                {isSidebarExpanded && <span className="whitespace-nowrap">Centro Logístico</span>}
              </span>
              {pendingCount > 0 && <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded-full text-[9px] font-black shrink-0">{pendingCount}</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("categorias"); setIsSidebarExpanded(false); }}
              title="Gestión de Categorías"
              className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "categorias" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm shrink-0">🏷️</span>
                {isSidebarExpanded && <span className="whitespace-nowrap">Categorías</span>}
              </span>
              {isSidebarExpanded && <span className="text-[9px] text-zinc-500 shrink-0">({categoriesList.length})</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("caja"); setIsSidebarExpanded(false); }}
              title="Caja & Reportes"
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "caja" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="text-sm shrink-0">📊</span>
              {isSidebarExpanded && <span className="whitespace-nowrap">Caja & Reportes</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("clientes"); setIsSidebarExpanded(false); }}
              title="Clientes CRM"
              className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "clientes" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm shrink-0">👥</span>
                {isSidebarExpanded && <span className="whitespace-nowrap">Clientes CRM</span>}
              </span>
              {isSidebarExpanded && <span className="text-[9px] text-zinc-500 shrink-0">({clientsList.length})</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("proveedores"); setIsSidebarExpanded(false); }}
              title="Facturas Compras"
              className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "proveedores" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm shrink-0">🧾</span>
                {isSidebarExpanded && <span className="whitespace-nowrap">Facturas Compras</span>}
              </span>
              {isSidebarExpanded && <span className="text-[9px] text-zinc-500 shrink-0">({suppliers.length})</span>}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("marketing"); setIsSidebarExpanded(false); }}
              title="Marketing & Promos"
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "marketing" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="text-sm shrink-0">🎯</span>
              {isSidebarExpanded && <span className="whitespace-nowrap">Marketing & Promos</span>}
            </button>
          </nav>
        </div>

        <div className="p-2.5 border-t border-zinc-900 m-2 bg-zinc-900/40 rounded-lg">
          {isSidebarExpanded ? (
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-400 truncate block">ferxdtg@gmail.com</span>
              <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="w-full bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 font-bold py-1.5 rounded transition text-[10px] cursor-pointer">
                Salir
              </button>
            </div>
          ) : (
            <div className="flex justify-center py-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" title="Sesión Activa"></span>
            </div>
          )}
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 min-h-screen p-3 sm:p-6 space-y-4 overflow-y-auto">
        
        {/* 🏢 ENCABEZADO FIJO PRINCIPAL CON ALARMA ROJA PARPADEANTE CLICKEABLE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-3 sm:p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm sm:text-lg font-black tracking-tight text-white leading-tight">Minimarket Pamela</h1>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400">panel de administración</p>
            </div>

            {/* 🚨 ALARMA ROJA PARPADEANTE CLICKEABLE */}
            {orphanProducts.length > 0 && (
              <div 
                onClick={() => { setActiveTab("inventario"); setFilterOrphanOnly(true); }}
                title="Haz clic para ubicar los productos huérfanos en el inventario"
                className="relative group flex items-center cursor-pointer ml-2"
              >
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 justify-center items-center text-[9px] font-black text-white">!</span>
                </span>

                <div className="absolute left-0 sm:left-6 top-6 sm:top-auto z-50 hidden group-hover:block bg-zinc-950 text-amber-300 border border-amber-500/50 p-2.5 rounded-xl shadow-2xl w-64 text-[10px] font-bold leading-tight pointer-events-none">
                  Hay {orphanProducts.length} producto(s) cuya categoría fue eliminada. Edítalos en el inventario para asignarles una categoría activa.
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-xl shadow-inner">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
              <span className="text-zinc-300 font-medium truncate max-w-[130px] sm:max-w-none">ferxdtg@gmail.com</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer"
              title="Cerrar Sesión"
            >
              Salir
            </button>
          </div>
        </div>

        {/* PESTAÑAS MÓVILES (Celulares) */}
        <div className="flex md:hidden gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button onClick={() => { setActiveTab("inventario"); setFilterOrphanOnly(false); }} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "inventario" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Stock</button>
          <button onClick={() => setActiveTab("pedidos")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "pedidos" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Pedidos</button>
          <button onClick={() => setActiveTab("categorias")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "categorias" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Categorías</button>
          <button onClick={() => setActiveTab("caja")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "caja" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Caja</button>
          <button onClick={() => setActiveTab("clientes")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "clientes" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Clientes</button>
          <button onClick={() => setActiveTab("proveedores")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "proveedores" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Compras</button>
          <button onClick={() => setActiveTab("marketing")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "marketing" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Promos</button>
        </div>

        {/* VISTA 1: INVENTARIO */}
        {activeTab === "inventario" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 h-fit space-y-3">
              <h2 className="text-xs font-black text-white flex items-center gap-2">✨ Registrar Nuevo Producto</h2>
              
              <form onSubmit={handleCreateProduct} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Nombre del artículo</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ej. Aceite Primor 1L"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Precio (S/)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Stock Inicial</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={e => setNewStock(e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="block text-zinc-400 font-bold uppercase text-[9px]">Categoría de Tienda</label>
                    <button type="button" onClick={() => setActiveTab("categorias")} className="text-[9px] text-red-400 hover:underline">+ Gestionar Categorías</button>
                  </div>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  >
                    {categoriesList.map((cat, idx) => (
                      <option key={idx} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-1 font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                    <input type="checkbox" checked={newIsOnSale} onChange={e => setNewIsOnSale(e.target.checked)} className="accent-red-600 w-3.5 h-3.5" /> En Oferta 🔥
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                    <input type="checkbox" checked={newIsFeatured} onChange={e => setNewIsFeatured(e.target.checked)} className="accent-red-600 w-3.5 h-3.5" /> Destacado ⭐
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-zinc-400 font-bold uppercase text-[9px]">Fotografía</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-2 rounded-lg font-bold text-zinc-300 text-center cursor-pointer">
                      📁 Subir <input type="file" accept="image/*" onChange={handleNewFileChange} className="hidden" />
                    </label>
                    <label className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-2 rounded-lg font-bold text-zinc-300 text-center cursor-pointer">
                      📷 Cámara <input type="file" accept="image/*" capture="environment" onChange={handleNewFileChange} className="hidden" />
                    </label>
                  </div>
                  {newImage && <p className="text-[9px] text-emerald-400 font-bold">✓ Imagen lista</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black transition cursor-pointer mt-1"
                >
                  Publicar Producto
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-black text-white">Inventario Activo ({filteredProducts.length})</h2>
                  {filterOrphanOnly && (
                    <button 
                      onClick={() => setFilterOrphanOnly(false)} 
                      className="bg-red-950/80 border border-red-900 text-red-400 px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer"
                    >
                      ✕ Quitar filtro de atención
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setFilterOrphanOnly(false); }}
                  placeholder="Buscar..."
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-red-600 w-48"
                />
              </div>

              {loading ? (
                <p className="text-zinc-500 text-center py-8">Sincronizando inventario...</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredProducts.length === 0 ? (
                    <p className="text-zinc-500 text-center py-12 text-xs">No hay productos que coincidan con la vista.</p>
                  ) : (
                    filteredProducts.map(product => {
                      const currentStock = Number(product.stock ?? 0);
                      const isOut = currentStock === 0;
                      const isLow = currentStock > 0 && currentStock <= 5;
                      const prodCatTrimmed = String(product.category || "").trim().toLowerCase();
                      const hasValidCategory = allCategoryNames.includes(prodCatTrimmed);

                      return (
                        <div key={product.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-10 h-10 bg-white rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                              {product.image ? (
                                <Image src={product.image} alt={product.name} fill className="object-contain p-0.5" />
                              ) : (
                                <span className="text-[8px] text-zinc-400 flex items-center justify-center h-full">N/A</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-white truncate">{product.name}</h3>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] text-red-400 font-black">S/ {(Number(product.price) ?? 0).toFixed(2)}</p>
                                {hasValidCategory ? (
                                  <span className="text-[9px] text-zinc-500 truncate">({product.category})</span>
                                ) : (
                                  <span className="text-[9px] bg-red-950/60 text-red-400 border border-red-900/50 px-1.5 py-0.2 rounded font-bold">⚠️ Sin Categoría</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div>
                              {isOut ? (
                                <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[9px] font-bold">🔴 Agotado</span>
                              ) : isLow ? (
                                <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-bold">🟡 Bajo</span>
                              ) : (
                                <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold">🟢 OK</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                              <button
                                type="button"
                                onClick={() => handleStockUpdate(product.id, currentStock, -1)}
                                className="w-5 h-5 bg-zinc-800 text-white rounded font-bold flex items-center justify-center text-xs"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-black">{currentStock}</span>
                              <button
                                type="button"
                                onClick={() => handleStockUpdate(product.id, currentStock, 1)}
                                className="w-5 h-5 bg-zinc-800 text-white rounded font-bold flex items-center justify-center text-xs"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs"
                              title="Editar"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="px-2 py-1 bg-red-950 border border-red-900 rounded-lg text-xs"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VISTA 2: CENTRO LOGÍSTICO Y DASHBOARD */}
        {activeTab === "pedidos" && (
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Ventas Totales</span>
                <div className="text-base font-black text-emerald-400">S/ {totalSales.toFixed(2)}</div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Pendientes</span>
                <div className="text-base font-black text-amber-400">{pendingCount}</div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Inventario</span>
                <div className="text-base font-black text-blue-400">{products.length}</div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase">Rechazados / Otros</span>
                <div className="text-base font-black text-red-400">{rejectedCount + uncollectedCount}</div>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl space-y-2.5">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button 
                  onClick={() => setOrderStatusTab("PENDIENTE")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 ${orderStatusTab === "PENDIENTE" ? "bg-amber-600 text-white" : "bg-zinc-950 text-zinc-400 border border-zinc-800"}`}
                >
                  ⏳ Pendientes ({pendingCount})
                </button>
                <button 
                  onClick={() => setOrderStatusTab("ENTREGADO")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 ${orderStatusTab === "ENTREGADO" ? "bg-emerald-600 text-white" : "bg-zinc-950 text-zinc-400 border border-zinc-800"}`}
                >
                  ✓ Entregados ({deliveredCount})
                </button>
                <button 
                  onClick={() => setOrderStatusTab("RECHAZADO")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 ${orderStatusTab === "RECHAZADO" ? "bg-red-600 text-white" : "bg-zinc-950 text-zinc-400 border border-zinc-800"}`}
                >
                  ✕ Rechazados ({rejectedCount})
                </button>
                <button 
                  onClick={() => setOrderStatusTab("NO_RECOGIDO")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 ${orderStatusTab === "NO_RECOGIDO" ? "bg-purple-600 text-white" : "bg-zinc-950 text-zinc-400 border border-zinc-800"}`}
                >
                  🏪 No Recogidos ({uncollectedCount})
                </button>
              </div>

              {/* Subfiltros internos */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 font-bold">Tipo:</span>
                  <button onClick={() => updateSubFilter("type", "TODOS")} className={`px-2 py-0.5 rounded ${currentSubFilter.type === "TODOS" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Todos</button>
                  <button onClick={() => updateSubFilter("type", "DELIVERY")} className={`px-2 py-0.5 rounded ${currentSubFilter.type === "DELIVERY" ? "bg-blue-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Delivery</button>
                  <button onClick={() => updateSubFilter("type", "RECOJO")} className={`px-2 py-0.5 rounded ${currentSubFilter.type === "RECOJO" ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Recojo</button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-zinc-400 font-bold">Fecha:</span>
                  <input type="date" value={currentSubFilter.startDate} onChange={e => updateSubFilter("startDate", e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-white text-[10px]" />
                  <span>-</span>
                  <input type="date" value={currentSubFilter.endDate} onChange={e => updateSubFilter("endDate", e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-white text-[10px]" />
                  {(currentSubFilter.startDate || currentSubFilter.endDate) && (
                    <button onClick={() => { updateSubFilter("startDate", ""); updateSubFilter("endDate", ""); }} className="bg-zinc-800 px-1.5 py-0.5 rounded text-[9px] font-bold">Limpiar</button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredOrders.length === 0 ? (
                <p className="text-zinc-500 text-center py-16 col-span-full">No hay pedidos registrados en {orderStatusTab.toLowerCase()} con estos filtros.</p>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${order.type === "DELIVERY" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                          {order.type}
                        </span>
                        <h3 className="text-xs font-black text-white mt-1">{order.client}</h3>
                        <p className="text-[10px] text-zinc-400">{order.phone} • {order.address}</p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-zinc-950 text-zinc-300">{order.status}</span>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg space-y-1">
                      <p className="text-zinc-300">{order.items}</p>
                      <div className="flex justify-between font-black text-white pt-1 border-t border-zinc-900">
                        <span>TOTAL</span>
                        <span className="text-red-400">S/ {(Number(order.total) || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {order.status === "PENDIENTE" && (
                        <div className="grid grid-cols-2 gap-1.5">
                          <button type="button" onClick={() => handleUpdateOrderStatus(order.id, "ENTREGADO")} className="py-1.5 bg-emerald-600 text-white font-bold text-[10px] rounded-lg">✓ Entregar</button>
                          <button type="button" onClick={() => handleUpdateOrderStatus(order.id, "RECHAZADO")} className="py-1.5 bg-red-950 text-red-400 border border-red-900 font-bold text-[10px] rounded-lg">✕ Rechazar</button>
                        </div>
                      )}
                      {order.status === "RECHAZADO" && <div className="py-1 bg-red-950/30 text-red-400 text-center font-bold text-[10px] rounded border border-red-900/30">Rechazado</div>}
                      {order.status === "NO_RECOGIDO" && <div className="py-1 bg-purple-950/30 text-purple-400 text-center font-bold text-[10px] rounded border border-purple-900/30">No Recogido</div>}
                      {order.status === "ENTREGADO" && <div className="py-1 bg-zinc-950 text-emerald-400 text-center font-bold text-[10px] rounded border border-emerald-900/30">Entregado ✓</div>}
                      {order.status === "PENDIENTE" && order.type === "RECOJO" && (
                        <button type="button" onClick={() => handleUpdateOrderStatus(order.id, "NO_RECOGIDO")} className="w-full py-1 bg-zinc-950 text-zinc-400 border border-zinc-800 font-bold text-[9px] rounded">Marcar No Recogido</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VISTA 3: GESTIÓN DE CATEGORÍAS */}
        {activeTab === "categorias" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
              <div>
                <h2 className="text-xs font-black text-white">🏷️ Gestión y Modificación de Categorías</h2>
                <p className="text-[10px] text-zinc-400">Añade, edita o elimina cualquier categoría de la tienda con total libertad.</p>
              </div>
              <button
                onClick={() => { setActiveTab("inventario"); setFilterOrphanOnly(false); }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
              >
                ← Volver a Inventario & Stock
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3 h-fit">
                <h3 className="text-xs font-black text-white">✨ Crear Nueva Categoría</h3>
                <form onSubmit={handleAddCategory} className="space-y-3">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Nombre</label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="Ej. Bebidas Energizantes, Lácteos Premium"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-red-600 text-white font-black rounded-lg cursor-pointer">Registrar Categoría</button>
                </form>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-black text-white">Listado General ({categoriesList.length})</h3>
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {categoriesList.map((catObj) => (
                    <div key={catObj.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 flex justify-between items-center">
                      <span className="font-bold text-white text-xs">{catObj.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingCategory(catObj); setEditCatName(catObj.name); }}
                          className="text-[10px] text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded cursor-pointer hover:bg-zinc-800"
                        >
                          ✏️ Modificar
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(catObj.id, catObj.name)}
                          className="text-[10px] text-red-400 bg-red-950/40 border border-red-900/50 px-2.5 py-1 rounded cursor-pointer hover:bg-red-900/60"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 4: CAJA & REPORTES */}
        {activeTab === "caja" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Ingresos Hoy (Lima)</span>
                <div className="text-lg font-black text-emerald-400">S/ {todaySalesTotal.toFixed(2)}</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Tickets Emitidos</span>
                <div className="text-lg font-black text-blue-400">{todaySalesOrders.length}</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Ticket Promedio</span>
                <div className="text-lg font-black text-amber-400">S/ {todayTicketAverage.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-black text-white">📋 Detalle de Facturación ({todayDateStr})</h2>
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {todaySalesOrders.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No hay ventas registradas hoy.</p>
                ) : (
                  todaySalesOrders.map((o: any) => (
                    <div key={o.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{o.client} <span className="text-[9px] text-zinc-500">({o.phone})</span></p>
                        <p className="text-[10px] text-zinc-400">{o.items}</p>
                      </div>
                      <span className="text-emerald-400 font-black">S/ {Number(o.total || 0).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VISTA 5: CLIENTES CRM */}
        {activeTab === "clientes" && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-black text-white">👥 Clientes Frecuentes ({clientsList.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {clientsList.map((c: any, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white">{c.name}</h3>
                    <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[9px] font-bold">{c.totalOrders} compras</span>
                  </div>
                  <p className="text-zinc-400">📱 {c.phone}</p>
                  <p className="text-zinc-400 truncate">🏠 {c.address}</p>
                  <p className="text-emerald-400 font-black pt-1 border-t border-zinc-900 flex justify-between">
                    <span>Total gastado:</span>
                    <span>S/ {c.spent.toFixed(2)}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 6: PROVEEDORES & COMPRAS */}
        {activeTab === "proveedores" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 h-fit space-y-3">
              <h2 className="text-xs font-black text-white">🧾 Registrar Reposición / Compra</h2>
              <form onSubmit={handleAddSupplier} className="space-y-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Nombre del Proveedor</label>
                  <input
                    type="text"
                    value={supName}
                    onChange={e => setSupName(e.target.value)}
                    placeholder="Ej. Distribuidora Lácteos Gloria"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Productos Suministrados</label>
                  <input
                    type="text"
                    value={supProduct}
                    onChange={e => setSupProduct(e.target.value)}
                    placeholder="Ej. 50x Leche Azul 400g"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Costo Total Factura (S/)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={supCost}
                    onChange={e => setSupCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-red-600 text-white font-black rounded-lg cursor-pointer">Guardar Compra</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-black text-white">Historial de Compras ({suppliers.length})</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {suppliers.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No hay compras registradas.</p>
                ) : (
                  suppliers.map(sup => (
                    <div key={sup.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-white">{sup.name}</h3>
                        <p className="text-zinc-400">{sup.product}</p>
                        <p className="text-[9px] text-zinc-500">Fecha: {sup.date}</p>
                      </div>
                      <span className="text-red-400 font-black">S/ {(Number(sup.cost) || 0).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VISTA 7: MARKETING */}
        {activeTab === "marketing" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit space-y-4">
              <h2 className="text-sm font-black text-white">🎯 Crear Campaña Flash</h2>
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
                <button type="submit" className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition cursor-pointer mt-2">
                  Lanzar Anuncio en Vivo
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-black text-white">Banners y Campañas Activas ({promos.length})</h2>
              <div className="space-y-3">
                {promos.map(promo => (
                  <div key={promo.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <span className="text-red-400 font-black text-[10px]">{promo.discount}</span>
                      <h3 className="font-bold text-white text-xs">{promo.title}</h3>
                      <p className="text-zinc-400 text-[10px]">{promo.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE EDICIÓN DE CATEGORÍA */}
        {editingCategory && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-sm space-y-3 text-xs text-white">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black">Modificar Categoría: "{editingCategory.name}"</h3>
                <button type="button" onClick={() => setEditingCategory(null)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Nuevo Nombre</label>
                  <input
                    type="text"
                    value={editCatName}
                    onChange={e => setEditCatName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
                <p className="text-[10px] text-amber-400">⚠️ Al renombrar esta categoría, se actualizarán automáticamente todos los productos que la tengan asignada.</p>
                <div className="flex gap-2 pt-2 border-t border-zinc-800">
                  <button type="button" onClick={() => setEditingCategory(null)} className="flex-1 py-2 rounded-lg bg-zinc-800 font-bold text-zinc-300 cursor-pointer">Cancelar</button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-red-600 font-bold text-white cursor-pointer shadow-lg">Actualizar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE EDICIÓN DE PRODUCTO */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-sm space-y-3 text-xs text-white">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black">Modificar Producto</h3>
                <button type="button" onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-2.5">
                <div>
                  <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Nombre</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Precio (S/)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={editForm.price}
                      onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Stock</label>
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={e => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Categoría</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-600"
                  >
                    {categoriesList.map((cat, idx) => (
                      <option key={idx} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-1 font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                    <input type="checkbox" checked={editForm.isOnSale} onChange={e => setEditForm({ ...editForm, isOnSale: e.target.checked })} className="accent-red-600 w-3.5 h-3.5" /> Oferta 🔥
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                    <input type="checkbox" checked={editForm.isFeatured} onChange={e => setEditForm({ ...editForm, isFeatured: e.target.checked })} className="accent-red-600 w-3.5 h-3.5" /> Destacado ⭐
                  </label>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase text-[9px]">Fotografía del Producto</label>
                  <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-2">
                    <div className="relative w-10 h-10 bg-zinc-900 rounded overflow-hidden shrink-0 border border-zinc-800">
                      {editForm.image ? (
                        <Image src={editForm.image} alt="Vista previa" fill className="object-contain p-0.5" />
                      ) : (
                        <span className="text-[8px] text-zinc-500 flex items-center justify-center h-full">N/A</span>
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-1.5">
                      <label className="block bg-red-600 hover:bg-red-700 text-white text-center py-1 px-1.5 rounded font-bold text-[9px] cursor-pointer">
                        📁 Subir
                        <input type="file" accept="image/*" onChange={handleEditFileChange} className="hidden" />
                      </label>
                      <label className="block bg-zinc-800 hover:bg-zinc-700 text-white text-center py-1 px-1.5 rounded font-bold text-[9px] cursor-pointer">
                        📷 Cámara
                        <input type="file" accept="image/*" capture="environment" onChange={handleEditFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-zinc-800">
                  <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-2 rounded-lg bg-zinc-800 font-bold text-zinc-300 cursor-pointer">Cancelar</button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-red-600 font-bold text-white cursor-pointer shadow-lg">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}