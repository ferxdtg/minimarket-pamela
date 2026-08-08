'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, runTransaction, collection } from 'firebase/firestore';

export default function CheckoutModal({ cartItems, customerData, onClose }: any) {
  const [loading, setLoading] = useState(false);

  const handleConfirmOrder = async () => {
    setLoading(true);
    
    try {
      const orderRef = doc(collection(db, "orders"));

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

        // 2. Crear registro de pedido
        transaction.set(orderRef, {
          customer: customerData,
          items: cartItems,
          total: cartItems.reduce((acc: number, i: any) => acc + (Number(i.price) * i.quantity), 0),
          status: "pendiente",
          createdAt: new Date().toISOString()
        });
      });

      // 3. Envío a WhatsApp (Opcional, pero muy recomendado)
      const message = `Hola, nuevo pedido de ${customerData.name}:\n` + 
                      cartItems.map((i: any) => `- ${i.name} (x${i.quantity})`).join('\n') +
                      `\nTotal: S/ ${cartItems.reduce((a: number, b: any) => a + (Number(b.price) * b.quantity), 0).toFixed(2)}`;
      
      window.open(`https://wa.me/519XXXXXXXXX?text=${encodeURIComponent(message)}`, '_blank');

      alert("¡Pedido realizado con éxito!");
      onClose(); // Cerrar el modal
      
    } catch (error) {
      alert("Error al procesar pedido: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-sm">
        <h2 className="text-xl font-bold text-white mb-4">Confirmar Pedido</h2>
        <p className="text-zinc-400 text-sm mb-6">Al confirmar, el inventario se actualizará automáticamente.</p>
        
        <button 
          onClick={handleConfirmOrder}
          disabled={loading}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Confirmar Compra"}
        </button>
      </div>
    </div>
  );
}