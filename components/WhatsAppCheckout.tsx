"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { collection, doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WhatsAppCheckout({ cartItems, totalAmount, onClose }: { cartItems: any[]; totalAmount: number; onClose?: () => void }) {
  const { clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "RECOJO">("DELIVERY");
  
  const [paymentMethod, setPaymentMethod] = useState("Yape");
  const [cashAmount, setCashAmount] = useState("");

  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const getLocation = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const mapsLink = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
          setCustomerAddress(mapsLink);
          setLocLoading(false);
        },
        () => {
          alert("No pudimos obtener tu GPS. Por favor activa la ubicación de tu celular o escribe tu dirección.");
          setLocLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Tu navegador no soporta GPS.");
      setLocLoading(false);
    }
  };

  const handleWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert("Por favor ingresa tu nombre y teléfono.");
      return;
    }

    setLoading(true);

    try {
      const orderRef = doc(collection(db, "orders"));

      await runTransaction(db, async (transaction) => {
        // 🚀 PASO 1: TODAS LAS LECTURAS (READS) PRIMERO
        const productsToUpdate: any[] = [];
        
        for (const item of cartItems) {
          const productRef = doc(db, "products", String(item.id));
          const productSnap = await transaction.get(productRef);
          
          if (!productSnap.exists()) {
            throw new Error(`El producto ${item.name} ya no está disponible.`);
          }
          
          const currentStock = productSnap.data().stock || 0;
          if (currentStock < item.quantity) {
            throw new Error(`Solo quedan ${currentStock} unidades de ${item.name}.`);
          }
          
          // Guardamos en memoria lo que vamos a descontar luego
          productsToUpdate.push({ ref: productRef, newStock: currentStock - item.quantity });
        }

        // 🚀 PASO 2: TODAS LAS ESCRITURAS (WRITES) DESPUÉS (Regla estricta de Firebase)
        for (const productToUpdate of productsToUpdate) {
          transaction.update(productToUpdate.ref, { stock: productToUpdate.newStock });
        }

        const itemsDescription = cartItems.map(item => `${item.quantity}x ${item.name}`).join(", ");
        const options: Intl.DateTimeFormatOptions = { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" };
        const todayStr = new Intl.DateTimeFormat("en-CA", options).format(new Date());

        transaction.set(orderRef, {
          client: customerName,
          phone: customerPhone,
          address: deliveryType === "DELIVERY" ? customerAddress || "No especificada" : "Recojo en tienda",
          type: deliveryType,
          paymentMethod: paymentMethod,
          cashAmount: paymentMethod === "Efectivo" ? cashAmount : "N/A",
          items: itemsDescription,
          total: totalAmount,
          status: "PENDIENTE",
          date: todayStr,
          createdAt: new Date().toISOString()
        });
      });

      const adminPhone = "51950323959";
      let message = `*NUEVO PEDIDO - MINIMARKET PAMELA* 🛒\n\n`;
      message += `*Cliente:* ${customerName}\n`;
      message += `*Teléfono:* ${customerPhone}\n`;
      message += `*Tipo:* ${deliveryType === "DELIVERY" ? "🛵 Delivery" : "🏪 Recojo en Tienda"}\n`;
      if (deliveryType === "DELIVERY") {
        message += `*Dirección/GPS:* ${customerAddress}\n`;
      }
      
      message += `*Método de Pago:* ${paymentMethod}\n`;
      if (paymentMethod === "Efectivo") {
        message += `*Paga con:* S/ ${cashAmount || "Monto no especificado"} (Llevar vuelto)\n`;
      }

      message += `\n*Detalle del Pedido:*\n`;
      cartItems.forEach(item => {
        message += `▪️ ${item.quantity}x ${item.name} (S/ ${Number(item.price).toFixed(2)})\n`;
      });
      message += `\n*TOTAL A PAGAR: S/ ${totalAmount.toFixed(2)}*\n\n`;
      message += `_Por favor, confírmame el pedido. ¡Gracias!_`;

      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

      clearCart();
      if (onClose) onClose();
      window.open(whatsappUrl, "_blank");

    } catch (error: any) {
      alert(`No pudimos procesar el pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white font-black py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mb-2"
      >
        <span>Pedir por WhatsApp</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </button>
    );
  }

  return (
    <div className="bg-zinc-950/50 p-3 rounded-xl border border-[#25D366]/30 mb-2 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-[#25D366]">Datos para WhatsApp</h4>
        <button onClick={() => setIsExpanded(false)} className="text-zinc-500 hover:text-white text-xs cursor-pointer font-black">✕</button>
      </div>
      
      <form onSubmit={handleWhatsAppOrder} className="space-y-2.5">
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button type="button" onClick={() => setDeliveryType("DELIVERY")} className={`flex-1 py-1.5 text-[10px] font-bold rounded cursor-pointer transition ${deliveryType === "DELIVERY" ? "bg-[#25D366] text-white" : "text-zinc-500 hover:text-white"}`}>Delivery</button>
          <button type="button" onClick={() => setDeliveryType("RECOJO")} className={`flex-1 py-1.5 text-[10px] font-bold rounded cursor-pointer transition ${deliveryType === "RECOJO" ? "bg-[#25D366] text-white" : "text-zinc-500 hover:text-white"}`}>Recojo</button>
        </div>

        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Tu Nombre *" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#25D366]" required />
        <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Teléfono / WhatsApp *" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#25D366]" required />
        
        {deliveryType === "DELIVERY" && (
          <div className="flex gap-2">
            <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Dirección o GPS 📍*" className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#25D366]" required />
            <button type="button" onClick={getLocation} disabled={locLoading} className="px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-base transition disabled:opacity-50 flex items-center justify-center cursor-pointer" title="Compartir mi GPS">📍</button>
          </div>
        )}

        <div className="pt-1">
          <p className="text-[10px] font-bold text-zinc-400 mb-1.5">Método de pago:</p>
          <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button type="button" onClick={() => setPaymentMethod("Yape")} className={`flex-1 py-1.5 text-[10px] font-bold rounded cursor-pointer transition ${paymentMethod === "Yape" ? "bg-[#742284] text-white" : "text-zinc-500 hover:text-white"}`}>Yape</button>
            <button type="button" onClick={() => setPaymentMethod("Plin")} className={`flex-1 py-1.5 text-[10px] font-bold rounded cursor-pointer transition ${paymentMethod === "Plin" ? "bg-[#00E0C6] text-black" : "text-zinc-500 hover:text-white"}`}>Plin</button>
            <button type="button" onClick={() => setPaymentMethod("Efectivo")} className={`flex-1 py-1.5 text-[10px] font-bold rounded cursor-pointer transition ${paymentMethod === "Efectivo" ? "bg-emerald-600 text-white" : "text-zinc-500 hover:text-white"}`}>Efectivo</button>
          </div>
        </div>

        {paymentMethod === "Efectivo" && (
          <input 
            type="number" 
            step="0.5" 
            value={cashAmount} 
            onChange={e => setCashAmount(e.target.value)} 
            placeholder="¿Con cuánto billete pagas? *" 
            className="w-full bg-zinc-900 border border-emerald-900/50 rounded-lg p-2 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 mt-1" 
            required 
          />
        )}

        <button type="submit" disabled={loading} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-2.5 px-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer border border-[#128C7E]/50 mt-3 disabled:opacity-50">
          {loading ? "Verificando stock..." : "Enviar Pedido 💬"}
        </button>
      </form>
    </div>
  );
}