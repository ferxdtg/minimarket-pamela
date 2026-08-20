"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  items?: CartItem[];
  onUpdateQuantity?: (id: string, delta: number) => void;
  onClearCart?: () => void;
}

export default function CartDrawer({ isOpen = false, onClose = () => {}, items = [], onUpdateQuantity = () => {}, onClearCart = () => {} }: CartDrawerProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [orderType, setOrderType] = useState<"DELIVERY" | "RECOJO">("DELIVERY");
  const [loading, setLoading] = useState(false);

  // Estados para Pamela Coins
  const [clientPoints, setClientPoints] = useState(0);
  const [useCoins, setUseCoins] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = orderType === "DELIVERY" ? 5.00 : 0.00;
  
  // Descuento por puntos (100 Coins = S/ 1.00 de descuento)
  const discountFromCoins = useCoins ? Math.min(subtotal, clientPoints / 100) : 0;
  const total = Math.max(0, subtotal + deliveryFee - discountFromCoins);

  // Monedas ganadas en esta compra (10 Coins por cada Sol gastado)
  const coinsEarned = Math.floor(total * 10);

  // Verificar si el cliente ya tiene puntos guardados al escribir su teléfono
  const handlePhoneBlur = async () => {
    if (!clientPhone || clientPhone.length < 6) return;
    try {
      const docRef = doc(db, "customers", clientPhone.trim());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setClientPoints(Number(data.points || 0));
      } else {
        setClientPoints(0);
      }
    } catch (error) {
      console.error("Error buscando cliente:", error);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      const itemsSummary = items.map(i => `${i.quantity}x ${i.name}`).join(", ");
      const todayStr = new Date().toISOString().split("T")[0];

      // 1. Guardar la orden en Firebase y descontar stock automáticamente
      for (const item of items) {
        if (item.id) {
          const productRef = doc(db, "products", String(item.id));
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const currentStock = Number(productSnap.data().stock || 0);
            const newStock = Math.max(0, currentStock - item.quantity);
            await updateDoc(productRef, { stock: newStock });
          }
        }
      }

      // 2. Calcular y actualizar las Pamela Coins del cliente en Firebase
      const customerRef = doc(db, "customers", clientPhone.trim());
      const customerSnap = await getDoc(customerRef);
      let finalPoints = coinsEarned;

      if (customerSnap.exists()) {
        const existingPoints = Number(customerSnap.data().points || 0);
        const spentPoints = useCoins ? Math.floor(discountFromCoins * 100) : 0;
        finalPoints = Math.max(0, existingPoints - spentPoints) + coinsEarned;
        await updateDoc(customerRef, {
          name: clientName,
          address: clientAddress,
          points: finalPoints,
          lastOrderDate: todayStr
        });
      } else {
        await updateDoc(customerRef, {
          name: clientName,
          address: clientAddress,
          points: finalPoints,
          lastOrderDate: todayStr
        }).catch(async () => {
          await addDoc(collection(db, "customers"), {
            phone: clientPhone.trim(),
            name: clientName,
            address: clientAddress,
            points: finalPoints
          });
        });
      }

      // 3. Registrar el pedido en la colección 'orders'
      await addDoc(collection(db, "orders"), {
        client: clientName,
        phone: clientPhone,
        address: clientAddress,
        type: orderType,
        items: itemsSummary,
        subtotal,
        discount: discountFromCoins,
        total,
        status: "PENDIENTE",
        date: todayStr,
        createdAt: new Date().toISOString()
      });

      // 4. Armar mensaje estructurado para WhatsApp
      const adminWhatsApp = "51950323959";
      const message = encodeURIComponent(
        `*🛒 ¡NUEVO PEDIDO - MINIMARKET PAMELA!*
----------------------------------
👤 *Cliente:* ${clientName}
📱 *Teléfono:* ${clientPhone}
🏠 *Dirección:* ${clientAddress}
🛵 *Tipo:* ${orderType}

📦 *PRODUCTOS:*
${items.map(i => `- ${i.quantity}x ${i.name} (S/ ${(i.price * i.quantity).toFixed(2)})`).join("\n")}

----------------------------------
💳 *Subtotal:* S/ ${subtotal.toFixed(2)}
${useCoins ? `🪙 *Descuento Pamela Coins:* -S/ ${discountFromCoins.toFixed(2)}\n` : ""}💰 *TOTAL A PAGAR:* *S/ ${total.toFixed(2)}*
----------------------------------
✨ *Puntos ganados hoy:* +${coinsEarned} Pamela Coins
🪙 *Total puntos en cuenta:* ${finalPoints} Coins`
      );

      onClearCart();
      onClose();
      window.open(`https://wa.me/${adminWhatsApp}?text=${message}`, "_blank");
    } catch (error: any) {
      alert(`Error al procesar el pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        
        {/* Cabecera */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-base font-black text-slate-900">Tu Carrito de Compras 🛒</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 transition">
            ✕
          </button>
        </div>

        {/* Contenido del Carrito */}
        <div className="p-4 flex-1 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <span className="text-5xl">🛒</span>
              <p className="text-slate-500 font-medium text-sm">Tu carrito está vacío.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs font-black text-red-600">S/ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="font-black text-slate-500 hover:text-red-600 w-5 text-center">-</button>
                    <span className="text-xs font-black text-slate-900 w-5 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="font-black text-slate-500 hover:text-red-600 w-5 text-center">+</button>
                  </div>
                </div>
              ))}

              {/* 🪙 BANNER VISUAL DE PAMELA COINS */}
              <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-yellow-500/15 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl animate-bounce shrink-0 shadow-inner">
                    🪙
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-600 uppercase tracking-wide">¡Ganas Pamela Coins!</p>
                    <p className="text-[11px] text-slate-600 font-medium">Acumulas monedas canjeables para tus antojos</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow-sm inline-block">
                    +{coinsEarned} Coins
                  </span>
                </div>
              </div>

              {/* Formulario de Datos y Canje de Puntos */}
              <form onSubmit={handleCheckout} className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Datos de Entrega</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType("DELIVERY")}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${orderType === "DELIVERY" ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    🛵 Delivery (S/ 5.00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("RECOJO")}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${orderType === "RECOJO" ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    🏪 Recojo en Tienda
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. María Pérez"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Número de Celular / WhatsApp</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    onBlur={handlePhoneBlur}
                    placeholder="Ej. 950323959"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                {clientPoints > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-amber-800">🪙 Tienes {clientPoints} Pamela Coins</span>
                      <span className="font-black text-emerald-600">Equivale a S/ {(clientPoints / 100).toFixed(2)}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-amber-200/60">
                      <input
                        type="checkbox"
                        checked={useCoins}
                        onChange={(e) => setUseCoins(e.target.checked)}
                        className="accent-amber-500 w-4 h-4 rounded"
                      />
                      <span className="text-xs font-bold text-amber-900">Aplicar descuento con mis Pamela Coins</span>
                    </label>
                  </div>
                )}

                {orderType === "DELIVERY" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Dirección de Entrega</label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Ej. Av. Los Pinos 204"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === "DELIVERY" && (
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery:</span>
                      <span>S/ {deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {useCoins && (
                    <div className="flex justify-between text-amber-600 font-bold">
                      <span>Descuento Coins:</span>
                      <span>-S/ {discountFromCoins.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200 text-sm">
                    <span>TOTAL A PAGAR:</span>
                    <span className="text-red-600">S/ {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition shadow-lg shadow-emerald-600/20 cursor-pointer text-xs"
                >
                  {loading ? "Procesando pedido..." : "Enviar Pedido a WhatsApp 📱"}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}