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
  const [locLoading, setLocLoading] = useState(false);

  const getLocation = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAddress(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
          setLocLoading(false);
        },
        () => {
          alert("No se pudo obtener la ubicación.");
          setLocLoading(false);
        }
      );
    } else {
      alert("Geolocalización no soportada.");
      setLocLoading(false);
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const orderRef = doc(collection(db, "orders"));
      const finalAddress = deliveryType === 'pickup' ? 'Recojo en tienda' : address;
      const customerData = { name, phone, address: finalAddress, deliveryType };

      await runTransaction(db, async (transaction) => {
        const productDocs = [];
        for (const item of cartItems) {
          const productRef = doc(db, "products", String(item.id));
          const productDoc = await transaction.get(productRef);
          if (!productDoc.exists()) {
            throw `El producto ${item.name} ya no existe.`;
          }
          productDocs.push({ item, productRef, productDoc });
        }

        for (const { item, productDoc } of productDocs) {
          const currentStock = productDoc.data().stock;
          if (currentStock < item.quantity) {
            throw `Stock insuficiente para ${item.name}. Disponibles: ${currentStock}`;
          }
        }

        for (const { item, productRef, productDoc } of productDocs) {
          const currentStock = productDoc.data().stock;
          transaction.update(productRef, { stock: currentStock - item.quantity });
        }

        transaction.set(orderRef, {
          customer: customerData,
          items: cartItems,
          total: cartItems.reduce((acc: number, i: any) => acc + (Number(i.price) * i.quantity), 0),
          status: "pendiente",
          createdAt: new Date().toISOString()
        });
      });

      const message = `Hola, nuevo pedido de *${name}* (${deliveryType === 'pickup' ? 'Recojo en tienda' : 'Envío a domicilio'}):\n` + 
                      cartItems.map((i: any) => `• ${i.quantity}x ${i.name}`).join('\n') +
                      `\n\nDirección/Modalidad: ${finalAddress}`;
      
      window.open(`https://wa.me/51950323959?text=${encodeURIComponent(message)}`, '_blank');

      alert("¡Pedido realizado con éxito!");
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert("Error al procesar: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[9999] font-sans">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white">Finalizar Compra</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleConfirmOrder} className="space-y-4">
          <input 
            required 
            type="text" 
            placeholder="Nombre completo" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 text-sm outline-none text-white" 
          />
          <input 
            required 
            type="text" 
            placeholder="Teléfono" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 text-sm outline-none text-white" 
          />
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryType('delivery')}
              className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${deliveryType === 'delivery' ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
            >
              🚚 Envío a domicilio
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType('pickup')}
              className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${deliveryType === 'pickup' ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
            >
              🏪 Recojo en tienda
            </button>
          </div>

          {deliveryType === 'delivery' && (
            <div className="space-y-2">
              <input 
                required 
                type="text" 
                placeholder="Dirección de entrega" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 text-sm outline-none text-white" 
              />
              <button 
                type="button" 
                onClick={getLocation} 
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-bold transition cursor-pointer text-white"
              >
                {locLoading ? "Buscando ubicación..." : "📍 Usar mi ubicación actual"}
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-red-600 rounded-xl font-black text-white hover:bg-red-700 cursor-pointer shadow-lg transition"
          >
            {loading ? "Procesando..." : "Confirmar Pedido"}
          </button>
        </form>
      </div>
    </div>
  );
}