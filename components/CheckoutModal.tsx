'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, runTransaction, collection } from 'firebase/firestore';

export default function CheckoutModal({ cartItems, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  
  const [address, setAddress] = useState('');
  const [reference, setReference] = useState(''); 
  const [locLoading, setLocLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('Yape'); 
  const [cashAmount, setCashAmount] = useState(''); 

  const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  const getLocation = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const mapsLink = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
          setAddress(mapsLink);
          setLocLoading(false);
        },
        () => {
          alert("No pudimos obtener tu GPS. Por favor activa la ubicación de tu celular o escribe tu dirección.");
          setLocLoading(false);
        },
        { enableHighAccuracy: true } 
      );
    } else {
      alert("Tu dispositivo no soporta geolocalización.");
      setLocLoading(false);
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const orderRef = doc(collection(db, "orders"));

      await runTransaction(db, async (transaction) => {
        // 🚀 PASO 1: LECTURAS (READS)
        const productsToUpdate: any[] = [];

        for (const item of cartItems) {
          const productRef = doc(db, "products", String(item.id));
          const productSnap = await transaction.get(productRef);
          
          if (!productSnap.exists()) {
            throw new Error(`El producto ${item.name} ya no existe.`);
          }
          
          const currentStock = productSnap.data().stock || 0;
          if (currentStock < item.quantity) {
            throw new Error(`Stock insuficiente para ${item.name}. Quedan ${currentStock}.`);
          }

          productsToUpdate.push({ ref: productRef, newStock: currentStock - item.quantity });
        }

        // 🚀 PASO 2: ESCRITURAS (WRITES)
        for (const productToUpdate of productsToUpdate) {
          transaction.update(productToUpdate.ref, { stock: productToUpdate.newStock });
        }

        const itemsDescription = cartItems.map((item: any) => `${item.quantity}x ${item.name}`).join(", ");
        const options: Intl.DateTimeFormatOptions = { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" };
        const todayDateStr = new Intl.DateTimeFormat("en-CA", options).format(new Date());

        transaction.set(orderRef, {
          client: name,
          phone: phone,
          address: deliveryType === 'delivery' ? `${address} (Ref: ${reference})` : 'Recojo en tienda',
          type: deliveryType === 'delivery' ? 'DELIVERY' : 'RECOJO',
          paymentMethod: paymentMethod,
          cashAmount: paymentMethod === 'Efectivo' ? cashAmount : 'N/A',
          items: itemsDescription,
          total: totalAmount,
          status: "PENDIENTE",
          date: todayDateStr,
          createdAt: new Date().toISOString()
        });
      });

      onSuccess();
      alert("¡Pedido confirmado con éxito! 🎉");
    } catch (error: any) {
      alert(`Lo sentimos, hubo un problema: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative my-auto animate-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white font-black text-xl transition">✕</button>
        
        <h2 className="text-xl font-black text-white mb-1">Finalizar Compra</h2>
        <p className="text-xs text-zinc-400 mb-5">Completaremos tu pedido de forma segura.</p>

        <form onSubmit={handleConfirmOrder} className="space-y-4 text-sm">
          
          <div className="space-y-3">
            <input required type="text" placeholder="Tu Nombre y Apellido" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-red-600 transition" />
            <input required type="tel" placeholder="Número de Celular / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-red-600 transition" />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setDeliveryType('delivery')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${deliveryType === 'delivery' ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-white'}`}>🛵 Delivery</button>
            <button type="button" onClick={() => setDeliveryType('pickup')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${deliveryType === 'pickup' ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-white'}`}>🏪 Recojo Tienda</button>
          </div>

          {deliveryType === 'delivery' && (
            <div className="space-y-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex gap-2">
                <input required type="text" placeholder="Dirección exacta o ubica tu GPS 📍" value={address} onChange={(e) => setAddress(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-red-600 transition text-xs" />
                <button type="button" onClick={getLocation} disabled={locLoading} className="px-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-lg transition border border-zinc-700 disabled:opacity-50" title="Usar mi GPS exacto">📍</button>
              </div>
              <input type="text" placeholder="Referencia de tu casa (Opcional)" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-red-600 transition" />
            </div>
          )}

          <div className="space-y-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/80">
            <p className="text-xs font-bold text-zinc-400">¿Cómo deseas pagar?</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setPaymentMethod("Yape")} className={`py-2 rounded-lg font-bold border transition cursor-pointer ${paymentMethod === "Yape" ? "bg-[#742284] border-[#742284] text-white shadow-[0_0_10px_rgba(116,34,132,0.5)]" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"}`}>Yape</button>
              <button type="button" onClick={() => setPaymentMethod("Plin")} className={`py-2 rounded-lg font-bold border transition cursor-pointer ${paymentMethod === "Plin" ? "bg-[#00E0C6] border-[#00E0C6] text-black shadow-[0_0_10px_rgba(0,224,198,0.5)]" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"}`}>Plin</button>
              <button type="button" onClick={() => setPaymentMethod("Efectivo")} className={`py-2 rounded-lg font-bold border transition cursor-pointer ${paymentMethod === "Efectivo" ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_10px_rgba(5,150,105,0.5)]" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"}`}>Efectivo</button>
            </div>
            
            {paymentMethod === "Efectivo" && (
              <input required type="number" step="0.5" placeholder="¿Con cuánto billete pagas? (Para el vuelto)" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} className="w-full mt-2 bg-zinc-950 border border-emerald-900/50 p-3 rounded-xl text-emerald-400 outline-none focus:border-emerald-500 transition" />
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-xl font-black text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] transition-all disabled:opacity-50 mt-4 text-base cursor-pointer">
            {loading ? "Verificando stock..." : `Confirmar Pedido (S/ ${totalAmount.toFixed(2)})`}
          </button>
        </form>
      </div>
    </div>
  );
}