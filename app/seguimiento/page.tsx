"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function TrackingPage() {
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setSearched(true);
    setOrder(null);

    try {
      // Buscamos órdenes que coincidan con el número de teléfono del cliente
      const q = query(collection(db, "orders"), where("phone", "==", phone.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Tomamos la orden más reciente si hubiera varias
        const latestOrder = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0];
        setOrder(latestOrder);
      }
    } catch (error) {
      console.error("Error buscando orden:", error);
    } finally {
      setLoading(false);
    }
  };

  // Definimos los pasos de la barra de progreso
  const getStepIndex = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDIENTE": return 1;
      case "PREPARANDO": return 2;
      case "EN_CAMINO": return 3;
      case "ENTREGADO": return 4;
      default: return 1;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <span className="bg-red-50 text-red-600 border border-red-100 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            Delivery Express 🛵
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Rastrea tu Pedido
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Ingresa tu número de WhatsApp para ver el estado de tu compra en tiempo real.
          </p>
        </div>

        {/* Formulario de Búsqueda */}
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Número de Celular / WhatsApp
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 950323959"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-sm font-bold focus:outline-none focus:border-red-600 transition"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3.5 rounded-2xl transition shadow-[0_4px_15px_rgba(220,38,38,0.3)] active:scale-95 cursor-pointer disabled:opacity-50 text-sm"
                >
                  {loading ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Resultado del Rastreo */}
        {searched && !loading && !order && (
          <div className="bg-white p-8 rounded-[2.5rem] text-center border border-dashed border-slate-300">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-black text-slate-800 mt-3">No encontramos pedidos recientes</h3>
            <p className="text-slate-500 text-xs mt-1">Verifica que el número sea el mismo que usaste al hacer tu compra.</p>
          </div>
        )}

        {order && (
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in zoom-in duration-300">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Cliente</p>
                <h3 className="text-lg font-black text-slate-900">{order.client}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total a Pagar</p>
                <p className="text-lg font-black text-red-600">S/ {Number(order.total || 0).toFixed(2)}</p>
              </div>
            </div>

            {/* BARRA DE PROGRESO VISUAL */}
            <div className="space-y-6 py-4">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider text-center">
                Estado Actual: <span className="text-red-600 font-black">{order.status}</span>
              </p>

              <div className="grid grid-cols-3 gap-2 relative">
                {/* Paso 1: Recibido */}
                <div className="text-center space-y-2">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all ${currentStep >= 1 ? 'bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]' : 'bg-slate-100 text-slate-400'}`}>
                    1
                  </div>
                  <p className="text-xs font-bold text-slate-700">Recibido</p>
                </div>

                {/* Paso 2: Preparando */}
                <div className="text-center space-y-2">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all ${currentStep >= 2 ? 'bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]' : 'bg-slate-100 text-slate-400'}`}>
                    2
                  </div>
                  <p className="text-xs font-bold text-slate-700">Preparando</p>
                </div>

                {/* Paso 3: En Camino */}
                <div className="text-center space-y-2">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all ${currentStep >= 3 ? 'bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]' : 'bg-slate-100 text-slate-400'}`}>
                    🛵
                  </div>
                  <p className="text-xs font-bold text-slate-700">En Camino</p>
                </div>
              </div>
            </div>

            {/* Detalle de Productos */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Detalle del pedido</p>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{order.items}</p>
            </div>

            <div className="text-center pt-2">
              <a
                href={`https://wa.me/51950323959?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20pedido%20a%20nombre%20de%20${order.client}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-slate-500 hover:text-red-600 underline transition"
              >
                ¿Tienes algún problema con tu entrega? Contáctanos
              </a>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}