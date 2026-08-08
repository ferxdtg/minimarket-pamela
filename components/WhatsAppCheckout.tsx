"use client";

import { useCart } from "@/lib/CartContext";

export default function WhatsAppCheckout() {
  const { cart } = useCart();

  if (cart.length === 0) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleWhatsAppOrder = () => {
    // Reemplaza este número con el número de WhatsApp real de Minimarket Pamela (formato internacional sin el +)
    const phoneNumber = "51900000000"; 

    let message = "Hola! 👋 Vengo de *Minimarket Pamela* y quiero hacer el siguiente pedido:\n\n";
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} x${item.quantity} - S/${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n*Total a pagar: S/${total.toFixed(2)}*\n\nPor favor confirmar disponibilidad y envío. ¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppOrder}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer mt-3"
    >
      <span>💬 Pedir por WhatsApp</span>
    </button>
  );
}