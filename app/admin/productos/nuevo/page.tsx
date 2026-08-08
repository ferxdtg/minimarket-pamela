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
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('abarrotes');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
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
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try { 
      await signInWithEmailAndPassword(auth, email, password); 
    } catch { 
      setAuthError('Credenciales inválidas.'); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const newProduct = { id: Date.now(), name, price: Number(price), stock: Number(stock), category, image: imageSrc || '', isFeatured, isOnSale };
    try {
      await setDoc(doc(db, "products", String(newProduct.id)), newProduct);
      setName(''); setPrice(''); setStock(''); setImageSrc(null); setIsOnSale(false); setIsFeatured(false);
    } catch { 
      alert('Error al guardar.'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    try {
      await deleteDoc(doc(db, "products", String(id)));
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
    } catch (err) {
      console.error("Error al actualizar pedido:", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-black mb-6 text-center">🔐 Acceso Admin</h1>
          {authError && <p className="text-red-500 text-xs mb-4 text-center font-bold">{authError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-800 p-3 rounded-xl text-sm outline-none border border-zinc-700" />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-800 p-3 rounded-xl text-sm outline-none border border-zinc-700" />
            <button type="submit" className="w-full py-3 bg-red-600 rounded-xl font-bold cursor-pointer">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <h1 className="text-2xl font-black">Minimarket Admin</h1>
          <button onClick={() => signOut(auth)} className="text-red-400 text-xs font-bold cursor-pointer">Salir</button>
        </header>

        <div className="flex gap-4">
          <button onClick={() => setView('inventario')} className={`px-6 py-2 rounded-xl font-bold cursor-pointer ${view === 'inventario' ? 'bg-red-600' : 'bg-zinc-800'}`}>Inventario</button>
          <button onClick={() => setView('pedidos')} className={`px-6 py-2 rounded-xl font-bold cursor-pointer ${view === 'pedidos' ? 'bg-red-600' : 'bg-zinc-800'}`}>Pedidos ({pedidos.length})</button>
        </div>

        {view === 'inventario' ? (
          <div className="grid md:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <input required placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-800 p-3 rounded-xl text-sm border border-zinc-700 outline-none" />
              <div className="flex gap-4">
                <input required type="number" step="0.01" placeholder="Precio" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-zinc-800 p-3 rounded-xl text-sm border border-zinc-700 outline-none" />
                <input required type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-zinc-800 p-3 rounded-xl text-sm border border-zinc-700 outline-none" />
              </div>
              
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-zinc-800 p-3 rounded-xl text-sm border border-zinc-700 outline-none">
                <option value="ofertas">Ofertas y Promociones</option>
                <option value="abarrotes">Abarrotes y Despensa</option>
                <option value="bebidas">Bebidas y Jugos</option>
                <option value="snacks">Snacks y Golosinas</option>
                <option value="limpieza">Limpieza y Hogar</option>
                <option value="bebes">Bebés</option>
              </select>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 bg-zinc-800 p-3 rounded-xl cursor-pointer text-xs font-bold border border-zinc-700">
                  <input type="checkbox" checked={isOnSale} onChange={(e) => setIsOnSale(e.target.checked)} /> Oferta
                </label>
                <label className="flex items-center gap-2 bg-zinc-800 p-3 rounded-xl cursor-pointer text-xs font-bold border border-zinc-700">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Destacado
                </label>
              </div>

              {isCameraActive ? (
                <div className="space-y-2">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl border border-zinc-700" />
                  <button type="button" onClick={capturePhoto} className="w-full py-2 bg-blue-600 rounded-xl text-xs font-bold cursor-pointer">Capturar Foto</button>
                </div>
              ) : (
                <button type="button" onClick={startCamera} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold border border-zinc-700 cursor-pointer">📸 Usar Cámara</button>
              )}
              {imageSrc && <img src={imageSrc} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-zinc-700" />}

              <button type="submit" disabled={isLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-sm cursor-pointer">
                {isLoading ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </form>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {products.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-3">
                    {p.image && <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-lg" />}
                    <span className="text-sm font-bold">{p.name} {p.isFeatured && '⭐'} {p.isOnSale && '🔥'}</span>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-400 cursor-pointer p-2">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pedidos.map(p => (
              <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{p.customer?.name || 'Cliente'}</h3>
                    <p className="text-xs text-zinc-400">Tel: {p.customer?.phone || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'entregado' ? 'bg-emerald-900 text-emerald-400' : 'bg-amber-900 text-amber-400'}`}>
                    {p.status || 'pendiente'}
                  </span>
                </div>
                <div className="text-xs text-zinc-300 space-y-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  {p.items?.map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{i.quantity}x {i.name}</span>
                      <span>S/ {(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-800 pt-2 font-bold flex justify-between">
                    <span>Total</span>
                    <span className="text-emerald-400">S/ {Number(p.total || 0).toFixed(2)}</span>
                  </div>
                </div>
                {p.status !== 'entregado' && (
                  <button onClick={() => handleUpdateOrderStatus(p.id, 'entregado')} className="w-full bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                    Marcar como Entregado
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}