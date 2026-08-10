"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WhatsAppCheckout({ cartItems, totalAmount, onClose }: { cartItems: any[]; totalAmount: number; onClose?: () => void }) {
  const { clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "RECOJO">("DELIVERY");
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert("Por favor ingresa tu nombre y teléfono.");
      return;
    }

    setLoading(true);
    const todayStr = new Date().toISOString().split("T")[0];
    const itemsDescription = cartItems.map(item => `${item.quantity}x ${item.name}`).join(", ");

    try {
      // 1. Guardar el pedido en Firebase Firestore (Colección "orders")
      await addDoc(collection(db, "orders"), {
        client: customerName,
        phone: customerPhone,
        address: deliveryType === "DELIVERY" ? (customerAddress || "No especificada") : "Recojo en Tienda",
        type: deliveryType,
        items: itemsDescription,
        total: totalAmount,
        status: "PENDIENTE",
        date: todayStr,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error al registrar pedido en Firebase:", error);
    } finally {
      setLoading(false);
    }

    // 2. Armar el mensaje de WhatsApp
    const phoneNumber = "51950323959"; 
    const typeText = deliveryType === "DELIVERY" ? "🛵 Envío a Domicilio" : "🏪 Recojo en Local";

    let message = "¡Hola, Minimarket Pamela! 👋 Quiero confirmar mi pedido:\n\n";
    message += `👤 *Cliente:* ${customerName}\n`;
    message += `📱 *Teléfono:* ${customerPhone}\n`;
    message += `📍 *Tipo de Entrega:* ${typeText}\n`;
    if (deliveryType === "DELIVERY") {
      message += `🏠 *Dirección:* ${customerAddress || "No especificada"}\n`;
    }
    message += `\n*Detalle del carrito:*\n`;
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} x${item.quantity} — S/ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n*Total a pagar: S/ ${totalAmount.toFixed(2)}*\n\nPor favor, confirmar el pedido. ¡Gracias! 🚀`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");

    // 3. Marcar éxito y limpiar carrito
    setIsSuccess(true);
    if (typeof clearCart === "function") {
      clearCart();
    }
  };

  return (
    <div className="relative group w-full space-y-2">
      {isSuccess ? (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-center space-y-3 animate-fadeIn">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
            ✓
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-emerald-300">¡Se procesó su compra con éxito!</h4>
            <p className="text-[11px] text-zinc-300">El local de Minimarket Pamela se encuentra preparando su pedido 👨‍🍳📦</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setIsExpanded(false);
              if (onClose) onClose();
            }}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            ← Volver a la tienda
          </button>
        </div>
      ) : !isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer border border-emerald-400/30"
        >
          <span className="text-base animate-bounce">💬</span>
          <span>Proceder al Pago por WhatsApp ⚡</span>
        </button>
      ) : (
        <form onSubmit={handleWhatsAppOrder} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2.5 shadow-xl animate-fadeIn">
          <div className="flex justify-between items-center pb-1 border-b border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Método de Entrega</span>
            <button 
              type="button" 
              onClick={() => setIsExpanded(false)}
              className="text-zinc-500 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 cursor-pointer"
            >
              ▲ Ocultar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setDeliveryType("DELIVERY")}
              className={`py-2 px-2 rounded-lg font-bold text-[11px] border transition cursor-pointer text-center ${
                deliveryType === "DELIVERY" ? "bg-red-600 border-red-500 text-white shadow-md" : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
            >
              🛵 Delivery
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType("RECOJO")}
              className={`py-2 px-2 rounded-lg font-bold text-[11px] border transition cursor-pointer text-center ${
                deliveryType === "RECOJO" ? "bg-red-600 border-red-500 text-white shadow-md" : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
            >
              🏪 Recojo Local
            </button>
          </div>

          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Tu Nombre *"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-600"
            required
          />

          <input
            type="tel"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            placeholder="Teléfono / WhatsApp *"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-600"
            required
          />

          {deliveryType === "DELIVERY" && (
            <input
              type="text"
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value)}
              placeholder="Dirección exacta *"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-600"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-2.5 px-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer border border-emerald-400/30 mt-1 disabled:opacity-50"
          >
            <span>{loading ? "Registrando pedido..." : "Enviar Pedido por WhatsApp 🚀"}</span>
          </button>
        </form>
      )}
    </div>
  );
}