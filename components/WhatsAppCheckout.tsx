"use client";

import { useState } from "react";

export default function WhatsAppCheckout({ cartItems, totalAmount, onClose }: { cartItems: any[]; totalAmount: number; onClose?: () => void }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "RECOJO">("DELIVERY");

  const handleWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert("Por favor ingresa tu nombre y teléfono.");
      return;
    }

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
    if (onClose) onClose();
  };

  return (
    <div className="relative group w-full">
      {/* Efecto de brillo de fondo */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300"></div>

      <form onSubmit={handleWhatsAppOrder} className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Método de Entrega</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDeliveryType("DELIVERY")}
            className={`py-2 px-2 rounded-xl font-bold text-xs border transition cursor-pointer text-center ${
              deliveryType === "DELIVERY" ? "bg-red-600 border-red-500 text-white shadow-md" : "bg-zinc-950 border-zinc-800 text-zinc-400"
            }`}
          >
            🛵 Delivery
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType("RECOJO")}
            className={`py-2 px-2 rounded-xl font-bold text-xs border transition cursor-pointer text-center ${
              deliveryType === "RECOJO" ? "bg-red-600 border-red-500 text-white shadow-md" : "bg-zinc-950 border-zinc-800 text-zinc-400"
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
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
          required
        />

        <input
          type="tel"
          value={customerPhone}
          onChange={e => setCustomerPhone(e.target.value)}
          placeholder="Teléfono / WhatsApp *"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
          required
        />

        {deliveryType === "DELIVERY" && (
          <input
            type="text"
            value={customerAddress}
            onChange={e => setCustomerAddress(e.target.value)}
            placeholder="Dirección exacta *"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
            required
          />
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer border border-emerald-400/30"
        >
          <span className="text-lg animate-bounce">💬</span>
          <span>Pedir al WhatsApp ahora ⚡</span>
        </button>
      </form>
    </div>
  );
}