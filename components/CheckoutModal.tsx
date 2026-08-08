'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, runTransaction, collection } from 'firebase/firestore';

export default function CheckoutModal({ cartItems, onClose }: any) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Por favor ingresa tu nombre y teléfono.");
      return;
    }

    setLoading(true);
    
    try {
      const orderRef = doc(collection(db, "orders"));
      const customerData = { name, phone, address };

      await runTransaction(db, async (transaction) => {
        // 1. Verificación y Descuento de Stock
        for (const item of cartItems) {
          const productRef = doc(db, "products", String(item.id));
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) throw `El producto ${item.name} no existe.`;
          
          const currentStock = productDoc.data().stock;
          if (currentStock < item.quantity) throw `Stock insuficiente para ${item.name}.`;
          
          transaction.update(productRef, { stock: currentStock - item.quantity });
        }

        // 2. Crear registro de pedido en Firestore
        transaction.set(orderRef, {
          customer: customerData,
          items: cartItems,
          total: cartItems.reduce((acc: number, i: any) => acc + (Number(i.price) * i.quantity), 0),
          status: "pendiente",
          createdAt: new Date().toISOString()
        });
      });

      // 3. Envío automático a WhatsApp (Reemplaza los 9 con tu número real de celular, ej: 51987654321)
      const message = `Hola, nuevo pedido de *${name}*:\n` + 
                      cartItems.map((i: any) => `• ${i.quantity}x ${i.name} (S/ ${(i.price * i.quantity).toFixed(2)})`).join('\n') +
                      `\n\n*Total a pagar: S/ ${cartItems.reduce((a: number, b: any) => a + (Number(b.price) * b.quantity), 0).toFixed(2)}*\nDirección: ${address || 'No especificada'}`;
      
      window.open(`https://wa.me/519XXXXXXXXX?text=${encodeURIComponent(message)}`, '_blank');

      alert("¡Pedido realizado con éxito!");
      onClose();
      
    } catch (error) {
      alert("Error al procesar pedido: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md space-y-5 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Completar Datos del Pedido</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer font-bold">✕</button>
        </div>
        
        <form onSubmit={handleConfirmOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Nombre y Apellido</label>
            <input required type="text" placeholder="Ej. Juan Pérez" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-sm text-white outline-none focus:border-red-600" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Teléfono / WhatsApp</label>
            <input required type="text" placeholder="Ej. 999888777" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-sm text-white outline-none focus:border-red-600" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Dirección de Entrega</label>
            <input type="text" placeholder="Ej. Av. Larco 123" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-sm text-white outline-none focus:border-red-600" />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm cursor-pointer shadow-lg disabled:opacity-50 mt-2 transition"
          >
            {loading ? "Procesando..." : "Confirmar y Enviar Pedido"}
          </button>
        </form>
      </div>
    </div>
  );
}