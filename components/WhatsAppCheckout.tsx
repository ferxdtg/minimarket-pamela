"use client";

import { useCart } from "@/lib/CartContext";

export default function WhatsAppCheckout() {
  const { cart } = useCart();

  if (cart.length === 0) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleWhatsAppOrder = () => {
    const phoneNumber = "51950323959"; 

    let message = "¡Hola, Minimarket Pamela! 👋 Quiero confirmar mi pedido:\n\n";
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} x${item.quantity} — S/ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n*Total a pagar: S/ ${total.toFixed(2)}*\n\nPor favor, confirmar el envío express. ¡Gracias! 🚀`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="relative group">
      {/* Efecto de brillo de fondo (Glow sutil en verde) para atraer la mirada */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300"></div>

      <button
        onClick={handleWhatsAppOrder}
        className="relative w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-4 px-5 rounded-2xl shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-3 text-base cursor-pointer border border-emerald-400/30"
      >
        <span className="text-2xl animate-bounce">💬</span>
        <div className="text-left">
          <div className="leading-tight">Pedir al WhatsApp ahora</div>
          <div className="text-[11px] text-emerald-100 font-medium tracking-wide">
            Atención inmediata y personalizada ⚡
          </div>
        </div>
      </button>
    </div>
  );
}