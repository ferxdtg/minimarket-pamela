"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"inventario" | "pedidos" | "marketing" | "caja" | "clientes" | "proveedores" | "categorias" | "vencimientos">("inventario");
  const [inventorySubTab, setInventorySubTab] = useState<"productos" | "vencimientos" | "categorias">("productos");
  
  // Estado para expandir el menú desplegable de Inventario & Stock en el Sidebar
  const [isInventoryDropdownOpen, setIsInventoryDropdownOpen] = useState(false);

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
  const [filterOrphanOnly, setFilterOrphanOnly] = useState(false);

  // Estados para Agregar Nuevo Producto
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("Abarrotes y Despensa");
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [newBatchCode, setNewBatchCode] = useState("");
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
    expiryDate: "",
    batchCode: "",
    sku: "",
    isOnSale: false,
    isFeatured: false,
    image: ""
  });

  // 🧾 ESTADOS DE FACTURACIÓN Y REPOSICIÓN PROFESIONAL
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceProvider, setInvoiceProvider] = useState("");
  const [invoiceRuc, setInvoiceRuc] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoicePaymentTerm, setInvoicePaymentTerm] = useState("CONTADO");
  const [invoiceItems, setInvoiceItems] = useState([
    { productName: "", unitType: "UNIDAD", quantity: 1, unitCost: 0, totalCost: 0 }
  ]);

  // Estados para Marketing & Promos
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

  // Generador de SKU aleatorio de 6 dígitos único (Inmutable / Como un DNI)
  const generateUniqueSku = (existingList: any[]) => {
    let randomSku = "";
    let exists = true;
    const currentSkus = existingList.map(p => String(p.sku || ""));

    while (exists) {
      randomSku = Math.floor(100000 + Math.random() * 900000).toString();
      if (!currentSkus.includes(randomSku)) {
        exists = false;
      }
    }
    return randomSku;
  };

  // 🚀 INICIALIZACIÓN Y ESCUCHA EN TIEMPO REAL (SKU PERMANENTE E INMUTABLE)
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, "products"), async (snapshot) => {
      let prodList: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      for (let prod of prodList) {
        if (!prod.sku || String(prod.sku).length !== 6) {
          const permanentSku = generateUniqueSku(prodList);
          prod.sku = permanentSku;
          try {
            await updateDoc(doc(db, "products", prod.id), { sku: permanentSku });
          } catch (err) {
            console.error("Error guardando SKU estático:", err);
          }
        }
      }

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
      const uniqueSku = generateUniqueSku(products);
      await addDoc(collection(db, "products"), {
        name: newName,
        sku: uniqueSku,
        price: parseFloat(newPrice) || 0,
        stock: parseInt(newStock) || 0,
        category: newCategory,
        expiryDate: newExpiryDate || "",
        batchCode: newBatchCode || "L-001",
        isOnSale: newIsOnSale,
        isFeatured: newIsFeatured,
        isNewRestock: false,
        image: newImage || ""
      });
      setNewName(""); setNewPrice(""); setNewStock(""); 
      setNewExpiryDate(""); setNewBatchCode("");
      setNewIsOnSale(false); setNewIsFeatured(false); setNewImage("");
      alert(`¡Producto publicado con éxito! Código SKU (DNI): ${uniqueSku}`);
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
      expiryDate: product.expiryDate || "",
      batchCode: product.batchCode || "",
      sku: product.sku || generateUniqueSku(products),
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
      expiryDate: editForm.expiryDate,
      batchCode: editForm.batchCode,
      sku: editingProduct.sku,
      isOnSale: editForm.isOnSale,
      isFeatured: editForm.isFeatured,
      isNewRestock: false,
      image: editForm.image || editingProduct.image || ""
    };
    setProducts(prev => prev.map(p => p.id === stringId ? { ...p, ...finalData } : p));
    try {
      const productRef = doc(db, "products", stringId);
      await updateDoc(productRef, finalData);
      setEditingProduct(null);
      alert("¡Producto actualizado correctamente manteniendo su SKU único!");
    } catch (error: any) {
      alert(`Error al editar: ${error.message}`);
    }
  };

  // 🏷️ GENERADOR DE ETIQUETA / CÓDIGO DE BARRAS EN PDF
  const handlePrintBarcode = (product: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes para generar la etiqueta.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Etiqueta - ${product.name}</title>
          <style>
            body { font-family: monospace; text-align: center; padding: 20px; }
            .label-box { border: 2px dashed #000; padding: 15px; display: inline-block; width: 250px; }
            h3 { margin: 5px 0; font-size: 16px; }
            p { margin: 5px 0; font-size: 14px; font-weight: bold; }
            .barcode { font-size: 28px; letter-spacing: 4px; margin: 10px 0; font-weight: bold; }
            .sku { font-size: 11px; color: #333; }
          </style>
        </head>
        <body>
          <div class="label-box">
            <h3>MINIMARKET PAMELA</h3>
            <p>${product.name}</p>
            <div class="barcode">||| | |||| || | ||</div>
            <p>S/ ${(Number(product.price) || 0).toFixed(2)}</p>
            <div class="sku">SKU: ${product.sku || 'N/A'} | Lote: ${product.batchCode || 'GEN'}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 🧾 GESTIÓN DE ÍTEMS EN FACTURA
  const handleAddInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { productName: "", unitType: "UNIDAD", quantity: 1, unitCost: 0, totalCost: 0 }]);
  };

  const handleInvoiceItemChange = (index: number, field: string, value: any) => {
    const updated = [...invoiceItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "quantity" || field === "unitCost") {
      const qty = Number(field === "quantity" ? value : updated[index].quantity) || 0;
      const cost = Number(field === "unitCost" ? value : updated[index].unitCost) || 0;
      updated[index].totalCost = Number((qty * cost).toFixed(2));
    }
    setInvoiceItems(updated);
  };

  const handleRemoveInvoiceItem = (index: number) => {
    if (invoiceItems.length === 1) return;
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const subTotalInvoice = invoiceItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const igvInvoice = Number((subTotalInvoice * 0.18).toFixed(2));
  const totalInvoiceAmount = Number((subTotalInvoice + igvInvoice).toFixed(2));

  // 🚀 GUARDAR FACTURA E IMPACTAR INVENTARIO
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber || !invoiceProvider) {
      alert("Por favor ingresa el N° de Factura y el Proveedor.");
      return;
    }

    try {
      await addDoc(collection(db, "suppliers"), {
        invoiceNumber,
        provider: invoiceProvider,
        ruc: invoiceRuc || "S/N",
        date: invoiceDate || todayDateStr,
        paymentTerm: invoicePaymentTerm,
        items: invoiceItems,
        subTotal: subTotalInvoice,
        igv: igvInvoice,
        totalCost: totalInvoiceAmount,
        registeredAt: todayDateStr
      });

      const defaultCategory = categoriesList.length > 0 ? categoriesList[0].name : "Abarrotes y Despensa";
      let currentProductsList = [...products];

      for (const item of invoiceItems) {
        const cleanName = String(item.productName || "").trim();
        if (!cleanName) continue;

        const existingProd = currentProductsList.find(p => p.name.trim().toLowerCase() === cleanName.toLowerCase());

        if (existingProd) {
          const newStockVal = Number(existingProd.stock || 0) + Number(item.quantity || 0);
          await updateDoc(doc(db, "products", existingProd.id), { stock: newStockVal, isNewRestock: true });
          existingProd.stock = newStockVal;
          existingProd.isNewRestock = true;
        } else {
          const uniqueSku = generateUniqueSku(currentProductsList);
          const newDocRef = await addDoc(collection(db, "products"), {
            name: cleanName,
            sku: uniqueSku,
            price: Number((item.unitCost * 1.3).toFixed(2)),
            stock: Number(item.quantity || 1),
            category: defaultCategory,
            expiryDate: "",
            batchCode: `L-${invoiceNumber}`,
            isOnSale: false,
            isFeatured: false,
            isNewRestock: true, // 🟢 Alerta verde visible en inventario
            image: ""
          });
          currentProductsList.push({
            id: newDocRef.id,
            name: cleanName,
            sku: uniqueSku,
            stock: Number(item.quantity || 1),
            category: defaultCategory,
            isNewRestock: true
          });
        }
      }

      setInvoiceNumber("");
      setInvoiceProvider("");
      setInvoiceRuc("");
      setInvoiceDate("");
      setInvoiceItems([{ productName: "", unitType: "UNIDAD", quantity: 1, unitCost: 0, totalCost: 0 }]);
      
      alert("¡Factura registrada! Los productos ingresados ya aparecen en el inventario con su alerta verde.");
      setActiveTab("inventario");
      setInventorySubTab("productos");
    } catch (error: any) {
      alert(`Error al registrar factura: ${error.message}`);
    }
  };

  // 🏷️ GESTIÓN DE CATEGORÍAS
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
      alert(`⚠️ Al modificar esta categoría, se actualizarán automáticamente todos los productos asociados.`);
    } catch (error: any) {
      alert(`Error al actualizar categoría: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (categoriesList.length <= 1) {
      alert("Debes mantener al menos una categoría en el sistema.");
      return;
    }
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${catName}"?`)) return;
    try {
      if (catId) {
        await deleteDoc(doc(db, "categories", catId));
        alert(`Categoría "${catName}" eliminada con éxito.`);
      }
    } catch (error: any) {
      alert(`Error al eliminar: ${error.message}`);
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
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterOrphanOnly) {
      const cat = String(p.category || "").trim().toLowerCase();
      return cat !== "" && !allCategoryNames.includes(cat);
    }
    return true;
  }) || [];

  const getExpiryStatus = (expiryDateStr: string) => {
    if (!expiryDateStr) return { color: "bg-zinc-800 text-zinc-400 border-zinc-700", label: "Sin Fecha" };
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: "bg-red-950/85 text-red-400 border-red-900", label: "🔴 VENCIDO" };
    if (diffDays <= 3) return { color: "bg-red-900/60 text-red-300 border-red-700 animate-pulse", label: `🔥 ¡Urgente! (${diffDays}d)` };
    if (diffDays <= 10) return { color: "bg-yellow-950/85 text-yellow-400 border-yellow-800 animate-pulse", label: `⚡ ¡A liquidar! (${diffDays}d)` };
    return { color: "bg-emerald-950/60 text-emerald-400 border-emerald-900/60", label: `🟢 Fresco (${diffDays}d)` };
  };

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

  // 🔔 FILTROS GLOBALES PARA VENCIMIENTOS
  const expiredProductsList = products.filter(p => {
    if (!p.expiryDate) return false;
    const diffDays = Math.ceil((new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 0;
  });

  const expiringSoonProductsList = products.filter(p => {
    if (!p.expiryDate) return false;
    const diffDays = Math.ceil((new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 10;
  });

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
            {/* 📦 INVENTARIO & STOCK CON SUBMENÚS */}
            <div className="space-y-1">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveTab("inventario"); 
                  setInventorySubTab("productos");
                  setFilterOrphanOnly(false); 
                  setIsInventoryDropdownOpen(!isInventoryDropdownOpen);
                }}
                title="Inventario & Stock"
                className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === "inventario" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-sm shrink-0">📦</span>
                  {isSidebarExpanded && <span className="whitespace-nowrap">Inventario & Stock</span>}
                </span>
                {isSidebarExpanded && <span className="text-[10px]">{isInventoryDropdownOpen ? "▼" : "▶"}</span>}
              </button>

              {/* Submenús desplegables del Inventario */}
              {isSidebarExpanded && isInventoryDropdownOpen && (
                <div className="pl-6 space-y-1 pt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab("inventario"); setInventorySubTab("productos"); setFilterOrphanOnly(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded font-semibold text-[11px] transition ${
                      activeTab === "inventario" && inventorySubTab === "productos" ? "text-white bg-red-950/60" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    • Productos & Stock
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab("inventario"); setInventorySubTab("vencimientos"); }}
                    className={`w-full text-left px-2 py-1.5 rounded font-semibold text-[11px] transition flex justify-between items-center ${
                      activeTab === "inventario" && inventorySubTab === "vencimientos" ? "text-white bg-red-950/60" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>• Vencimientos</span>
                    {(expiredProductsList.length > 0 || expiringSoonProductsList.length > 0) && (
                      <span className="bg-red-500 text-white px-1.5 py-0.1 rounded-full text-[8px] font-black">
                        {expiredProductsList.length + expiringSoonProductsList.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab("inventario"); setInventorySubTab("categorias"); }}
                    className={`w-full text-left px-2 py-1.5 rounded font-semibold text-[11px] transition flex justify-between items-center ${
                      activeTab === "inventario" && inventorySubTab === "categorias" ? "text-white bg-red-950/60" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>• Categorías</span>
                    <span className="text-[9px] text-zinc-500">({categoriesList.length})</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab("proveedores"); setIsSidebarExpanded(false); }}
              title="Facturas & Proveedores"
              className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "proveedores" ? "bg-red-600 text-white shadow-lg shadow-red-900/35" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm shrink-0">🧾</span>
                {isSidebarExpanded && <span className="whitespace-nowrap">Facturas & Compras</span>}
              </span>
              {suppliers.length > 0 && <span className="bg-emerald-500 text-black px-1.5 py-0.2 rounded-full text-[9px] font-black shrink-0">{suppliers.length}</span>}
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
        
        {/* 🏢 ENCABEZADO FIJO PRINCIPAL CON ICONO CORTO DE ALERTA (HOVER/CLIC) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-3 sm:p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <h1 className="text-sm sm:text-lg font-black tracking-tight text-white leading-tight">Minimarket Pamela</h1>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400">panel de administración</p>
            </div>

            {/* ALARMA 1: PRODUCTOS HUÉRFANOS */}
            {orphanProducts.length > 0 && (
              <div 
                onClick={() => { setActiveTab("inventario"); setInventorySubTab("productos"); setFilterOrphanOnly(true); }}
                title="Haz clic para ubicar los productos huérfanos en el inventario"
                className="relative group flex items-center cursor-pointer ml-2"
              >
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 justify-center items-center text-[9px] font-black text-white">!</span>
                </span>
                <div className="absolute left-0 sm:left-6 top-6 sm:top-auto z-50 hidden group-hover:block bg-zinc-950 text-amber-300 border border-amber-500/50 p-2.5 rounded-xl shadow-2xl w-64 text-[10px] font-bold leading-tight pointer-events-none">
                  Hay {orphanProducts.length} producto(s) cuya categoría fue eliminada. Edítalos en el inventario.
                </div>
              </div>
            )}

            {/* ⏳ ICONO CORTO DE ALERTA DE VENCIMIENTO CON TOOLTIP INFORMATIVO Y CLIC TRASLADADOR */}
            {(expiredProductsList.length > 0 || expiringSoonProductsList.length > 0) && (
              <div 
                onClick={() => { setActiveTab("inventario"); setInventorySubTab("vencimientos"); }}
                title="Ver detalles de vencimientos"
                className="relative group flex items-center justify-center cursor-pointer ml-2 w-7 h-7 bg-amber-500/20 border border-amber-500/60 rounded-full text-amber-400 hover:bg-amber-500 hover:text-black transition shadow-lg animate-bounce"
              >
                <span className="text-xs font-black">⏳</span>

                {/* Tooltip con información puntual desplegada al pasar el cursor */}
                <div className="absolute left-0 top-9 z-50 hidden group-hover:block bg-zinc-950 text-white border border-amber-500/60 p-3 rounded-xl shadow-2xl w-56 text-[10px] leading-tight pointer-events-none space-y-1">
                  <p className="font-black text-amber-400 uppercase">Resumen de Vencimientos:</p>
                  <p className="text-red-400">• Vencidos: {expiredProductsList.length}</p>
                  <p className="text-yellow-400">• Por vencer (&le; 10d): {expiringSoonProductsList.length}</p>
                  <p className="text-[9px] text-zinc-400 pt-1 italic">Haz clic para ir a revisión.</p>
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
          <button onClick={() => { setActiveTab("inventario"); setInventorySubTab("productos"); setFilterOrphanOnly(false); }} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "inventario" && inventorySubTab === "productos" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Stock</button>
          <button onClick={() => { setActiveTab("inventario"); setInventorySubTab("vencimientos"); }} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "inventario" && inventorySubTab === "vencimientos" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Vencimientos</button>
          <button onClick={() => { setActiveTab("inventario"); setInventorySubTab("categorias"); }} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "inventario" && inventorySubTab === "categorias" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Categorías</button>
          <button onClick={() => setActiveTab("proveedores")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "proveedores" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Facturas</button>
          <button onClick={() => setActiveTab("pedidos")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "pedidos" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Pedidos</button>
          <button onClick={() => setActiveTab("caja")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "caja" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Caja</button>
          <button onClick={() => setActiveTab("clientes")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "clientes" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Clientes</button>
          <button onClick={() => setActiveTab("marketing")} className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 ${activeTab === "marketing" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>Promos</button>
        </div>

        {/* 📦 CONTENEDOR PRINCIPAL DE INVENTARIO Y SUS SUBMENÚS */}
        {activeTab === "inventario" && (
          <div className="space-y-4">
            
            {/* Pestañas internas de navegación para los submenús de inventario */}
            <div className="flex gap-2 border-b border-zinc-800 pb-2">
              <button
                onClick={() => { setInventorySubTab("productos"); setFilterOrphanOnly(false); }}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                  inventorySubTab === "productos" ? "bg-red-600 text-white shadow-lg" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                📦 Productos & Stock
              </button>
              <button
                onClick={() => setInventorySubTab("vencimientos")}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
                  inventorySubTab === "vencimientos" ? "bg-red-600 text-white shadow-lg" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                <span>⏳ Control de Vencimientos</span>
                {(expiredProductsList.length > 0 || expiringSoonProductsList.length > 0) && (
                  <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[9px] font-black">
                    {expiredProductsList.length + expiringSoonProductsList.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setInventorySubTab("categorias")}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                  inventorySubTab === "categorias" ? "bg-red-600 text-white shadow-lg" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                🏷️ Gestión de Categorías ({categoriesList.length})
              </button>
            </div>

            {/* SUBMENÚ 1: PRODUCTOS & STOCK */}
            {inventorySubTab === "productos" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 h-fit space-y-3">
                  <h2 className="text-xs font-black text-white flex items-center gap-2">✨ Registrar Nuevo Producto (SKU 6D)</h2>
                  
                  <form onSubmit={handleCreateProduct} className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Nombre del artículo</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Ej. Yogur Gloria 1L"
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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Fecha de Vencimiento ⏳</label>
                        <input
                          type="date"
                          value={newExpiryDate}
                          onChange={e => setNewExpiryDate(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">N° de Lote 🏷️</label>
                        <input
                          type="text"
                          value={newBatchCode}
                          onChange={e => setNewBatchCode(e.target.value)}
                          placeholder="Ej. L-8842"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="block text-zinc-400 font-bold uppercase text-[9px]">Categoría de Tienda</label>
                        <button type="button" onClick={() => setInventorySubTab("categorias")} className="text-[9px] text-red-400 hover:underline">+ Gestionar Categorías</button>
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
                      Publicar Producto (SKU 6D)
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
                      placeholder="Buscar por nombre o SKU..."
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-red-600 w-56"
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
                          const expiryInfo = getExpiryStatus(product.expiryDate);

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
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-bold text-white truncate">{product.name}</h3>
                                    {/* 🟢 ALERTA VERDE CLARA Y VISIBLE DE PRODUCTO NUEVO */}
                                    {product.isNewRestock && (
                                      <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 rounded text-[9px] font-black animate-pulse">
                                        ✨ ¡Nuevo Ingreso (Asignar Foto y Categoría)!
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-[10px] text-red-400 font-black">S/ {(Number(product.price) ?? 0).toFixed(2)}</p>
                                    <span className="text-[9px] text-zinc-300 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">SKU: {product.sku || 'N/A'}</span>
                                    {hasValidCategory ? (
                                      <span className="text-[9px] text-zinc-500 truncate">({product.category})</span>
                                    ) : (
                                      <span className="text-[9px] bg-red-950/60 text-red-400 border border-red-900/50 px-1.5 py-0.2 rounded font-bold">⚠️ Sin Categoría</span>
                                    )}
                                    <span className={`text-[8px] px-1.5 py-0.2 rounded border font-bold ${expiryInfo.color}`}>
                                      {expiryInfo.label}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handlePrintBarcode(product)}
                                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-300 transition"
                                  title="Generar Etiqueta PDF con Código de Barras"
                                >
                                  🏷️ Etiqueta
                                </button>

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

            {/* SUBMENÚ 2: CONTROL DE VENCIMIENTOS (MERMA 0) */}
            {inventorySubTab === "vencimientos" && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <div>
                    <h2 className="text-sm font-black text-white">⏳ Semáforo de Vencimientos y Alertas (Merma 0)</h2>
                    <p className="text-[10px] text-zinc-400">Listado completo de productos por vencer (hasta 10 días) y productos ya vencidos.</p>
                  </div>
                  <button
                    onClick={() => setInventorySubTab("productos")}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                  >
                    ← Volver a Productos
                  </button>
                </div>

                {/* Sub-sección 1: Vencidos */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-red-400 uppercase">🔴 Productos Vencidos ({expiredProductsList.length})</h3>
                  {expiredProductsList.length === 0 ? (
                    <p className="text-zinc-500 text-[11px] pb-2">No hay productos vencidos.</p>
                  ) : (
                    expiredProductsList.map(product => (
                      <div key={product.id} className="bg-red-950/30 border border-red-900/60 rounded-xl p-3 flex justify-between items-center gap-3">
                        <div>
                          <h4 className="font-bold text-white text-xs">{product.name}</h4>
                          <p className="text-[10px] text-red-300">SKU: {product.sku} • Vencimiento: {product.expiryDate} • Stock: {product.stock} un.</p>
                        </div>
                        <button onClick={() => openEditModal(product)} className="px-3 py-1 bg-red-600 text-white font-bold rounded text-xs">Retirar / Liquidar</button>
                      </div>
                    ))
                  )}
                </div>

                {/* Sub-sección 2: Por Vencer */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <h3 className="text-xs font-black text-yellow-400 uppercase">⚡ Productos por Vencer en 10 días o menos ({expiringSoonProductsList.length})</h3>
                  {expiringSoonProductsList.length === 0 ? (
                    <p className="text-zinc-500 text-[11px]">No hay productos próximos a vencer.</p>
                  ) : (
                    expiringSoonProductsList.map(product => (
                      <div key={product.id} className="bg-yellow-950/30 border border-yellow-900/60 rounded-xl p-3 flex justify-between items-center gap-3">
                        <div>
                          <h4 className="font-bold text-white text-xs">{product.name}</h4>
                          <p className="text-[10px] text-yellow-300">SKU: {product.sku} • Vencimiento: {product.expiryDate} • Stock: {product.stock} un.</p>
                        </div>
                        <button onClick={() => openEditModal(product)} className="px-3 py-1 bg-yellow-600 text-black font-black rounded text-xs">Crear Oferta Flash 🔥</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SUBMENÚ 3: GESTIÓN DE CATEGORÍAS */}
            {inventorySubTab === "categorias" && (
              <div className="space-y-4">
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

        {/* VISTA 3: CAJA & REPORTES */}
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

        {/* VISTA 4: CLIENTES CRM */}
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

        {/* VISTA 5: FACTURAS Y REPOSICIÓN */}
        {activeTab === "proveedores" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 h-fit space-y-4 lg:col-span-1">
              <h2 className="text-xs font-black text-white flex items-center gap-2">🧾 Registrar Factura y Actualizar Stock</h2>
              
              <form onSubmit={handleSaveInvoice} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">N° de Factura / Recibo</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    placeholder="Ej. F001-00482"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Proveedor / Distribuidora</label>
                    <input
                      type="text"
                      value={invoiceProvider}
                      onChange={e => setInvoiceProvider(e.target.value)}
                      placeholder="Ej. Gloria S.A."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">RUC del Proveedor</label>
                    <input
                      type="text"
                      value={invoiceRuc}
                      onChange={e => setInvoiceRuc(e.target.value)}
                      placeholder="20100100100"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Fecha de Emisión</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={e => setInvoiceDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-600 text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Condición de Pago</label>
                    <select
                      value={invoicePaymentTerm}
                      onChange={e => setInvoicePaymentTerm(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-600 text-[10px]"
                    >
                      <option value="CONTADO">Contado</option>
                      <option value="CREDITO_15D">Crédito 15 días</option>
                      <option value="CREDITO_30D">Crédito 30 días</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-300 uppercase text-[10px]">Detalle de Ítems / Autocompletado</span>
                    <button type="button" onClick={handleAddInvoiceItem} className="text-red-400 font-bold hover:underline">+ Agregar Ítem</button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {invoiceItems.map((item, index) => (
                      <div key={index} className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg space-y-2 relative">
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              list={`products-list-${index}`}
                              value={item.productName}
                              onChange={e => handleInvoiceItemChange(index, "productName", e.target.value)}
                              placeholder="Escribe o busca producto..."
                              className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-white text-xs"
                              required
                            />
                            <datalist id={`products-list-${index}`}>
                              {products.map((p) => (
                                <option key={p.id} value={p.name} />
                              ))}
                            </datalist>
                          </div>

                          <select
                            value={item.unitType}
                            onChange={e => handleInvoiceItemChange(index, "unitType", e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-white text-[10px]"
                          >
                            <option value="UNIDAD">Unidades</option>
                            <option value="KG">Kilogramos (kg)</option>
                            <option value="PAQUETE">Paquetes</option>
                            <option value="LITRO">Litros (L)</option>
                            <option value="CAJA">Cajas</option>
                          </select>
                          {invoiceItems.length > 1 && (
                            <button type="button" onClick={() => handleRemoveInvoiceItem(index)} className="text-red-400 font-bold px-1.5">✕</button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          <div>
                            <span className="text-[8px] text-zinc-400 uppercase">Cantidad</span>
                            <input
                              type="number"
                              step="any"
                              value={item.quantity}
                              onChange={e => handleInvoiceItemChange(index, "quantity", e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-white text-center"
                              required
                            />
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-400 uppercase">Costo Unit. (S/)</span>
                            <input
                              type="number"
                              step="0.05"
                              value={item.unitCost}
                              onChange={e => handleInvoiceItemChange(index, "unitCost", e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-white text-center"
                              required
                            />
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-400 uppercase">Total (S/)</span>
                            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded p-1 text-emerald-400 text-center font-black">
                              S/ {item.totalCost.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal:</span>
                    <span>S/ {subTotalInvoice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>IGV (18%):</span>
                    <span>S/ {igvInvoice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-white pt-1 border-t border-zinc-900 text-sm">
                    <span>TOTAL FACTURA:</span>
                    <span className="text-emerald-400">S/ {totalInvoiceAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg transition cursor-pointer shadow-lg">
                  Guardar Factura e Impactar Stock 🚀
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-black text-white">Historial de Facturas y Proveedores ({suppliers.length})</h2>
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {suppliers.length === 0 ? (
                  <p className="text-zinc-500 text-center py-16">No hay facturas registradas en el sistema.</p>
                ) : (
                  suppliers.map(sup => (
                    <div key={sup.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2.5">
                      <div className="flex justify-between items-start border-b border-zinc-800 pb-2">
                        <div>
                          <span className="text-[9px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded font-bold uppercase">Factura: {sup.invoiceNumber}</span>
                          <h3 className="font-black text-white text-sm mt-1">{sup.provider} <span className="text-[10px] text-zinc-400 font-normal">(RUC: {sup.ruc})</span></h3>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-black text-sm">S/ {(Number(sup.totalCost) || 0).toFixed(2)}</span>
                          <p className="text-[9px] text-zinc-500">Emisión: {sup.date} • Pago: {sup.paymentTerm}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Ítems ingresados al stock:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {sup.items?.map((it: any, i: number) => (
                            <div key={i} className="bg-zinc-900/60 border border-zinc-800/80 p-2 rounded flex justify-between items-center text-[11px]">
                              <span>{it.quantity} {it.unitType}(s) de <strong>{it.productName}</strong></span>
                              <span className="text-zinc-400">S/ {(Number(it.totalCost) || 0).toFixed(2)}</span>
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

        {/* VISTA 6: MARKETING */}
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

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">SKU 6D (Inmutable)</label>
                    <input
                      type="text"
                      value={editForm.sku}
                      disabled
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-400 cursor-not-allowed text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Vencimiento ⏳</label>
                    <input
                      type="date"
                      value={editForm.expiryDate}
                      onChange={e => setEditForm({ ...editForm, expiryDate: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-600 text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-0.5 uppercase text-[9px]">Lote 🏷️</label>
                    <input
                      type="text"
                      value={editForm.batchCode}
                      onChange={e => setEditForm({ ...editForm, batchCode: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-600 text-[10px]"
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