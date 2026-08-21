"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function OrderAlerts() {
  const [newOrder, setNewOrder] = useState<{ client: string; total: number } | null>(null);

  useEffect(() => {
    let isInitialLoad = true;

    // Escuchamos solo los pedidos que entren con estado PENDIENTE
    const q = query(collection(db, "orders"), where("status", "==", "PENDIENTE"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Ignoramos la primera carga para que no suene con los pedidos viejos
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }

      // Revisamos qué cambió en la base de datos
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const orderData = change.doc.data();
          
          // 1. REPRODUCIR SONIDO (Usamos un sonido gratuito alojado por Google)
          const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
          audio.play().catch(e => console.log("El navegador bloqueó el audio automático. Haz clic en la web primero.", e));

          // 2. MOSTRAR ALERTA VISUAL
          setNewOrder({
            client: orderData.client || "Cliente",
            total: orderData.total || 0
          });
          
          // Ocultar la alerta visual después de 6 segundos
          setTimeout(() => {
            setNewOrder(null);
          }, 6000);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  if (!newOrder) return null;

  return (
    <div className="fixed top-6 right-6 z-[99999] bg-red-600 text-white px-5 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-10 fade-in zoom-in duration-300 flex items-center gap-4 border-2 border-red-400">
      <div className="text-4xl animate-bounce">🛵</div>
      <div>
        <h3 className="font-black text-lg leading-none tracking-wide">¡NUEVO PEDIDO!</h3>
        <p className="text-sm font-medium mt-1">
          {newOrder.client} acaba de comprar por <span className="font-black">S/ {newOrder.total.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}