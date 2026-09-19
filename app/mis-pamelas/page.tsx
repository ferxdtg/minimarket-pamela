"use client";

import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function MisPamelasPage() {
  const [phone, setPhone] = useState("");
  const [customerData, setCustomerData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length !== 9 || !cleanPhone.startsWith("9")) {
      setErrorMsg("Ingresa un número de celular peruano válido (9 dígitos, empezando con 9).");
      return;
    }
    
    setLoading(true);
    setSearched(false);

    try {
      const docRef = doc(db, "customers", cleanPhone);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCustomerData(docSnap.data());
      } else {
        setCustomerData({ name: "Vecino", points: 0 });
      }
      setSearched(true);
    } catch (error) {
      console.error("Error al buscar monedas:", error);
      setErrorMsg("Hubo un problema al consultar el sistema. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const points = customerData?.points || 0;
  const discountValue = (points / 100).toFixed(2);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      
      {/* 🌟 EFECTOS DE BRILLO Y LUCES DE FONDO (Glow Effects) */}
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-yellow-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* ENCABEZADO */}
      <div className="max-w-md w-full mx-auto flex justify-between items-center pt-2 relative z-10">
        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
          ← Volver al Minimarket
        </Link>
        <span className="text-xs font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Pamela Coins 🪙
        </span>
      </div>

      {/* CONTENEDOR CENTRAL */}
      <div className="max-w-md w-full mx-auto my-auto text-center space-y-6 relative z-10 py-8">
        
        {!searched ? (
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner animate-bounce" style={{ animationDuration: '2s' }}>
              🪙
            </div>
            
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Consulta tus Pamela Coins</h1>
              <p className="text-xs text-slate-400 mt-1">Digita tu número de celular para descubrir tus recompensas acumuladas.</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-400 rounded-xl text-xs font-bold text-left animate-in fade-in">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-3">
              <input
                type="tel"
                maxLength={9}
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrorMsg(""); }}
                placeholder="Ej. 950000000"
                autoComplete="tel"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center text-amber-400 font-black text-lg focus:outline-none focus:border-amber-500 shadow-inner tracking-wider"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-all active:scale-95 cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? "Buscando billetera..." : "Consultar mis monedas ✨"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 backdrop-blur-2xl border-2 border-amber-500/50 p-8 sm:p-10 rounded-[3rem] shadow-[0_0_60px_rgba(245,158,11,0.25)] space-y-6 animate-in zoom-in-95 fade-in duration-500 relative overflow-hidden">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/30 blur-3xl pointer-events-none"></div>

            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-30"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 rounded-full flex items-center justify-center text-4xl font-black shadow-[0_0_30px_rgba(245,158,11,0.7)] border-2 border-white/50 animate-bounce">
                🪙
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-3.5 py-1.5 rounded-full border border-amber-500/40 shadow-sm inline-block">
                ¡Felicidades, {customerData?.name || "Vecino"}! 🎉
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter pt-2 drop-shadow-md">
                {points} <span className="text-xl sm:text-2xl text-amber-400 font-bold">Coins</span>
              </h2>
              <p className="text-xs text-slate-200 font-medium pt-1">
                Equivalente a <strong className="text-emerald-400 font-black text-sm bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">S/ {discountValue}</strong> de descuento directo.
              </p>
            </div>

            <div className="bg-slate-950/90 border border-amber-500/20 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed shadow-inner">
              ✨ <strong className="text-amber-400 font-bold">¡Canjéalos en tu siguiente compra!</strong> Solo ingresa este mismo número al momento de pagar tu carrito en la web.
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href="/"
                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black rounded-2xl shadow-[0_8px_25px_rgba(220,38,38,0.4)] transition-all active:scale-95 text-xs uppercase tracking-wider block text-center border border-red-500/30"
              >
                Ir a gastar mis monedas 🛒
              </Link>
              <button
                type="button"
                onClick={() => setSearched(false)}
                className="text-[11px] font-bold text-slate-400 hover:text-white transition py-2 cursor-pointer"
              >
                ← Consultar otro número
              </button>
            </div>

          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="max-w-md mx-auto text-center text-[10px] text-slate-600 relative z-10 pb-2">
        © 2026 Minimarket Pamela • Sistema Exclusivo de Recompensas
      </div>

    </main>
  );
}