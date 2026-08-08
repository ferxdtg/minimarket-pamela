'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, deleteDoc, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [view, setView] = useState<'inventario' | 'pedidos'>('inventario');
  const [products, setProducts] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('abarrotes');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => setPedidos(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubAuth(); unsubProducts(); unsubOrders(); };
  }, []);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      setImageSrc(canvas.toDataURL('image/jpeg'));
    }
    setIsCameraActive(false);
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try { 
      await signInWithEmailAndPassword(auth, email, password); 
    } catch { 
      setAuthError('Correo o contraseña incorrectos.'); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const newProduct = { id: Date.now(), name, price: Number(price), stock: Number(stock), category, image: imageSrc || '', isFeatured, isOnSale };
    try {
      await setDoc(doc(db, "products", String(newProduct.id)), newProduct);
      setSuccessMessage('¡Producto guardado con éxito!');
      setName(''); setPrice(''); setStock(''); setImageSrc(null); setIsOnSale(false); setIsFeatured(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch { 
      alert('Error al guardar en la nube.'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (window.confirm('¿Deseas eliminar este producto?')) {
      await deleteDoc(doc(db, "products", String(id)));
    }
  };

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(adminSearch.toLowerCase()));

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">Acceso Seguro</span>
            <h1 className="text-2xl font-black mt-1">Admin Minimarket</h1>
          </div>
          {authError && <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs font-semibold">⚠️ {authError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Correo Electrónico</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-white outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Contraseña</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-white outline-none text-sm" />
            </div>
            <button type="submit" className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-sm cursor-pointer shadow-lg">Ingresar al Panel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">Panel de Control</span>
            <h1 className="text-3xl font-black text-white mt-1">Minimarket Pamela</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 hidden sm:inline bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">{user.email}</span>
            <button onClick={() => signOut(auth)} className="bg-zinc-900 border border-zinc-800 hover:border-red-600 px-4 py-2 rounded-xl text-xs font-bold text-red-400 transition cursor-pointer">
              Cerrar Sesión
            </button>
          </div>
        </header>

        {successMessage && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-sm font-semibold flex items-center gap-3 shadow-lg">
            ✅ {successMessage}
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={() => setView('inventario')} className={`px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer ${view === 'inventario' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'}`}>
            📦 Inventario
          </button>
          <button onClick={() => setView('pedidos')} className={`px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer ${view === 'pedidos' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'}`}>
            🛒 Pedidos ({pedidos.length})
          </button>
        </div>

        {view === 'inventario' ? (
          <div className="grid md:grid-cols-12 gap-8">
            
            <div className="md:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl h-fit space-y-5">
              <h2 className="text-lg font-bold">Agregar Nuevo Producto</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Nombre del producto</label>
                  <input required type="text" placeholder="Ej. Aceite Primor 1L" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-white outline-none text-sm" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Precio (S/)</label>
                    <input required type="number" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-white outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Stock</label>
                    <input required type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-white outline-none text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Categoría</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-white outline-none text-sm cursor-pointer">
                    <option value="ofertas">Ofertas y Promociones</option>
                    <option value="abarrotes">Abarrotes y Despensa</option>
                    <option value="bebidas">Bebidas y Jugos</option>
                    <option value="snacks">Snacks y Golosinas</option>
                    <option value="limpieza">Limpieza y Hogar</option>
                    <option value="bebes">Bebés</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3.5 bg-zinc-800/60 rounded-xl border border-zinc-700 cursor-pointer">
                    <span className="text-xs font-bold text-zinc-300">En Oferta</span>
                    <input type="checkbox" className="w-4 h-4 rounded text-red-600" checked={isOnSale} onChange={(e) => setIsOnSale(e.target.checked)} />
                  </label>
                  <label className="flex items-center justify-between p-3.5 bg-zinc-800/60 rounded-xl border border-zinc-700 cursor-pointer">
                    <span className="text-xs font-bold text-zinc-300">Destacado</span>
                    <input type="checkbox" className="w-4 h-4 rounded text-amber-500" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase text-zinc-400">Imagen del Producto</label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-center text-xs font-bold transition">
                      📂 Subir Archivo
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button type="button" onClick={startCamera} className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-center text-xs font-bold transition cursor-pointer">
                      📸 Usar Cámara
                    </button>
                  </div>

                  {isCameraActive && (
                    <div className="space-y-2 pt-2">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl border border-zinc-700" />
                      <button type="button" onClick={capturePhoto} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold cursor-pointer">Capturar Foto</button>
                    </div>
                  )}

                  {imageSrc && (
                    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700">
                      <img src={imageSrc} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                      <button type="button" onClick={() => setImageSrc(null)} className="text-xs text-red-400 hover:underline">Quitar imagen</button>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black shadow-xl transition-all text-sm cursor-pointer">
                  {isLoading ? 'Guardando...' : 'Publicar Producto'}
                </button>
              </form>
            </div>

            <div className="md:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg font-bold">Catálogo Actual ({products.length})</h2>
                <input type="text" placeholder="🔍 Buscar producto..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className="w-full sm:w-60 bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-xl text-xs text-white outline-none" />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 max-h-[600px] pr-2">
                {filteredProducts.length === 0 ? <p className="text-zinc-500 text-sm py-8 text-center">No se encontraron productos.</p> : null}
                
                {filteredProducts.map(p => (
                  <div key={p.id} className="p-3.5 bg-zinc-800/40 border border-zinc-700/60 rounded-2xl flex items-center justify-between gap-4 hover:border-zinc-600 transition">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xs">📦</span>}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                          {p.isFeatured && <span title="Destacado">⭐</span>}
                          {p.isOnSale && <span title="En Oferta">🔥</span>}
                        </div>
                        <p className="text-xs text-red-400 font-extrabold mt-0.5">S/ {Number(p.price).toFixed(2)} <span className="text-zinc-500 font-normal">| Stock: {p.stock}</span></p>
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider">{p.category}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2.5 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer">🗑️</button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl min-h-[500px]">
             <h2 className="text-lg font-bold mb-6">Historial de Pedidos Recibidos</h2>
             {pedidos.length === 0 ? (
               <p className="text-zinc-500 text-sm py-12 text-center">Aún no hay pedidos registrados.</p>
             ) : (
               <div className="grid gap-4 md:grid-cols-2">
                 {pedidos.sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map(p => (
                   <div key={p.id} className={`p-6 rounded-3xl border ${p.status === 'entregado' ? 'border-emerald-900/40 bg-emerald-950/10' : 'border-zinc-700 bg-zinc-800/40'}`}>
                     
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <h3 className="font-bold text-lg text-white">{p.customer?.name || 'Cliente'}</h3>
                         <p className="text-xs text-zinc-400">Tel: {p.customer?.phone || 'No registrado'}</p>
                         <p className="text-xs text-zinc-500 mt-1">{p.customer?.address || ''}</p>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p.status === 'entregado' ? 'bg-emerald-900 text-emerald-400' : 'bg-amber-900 text-amber-400'}`}>
                         {p.status || 'Pendiente'}
                       </span>
                     </div>

                     <div className="text-xs text-zinc-300 space-y-1.5 bg-zinc-950/60 p-4 rounded-2xl mb-4 border border-zinc-800/80">
                       {p.items?.map((i: any, idx: number) => (
                         <div key={idx} className="flex justify-between">
                           <span>{i.quantity}x {i.name}</span>
                           <span className="text-zinc-400">S/ {(i.price * i.quantity).toFixed(2)}</span>
                         </div>
                       ))}
                       <div className="border-t border-zinc-800 mt-3 pt-3 flex justify-between font-bold text-sm text-white">
                         <span>TOTAL</span>
                         <span className="text-emerald-400">S/ {Number(p.total).toFixed(2)}</span>
                       </div>
                     </div>

                     {p.status !== 'entregado' && (
                       <button onClick={() => updateDoc(doc(db, "orders", p.id), { status: 'entregado' })} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-lg">
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