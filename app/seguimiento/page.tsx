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
      // Buscamos órdenes que coincidan con el número de teléfono
      const q = query(collection(db, "orders"), where("phone", "==", phone.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Ordenamos en memoria para obtener estrictamente el pedido más reciente
        const allOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allOrders.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA; // Mayor a menor (Más reciente primero)
        });
        
        setOrder(allOrders[0]);
      }
    } catch (error) {
      console.error("Error buscando orden:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📍 Definimos los pasos y estados
  const getStepIndex = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDIENTE": return 1;
      case "PREPARANDO": return 2;
      case "EN_CAMINO": return 3;
      case "ENTREGADO": return 4;
      default: return 0; // Para RECHAZADO o NO_RECOGIDO
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;
  const isErrorState = order?.status === "RECHAZADO" || order?.status === "NO_RECOGIDO";

  return (
    <main className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* CABECERA VIBRANTE */}
        <div className="text-center space-y-3">
          <span className="bg-red-50 text-red-600 border border-red-100 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
            Radar en Vivo 📡
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Rastrea tu Pedido
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">
            Ingresa tu número de WhatsApp para ver el estado de tu compra en tiempo real.
          </p>
        </div>

        {/* FORMULARIO DE BÚSQUEDA */}
        <div className="bg-white p-4 sm:p-6 rounded-[2rem] border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative z-10">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 950323959"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-base font-bold focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all text-center sm:text-left"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-black text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : "Buscar 🔍"}
            </button>
          </form>
        </div>

        {/* RESULTADO VACÍO */}
        {searched && !loading && !order && (
          <div className="bg-white p-10 rounded-[2.5rem] text-center border border-dashed border-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🧐
            </div>
            <h3 className="text-xl font-black text-slate-800">No encontramos tu pedido</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Verifica que el número sea exactamente el mismo que usaste al confirmar tu compra en WhatsApp.</p>
          </div>
        )}

        {/* TARJETA DE RESULTADO ENCONTRADO */}
        {order && (
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Tu Orden</p>
                <h3 className="text-xl font-black text-slate-900 leading-none">{order.client}</h3>
                <span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded uppercase ${order.type === "DELIVERY" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                  {order.type}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Monto Total</p>
                <p className="text-2xl font-black text-red-600 leading-none">S/ {Number(order.total || 0).toFixed(2)}</p>
              </div>
            </div>

            {/* ESTADOS DE ERROR (Rechazado / No Recogido) */}
            {isErrorState ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
                <div className="text-4xl mb-2">⚠️</div>
                <h4 className="text-lg font-black text-red-700 uppercase tracking-tight">Pedido {order.status}</h4>
                <p className="text-sm text-red-600 font-medium">Tuvimos un inconveniente con tu orden. Por favor, comunícate con nosotros para solucionarlo.</p>
              </div>
            ) : (
              /* BARRA DE PROGRESO DE 4 PASOS */
              <div className="space-y-8 py-2 relative">
                
                {/* Línea conectora de fondo */}
                <div className="absolute top-[4.5rem] left-[12%] right-[12%] h-1 bg-slate-100 rounded-full -z-10"></div>
                
                {/* Línea conectora activa (Llena el progreso) */}
                <div className={`absolute top-[4.5rem] left-[12%] h-1 bg-red-600 rounded-full transition-all duration-1000 ease-out -z-10`} style={{ width: `${(currentStep - 1) * 33.33}%` }}></div>

                <div className="flex justify-between relative z-0">
                  {/* Paso 1: Recibido */}
                  <div className="text-center w-1/4 space-y-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full flex items-center justify-center text-lg sm:text-xl transition-all duration-500 ${currentStep >= 1 ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}`}>
                      📝
                    </div>
                    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>Recibido</p>
                  </div>

                  {/* Paso 2: Preparando */}
                  <div className="text-center w-1/4 space-y-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full flex items-center justify-center text-lg sm:text-xl transition-all duration-500 delay-150 ${currentStep >= 2 ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}`}>
                      🍳
                    </div>
                    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>Preparando</p>
                  </div>

                  {/* Paso 3: En Camino / En Local */}
                  <div className="text-center w-1/4 space-y-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full flex items-center justify-center text-lg sm:text-xl transition-all duration-500 delay-300 ${currentStep >= 3 ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}`}>
                      {order.type === "DELIVERY" ? "🛵" : "🏪"}
                    </div>
                    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${currentStep >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                      {order.type === "DELIVERY" ? "En Camino" : "Listo"}
                    </p>
                  </div>

                  {/* Paso 4: Entregado */}
                  <div className="text-center w-1/4 space-y-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full flex items-center justify-center text-lg sm:text-xl transition-all duration-500 delay-500 ${currentStep >= 4 ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}`}>
                      🎉
                    </div>
                    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${currentStep >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>Entregado</p>
                  </div>
                </div>
              </div>
            )}

            {/* DETALLE Y SOPORTE */}
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detalle de la compra</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{order.items}</p>
              </div>

              <a
                href={`https://wa.me/51950323959?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20pedido%20a%20nombre%20de%20${order.client}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 font-bold text-center py-4 rounded-xl transition-colors text-xs cursor-pointer"
              >
                💬 ¿Necesitas ayuda con tu pedido? Escríbenos al WhatsApp
              </a>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}