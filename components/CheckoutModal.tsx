'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, runTransaction, collection } from 'firebase/firestore';
import Link from 'next/link';

export default function CheckoutModal({ cartItems, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [reference, setReference] = useState(''); 
  const [locLoading, setLocLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Yape' | 'Plin' | 'Efectivo'>('Yape'); 
  const [cashAmount, setCashAmount] = useState(''); 
  const [errorMsg, setErrorMsg] = useState('');
  const [orderCompleted, setOrderCompleted] = useState<any | null>(null);

  const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  const getLocation = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `📍 Coordenadas: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setAddress(coords);
          setLocLoading(false);
        },
        () => {
          setErrorMsg("No pudimos obtener tu GPS. Por favor escribe tu dirección.");
          setLocLoading(false);
        },
        { enableHighAccuracy: true } 
      );
    } else {
      setErrorMsg("Tu dispositivo no soporta geolocalización.");
      setLocLoading(false);
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.trim();
    if (cleanPhone.length !== 9 || !cleanPhone.startsWith('9')) {
      setErrorMsg("Ingresa un celular peruano válido (9 dígitos, empezando con 9).");
      return;
    }

    setLoading(true);
    
    try {
      const orderRef = doc(collection(db, "orders"));

      await runTransaction(db, async (transaction) => {
        const productsToUpdate: any[] = [];

        for (const item of cartItems) {
          const productRef = doc(db, "products", String(item.id));
          const productSnap = await transaction.get(productRef);
          
          if (!productSnap.exists()) {
            throw new Error(`El producto "${item.name}" ya no está disponible.`);
          }
          
          const currentStock = Number(productSnap.data().stock) || 0;
          if (currentStock < item.quantity) {
            throw new Error(`Stock insuficiente para "${item.name}". Solo quedan ${currentStock} unidades.`);
          }

          productsToUpdate.push({ ref: productRef, newStock: currentStock - item.quantity });
        }

        for (const productToUpdate of productsToUpdate) {
          transaction.update(productToUpdate.ref, { stock: productToUpdate.newStock });
        }

        const itemsDescription = cartItems.map((item: any) => `${item.quantity}x ${item.name}`).join(", ");
        const todayDateStr = new Date().toISOString().split("T")[0];

        const orderData = {
          client: name.trim(),
          phone: cleanPhone,
          address: deliveryType === 'delivery' ? `${address} ${reference ? `(Ref: ${reference})` : ''}`.trim() : 'Recojo en tienda',
          type: deliveryType === 'delivery' ? 'DELIVERY' : 'RECOJO',
          paymentMethod: paymentMethod,
          cashAmount: paymentMethod === 'Efectivo' ? cashAmount : 'N/A',
          items: itemsDescription,
          total: totalAmount,
          status: "PENDIENTE",
          date: todayDateStr,
          createdAt: new Date().toISOString()
        };

        transaction.set(orderRef, orderData);
      });

      onSuccess();
      setOrderCompleted({
        client: name.trim(),
        total: totalAmount,
        phone: cleanPhone,
        type: deliveryType
      });
    } catch (error: any) {
      setErrorMsg(error.message || "Hubo un error al confirmar tu pedido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-[2rem] w-full max-w-md p-6 sm:p-8 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-slate-900">
        
        {!orderCompleted && (
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center font-black transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        )}

        {orderCompleted ? (
          /* ✨ PANTALLA DE ÉXITO ELEGANTE ✨ */
          <div className="text-center space-y-5 py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner border-4 border-white">
              ✓
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                ¡Pedido Confirmado! 🎉
              </span>
              <h3 className="text-2xl font-black text-slate-900 pt-2">
                Gracias, {orderCompleted.client}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tu orden está registrada y en cola de atención. Ya puedes rastrearla en vivo.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Modalidad:</span>
                <span className="font-bold text-slate-800">{orderCompleted.type === 'delivery' ? '🛵 Delivery' : '🏪 Recojo en Tienda'}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total pagado:</span>
                <span className="font-black text-red-600">S/ {orderCompleted.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Teléfono:</span>
                <span className="font-bold text-slate-800">{orderCompleted.phone}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/seguimiento"
                onClick={onClose}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl block text-center text-xs uppercase tracking-wider transition shadow-lg"
              >
                Rastrear Pedido en Vivo 🛵
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-xs transition"
              >
                Volver a la tienda
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE CHECKOUT MODERNO */
          <>
            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">
                Pago en Línea Seguro 💳
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">Finalizar Compra</h2>
              <p className="text-xs text-slate-500">Completa tus datos para despachar tu pedido.</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold animate-in fade-in">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleConfirmOrder} className="space-y-4 text-sm">
              
              <div className="space-y-2.5">
                <input 
                  required 
                  type="text" 
                  placeholder="Tu Nombre y Apellido" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  autoComplete="name"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-bold outline-none focus:border-red-600 focus:bg-white transition" 
                />
                <input 
                  required 
                  type="tel" 
                  maxLength={9}
                  placeholder="Número de WhatsApp (9 dígitos)" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  autoComplete="tel"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-bold outline-none focus:border-red-600 focus:bg-white transition" 
                />
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setDeliveryType('delivery')} 
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition cursor-pointer ${deliveryType === 'delivery' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  🛵 Delivery
                </button>
                <button 
                  type="button" 
                  onClick={() => setDeliveryType('pickup')} 
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition cursor-pointer ${deliveryType === 'pickup' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  🏪 Recojo Tienda
                </button>
              </div>

              {deliveryType === 'delivery' && (
                <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex gap-2">
                    <input 
                      required 
                      type="text" 
                      placeholder="Dirección exacta de entrega" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      autoComplete="street-address"
                      className="flex-1 bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs font-bold outline-none focus:border-red-600 transition" 
                    />
                    <button 
                      type="button" 
                      onClick={getLocation} 
                      disabled={locLoading} 
                      className="px-3 bg-white hover:bg-slate-100 rounded-xl text-base transition border border-slate-200 cursor-pointer disabled:opacity-50" 
                      title="Usar GPS"
                    >
                      {locLoading ? "⏳" : "📍"}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Referencia (piso, depto, fachada...)" 
                    value={reference} 
                    onChange={(e) => setReference(e.target.value)} 
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs font-bold outline-none focus:border-red-600 transition" 
                  />
                </div>
              )}

              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Método de Pago</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod("Yape")} 
                    className={`py-2.5 rounded-xl font-black text-xs border transition cursor-pointer ${paymentMethod === "Yape" ? "bg-[#742284] border-[#742284] text-white shadow-md shadow-purple-500/20" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    Yape 🟣
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod("Plin")} 
                    className={`py-2.5 rounded-xl font-black text-xs border transition cursor-pointer ${paymentMethod === "Plin" ? "bg-[#00E0C6] border-[#00E0C6] text-slate-950 shadow-md shadow-teal-500/20" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    Plin 🔵
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod("Efectivo")} 
                    className={`py-2.5 rounded-xl font-black text-xs border transition cursor-pointer ${paymentMethod === "Efectivo" ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    Efectivo 💵
                  </button>
                </div>
                
                {paymentMethod === "Efectivo" && (
                  <input 
                    required 
                    type="number" 
                    step="0.5" 
                    placeholder="¿Con cuánto vas a pagar? (Para el vuelto)" 
                    value={cashAmount} 
                    onChange={(e) => setCashAmount(e.target.value)} 
                    className="w-full mt-2 bg-white border border-emerald-200 p-2.5 rounded-xl text-emerald-700 text-xs font-bold outline-none focus:border-emerald-500 transition" 
                  />
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total a pagar:</span>
                <span className="text-xl font-black text-red-600">S/ {totalAmount.toFixed(2)}</span>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-black text-white shadow-[0_8px_25px_rgba(220,38,38,0.35)] transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
              >
                {loading ? "Verificando stock..." : "Confirmar y Pedir Ahora 🚀"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}