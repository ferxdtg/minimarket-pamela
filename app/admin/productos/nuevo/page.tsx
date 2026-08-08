'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase'; // <- IMPORTACIÓN CORREGIDA AQUÍ
import { collection, deleteDoc, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

export default function AdminPage() {
  // --- Estados de Autenticación ---
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // --- Estados de Vistas y Datos ---
  const [view, setView] = useState<'inventario' | 'pedidos'>('inventario');
  const [products, setProducts] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  
  // --- Estados del Formulario de Productos ---
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('abarrotes');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Efecto para escuchar la Sesión y las Bases de Datos en tiempo real
  useEffect(() => {
    // Escuchar si hay alguien logueado
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Escuchar cambios en Productos
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Escuchar cambios en Pedidos
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      setPedidos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { 
      unsubAuth(); 
      unsubProducts(); 
      unsubOrders(); 
    };
  }, []);

  // --- Funciones de Login y Logout ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError('Credenciales inválidas. Verifica tu correo y contraseña.');
    }
  };

  const handleLogout = () => signOut(auth);

  // --- Funciones de Inventario ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const newProduct = { 
      id: Date.now(), 
      name, 
      price: Number(price), 
      stock: Number(stock), 
      category, 
      image: imageSrc || '', 
      isFeatured, 
      isOnSale 
    };

    try {
      await setDoc(doc(db, "products", String(newProduct.id)), newProduct);
      setSuccessMessage('¡Producto guardado exitosamente!');
      
      // Limpiar formulario
      setName(''); setPrice(''); setStock(''); setImageSrc(null); setIsOnSale(false); setIsFeatured(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) { 
      alert('Hubo un error al guardar el producto.'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleDeleteProduct = async (id: number) => { 
    if(window.confirm('¿Seguro que deseas eliminar este producto?')) {
      await deleteDoc(doc(db, "products", String(id))); 
    }
  };

  // --- Funciones de Pedidos ---
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (error) {
      alert("Error al actualizar el estado del pedido.");
    }
  };

  // ==========================================
  // RENDERIZADO 1: PANTALLA DE LOGIN
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">Acceso Restringido</span>
            <h1 className="text-2xl font-black mt-1">Admin Minimarket</h1>
          </div>
          
          {authError && <p className="text-red-400 text-xs font-bold text-center mb-4 p-2 bg-red-950/50 rounded-lg">{authError}</p>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Correo</label>
              <input required type="email" placeholder="admin@tienda.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-800 p-3.5 rounded-xl text-sm outline-none focus:border-red-600 border border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Contraseña</label>
              <input required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-800 p-3.5 rounded-xl text-sm outline-none focus:border-red-600 border border-zinc-700" />
            </div>
            <button type="submit" className="w-full py-3.5 bg-red-600 hover:bg-red-700 transition rounded-xl font-black mt-2">
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDERIZADO 2: PANEL DE ADMINISTRACIÓN
  // ==========================================
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">Panel Seguro</span>
            <h1 className="text-3xl font-black text-white mt-1">Minimarket Pamela</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/50 px-3 py-1.5 rounded-full">Usuario: {user.email}</span>
            <button onClick={handleLogout} className="bg-zinc-900 border border-zinc-800 hover:border-red-600 px-4 py-2 rounded-xl text-xs font-bold text-red-400 transition cursor-pointer">
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* MENÚ DE PESTAÑAS */}
        <div className="flex gap-4 border-b border-zinc-800 pb-4">
          <button onClick={() => setView('inventario')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${view === 'inventario' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
            📦 Inventario
          </button>
          <button onClick={() => setView('pedidos')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${view === 'pedidos' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
            🛒 Pedidos ({pedidos.length})
          </button>
        </div>

        {/* MENSAJE DE ÉXITO GENERAL */}
        {successMessage && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-sm font-semibold flex items-center gap-3">
            ✅ {successMessage}
          </div>
        )}

        {/* VISTA 1: INVENTARIO */}
        {view === 'inventario' && (
          <div className="grid md:grid-cols-12 gap-8">
            
            {/* Formulario Agregar */}
            <div className="md:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl h-fit">
              <h2 className="text-lg font-bold mb-4">Agregar Nuevo Producto</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required type="text" placeholder="Nombre del producto" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-sm outline-none focus:border-red-500" />
                
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" step="0.01" placeholder="Precio (S/)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-sm outline-none focus:border-red-500" />
                  <input required type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-sm outline-none focus:border-red-500" />
                </div>

                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-sm outline-none focus:border-red-500">
                  <option value="abarrotes">Abarrotes y Despensa</option>
                  <option value="bebidas">Bebidas y Jugos</option>
                  <option value="snacks">Snacks y Golosinas</option>
                  <option value="limpieza">Limpieza y Hogar</option>
                  <option value="bebes">Bebés</option>
                </select>

                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-center text-xs font-bold">
                    📸 Subir Foto
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  {imageSrc && <img src={imageSrc} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />}
                </div>

                <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-xl border border-zinc-700">
                  <span className="text-xs font-bold text-red-400">¿En Oferta?</span>
                  <input type="checkbox" checked={isOnSale} onChange={(e) => setIsOnSale(e.target.checked)} className="w-4 h-4" />
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black shadow-xl transition-all text-sm">
                  {isLoading ? 'Guardando...' : 'Publicar Producto'}
                </button>
              </form>
            </div>

            {/* Lista de Productos */}
            <div className="md:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col">
              <h2 className="text-lg font-bold mb-4">Catálogo Actual ({products.length})</h2>
              <div className="flex-1 overflow-y-auto space-y-3 max-h-[600px] pr-2">
                {products.length === 0 ? <p className="text-zinc-500 text-sm">No hay productos registrados.</p> : null}
                
                {products.map(p => (
                  <div key={p.id} className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-700 rounded-xl overflow-hidden shrink-0">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">📦</div>}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        <p className="text-xs text-red-400 font-extrabold">S/ {Number(p.price).toFixed(2)} <span className="text-zinc-500 font-normal">| Stock: {p.stock}</span></p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2.5 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer">🗑️</button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VISTA 2: PEDIDOS */}
        {view === 'pedidos' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl min-h-[500px]">
             <h2 className="text-lg font-bold mb-6">Historial de Pedidos</h2>
             {pedidos.length === 0 ? (
               <p className="text-zinc-500 text-sm">Aún no hay pedidos registrados.</p>
             ) : (
               <div className="grid gap-4 md:grid-cols-2">
                 {pedidos.sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map(p => (
                   <div key={p.id} className={`p-6 rounded-3xl border ${p.status === 'entregado' ? 'border-emerald-900/50 bg-emerald-950/10' : 'border-zinc-700 bg-zinc-800/50'}`}>
                     
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <h3 className="font-bold text-lg">{p.customer?.name || 'Cliente sin nombre'}</h3>
                         <p className="text-xs text-zinc-400">Tel: {p.customer?.phone || 'No registrado'}</p>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p.status === 'entregado' ? 'bg-emerald-900 text-emerald-400' : 'bg-amber-900 text-amber-400'}`}>
                         {p.status || 'Pendiente'}
                       </span>
                     </div>

                     <div className="text-sm text-zinc-300 space-y-1 bg-zinc-950/50 p-4 rounded-xl mb-4 border border-zinc-800/50">
                       {p.items?.map((i: any, idx: number) => (
                         <div key={idx} className="flex justify-between">
                           <span>{i.quantity}x {i.name}</span>
                           <span className="text-zinc-500">S/ {(i.price * i.quantity).toFixed(2)}</span>
                         </div>
                       ))}
                       <div className="border-t border-zinc-700/50 mt-2 pt-2 flex justify-between font-bold text-white">
                         <span>TOTAL</span>
                         <span className="text-emerald-400">S/ {Number(p.total).toFixed(2)}</span>
                       </div>
                     </div>

                     {p.status !== 'entregado' && (
                       <button onClick={() => updateOrderStatus(p.id, 'entregado')} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wide transition">
                         ✔ Marcar como Entregado
                       </button>
                     )}
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
}