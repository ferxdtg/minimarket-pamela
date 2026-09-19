"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";

export default function TrackingPage() {
  const [phone, setPhone] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Limpiar listener al desmontar
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) return;

    // Cancelar listener anterior si existe
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setLoading(true);
    setSearched(true);
    setOrders([]);
    setSubmittedPhone(trimmedPhone);

    // Escuchar en tiempo real con onSnapshot
    const q = query(collection(db, "orders"), where("phone", "==", trimmedPhone));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Más reciente primero
      allOrders.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.date || 0).getTime();
        const dateB = new Date(b.createdAt || b.date || 0).getTime();
        return dateB - dateA;
      });
      setOrders(allOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error buscando orden:", error);
      setLoading(false);
    });

    unsubscribeRef.current = unsubscribe;
  };

  // Muestra el pedido más reciente como principal
  const order = orders.length > 0 ? orders[0] : null;

  const getStepIndex = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDIENTE": return 1;
      case "PREPARANDO": return 2;
      case "EN_CAMINO": return 3;
      case "ENTREGADO": return 4;
      default: return 0;
    }
  };

  const getDisplayStatus = (status: string, type: string) => {
    if (type === "RECOJO") {
      if (status === "EN_CAMINO") return "LISTO EN TIENDA";
      if (status === "ENTREGADO") return "RECOGIDO";
      if (status === "NO_RECOGIDO") return "NO RECOGIDO";
    }
    return status;
  };

  const currentStep = order ? getStepIndex(order.status) : 0;
  const isErrorState = order?.status === "RECHAZADO" || order?.status === "NO_RECOGIDO";

  return (
    <main className="min-h-screen bg-[#F8F9FA] py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Botón volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold text-sm transition-colors"
        >
          ← Volver a la tienda
        </Link>

        {/* CABECERA */}
        <div className="text-center space-y-3">
          <span className="bg-red-50 text-red-600 border border-red-100 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
            {order ? (order.type === "RECOJO" ? "Recojo en Tienda 🏪" : "Delivery Express 🛵") : "Radar en Vivo 📡"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Rastrea tu Pedido
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">
            Ingresa tu número de WhatsApp. El estado se actualiza en <strong>tiempo real</strong>.
          </p>
        </div>

        {/* FORMULARIO */}
        <div className="bg-white p-4 sm:p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 950323959"
              autoComplete="tel"
              maxLength={9}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-base font-bold focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all text-center sm:text-left"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-black text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Buscar 🔍"}
            </button>
          </form>
          
          {/* Indicador de seguimiento en vivo */}
          {searched && !loading && submittedPhone && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <p className="text-[11px] text-emerald-600 font-bold">
                Escuchando actualizaciones en tiempo real para {submittedPhone}
              </p>
            </div>
          )}
        </div>

        {/* RESULTADO VACÍO */}
        {searched && !loading && orders.length === 0 && (
          <div className="bg-white p-10 rounded-[2.5rem] text-center border border-dashed border-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🧐
            </div>
            <h3 className="text-xl font-black text-slate-800">No encontramos tu pedido</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
              Verifica que el número sea exactamente el mismo que usaste al confirmar en WhatsApp.
            </p>
          </div>
        )}

        {/* PEDIDO MÁS RECIENTE */}
        {order && (
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Tu Pedido</p>
                <h3 className="text-xl font-black text-slate-900 leading-none">{order.client}</h3>
                <span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded uppercase ${order.type === "DELIVERY" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                  {order.type}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Total</p>
                <p className="text-2xl font-black text-red-600 leading-none">S/ {Number(order.total || 0).toFixed(2)}</p>
              </div>
            </div>

            {isErrorState ? (
              <div className={`border rounded-2xl p-6 text-center space-y-2 ${order.status === "RECHAZADO" ? "bg-red-50 border-red-200" : "bg-purple-50 border-purple-200"}`}>
                <div className="text-4xl mb-2">⚠️</div>
                <h4 className={`text-lg font-black uppercase tracking-tight ${order.status === "RECHAZADO" ? "text-red-700" : "text-purple-700"}`}>
                  Pedido {getDisplayStatus(order.status, order.type)}
                </h4>
                <p className={`text-sm font-medium ${order.status === "RECHAZADO" ? "text-red-600" : "text-purple-600"}`}>
                  Tuvimos un inconveniente con tu orden. Comunícate con nosotros para solucionarlo.
                </p>
              </div>
            ) : (
              <div className="space-y-8 py-2 relative">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider text-center">
                  Estado: <span className="text-red-600">{getDisplayStatus(order.status, order.type)}</span>
                </p>

                <div className="absolute top-[6.5rem] left-[12%] right-[12%] h-1 bg-slate-100 rounded-full -z-10" />
                <div className="absolute top-[6.5rem] left-[12%] h-1 bg-red-600 rounded-full transition-all duration-1000 ease-out -z-10" style={{ width: `${(currentStep - 1) * 33.33}%` }} />

                <div className="flex justify-between relative z-0">
                  {[
                    { step: 1, icon: "📝", label: "Recibido" },
                    { step: 2, icon: "🍳", label: "Preparando" },
                    { step: 3, icon: order.type === "DELIVERY" ? "🛵" : "🏪", label: order.type === "DELIVERY" ? "En Camino" : "Listo" },
                    { step: 4, icon: order.type === "DELIVERY" ? "🎉" : "🛍️", label: order.type === "DELIVERY" ? "Entregado" : "Recogido", emerald: true },
                  ].map(({ step, icon, label, emerald }) => (
                    <div key={step} className="text-center w-1/4 space-y-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full flex items-center justify-center text-lg sm:text-xl transition-all duration-500 ${
                        currentStep >= step
                          ? emerald
                            ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110"
                            : "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-110"
                          : "bg-white text-slate-300 border-2 border-slate-100"
                      }`}>
                        {icon}
                      </div>
                      <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide leading-tight ${currentStep >= step ? (emerald ? "text-emerald-600" : "text-slate-900") : "text-slate-400"}`}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detalle</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{order.items}</p>
              </div>

              <a
                href={`https://wa.me/51950323959?text=${encodeURIComponent(`Hola, tengo una consulta sobre mi pedido a nombre de ${order.client}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 font-bold text-center py-4 rounded-xl transition-colors text-xs cursor-pointer"
              >
                💬 ¿Necesitas ayuda? Escríbenos al WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Lista de pedidos anteriores (si hay más de 1) */}
        {orders.length > 1 && (
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Pedidos anteriores</p>
            {orders.slice(1).map(prev => (
              <div key={prev.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-600">{prev.date || "—"}</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5 line-clamp-1">{prev.items}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-black text-red-600">S/ {Number(prev.total || 0).toFixed(2)}</p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{prev.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}