"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";
import CheckoutModal from "./CheckoutModal";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, addDoc } from "firebase/firestore";

export default function CartDrawer() {
  const { cart, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, total: cartTotal } = useCart();
  const { cartOpen, closeCart } = useCartUI();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

  // ESTADOS PARA LA ANIMACIÓN Y EL FORMULARIO
  const [showForm, setShowForm] = useState(false);
  const [isAnimatingBtn, setIsAnimatingBtn] = useState(false);

  // ESTADOS DE CLIENTE Y COINS
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [orderType, setOrderType] = useState<"DELIVERY" | "RECOJO">("DELIVERY");
  const [loading, setLoading] = useState(false);
  const [clientPoints, setClientPoints] = useState(0);
  const [useCoins, setUseCoins] = useState(false);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // CÁLCULOS
  const deliveryFee = orderType === "DELIVERY" ? 5.00 : 0.00;
  const discountFromCoins = useCoins ? Math.min(cartTotal + deliveryFee, clientPoints / 100) : 0;
  const finalTotal = Math.max(0, cartTotal + deliveryFee - discountFromCoins);
  const coinsEarned = Math.floor(finalTotal * 10);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const cartIds = cart.map(i => String(i.id));
        const filtered = list.filter((p: any) => !cartIds.includes(String(p.id)) && Number(p.stock) > 0);
        setSuggestedProducts(filtered.slice(0, 2));
      } catch (e) {
        console.error(e);
      }
    }
    if (cartOpen) {
      fetchSuggestions();
      setShowForm(false); 
      setIsAnimatingBtn(false);
    }
  }, [cartOpen, cart]);

  const handleContinueShopping = () => {
    closeCart();
    const productsSection = document.getElementById("productos-section") || document.getElementById("catalogo");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 500, behavior: "smooth" });
    }
  };

  const handlePhoneBlur = async () => {
    if (!clientPhone || clientPhone.length < 6) return;
    try {
      const docRef = doc(db, "customers", clientPhone.trim());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setClientPoints(Number(docSnap.data().points || 0));
      } else {
        setClientPoints(0);
      }
    } catch (error) {
      console.error("Error buscando cliente:", error);
    }
  };

  // 📍 FUNCIÓN PARA OBTENER GPS AUTOMÁTICO
  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      setClientAddress("📍 Buscando ubicación...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Esto guardará un link exacto de Google Maps en el campo de dirección
          setClientAddress(`📍 https://maps.google.com/?q=${latitude},${longitude}`);
        },
        (error) => {
          setClientAddress("");
          alert("No pudimos acceder a tu GPS. Por favor, escribe tu dirección manualmente.");
        }
      );
    } else {
      alert("Tu navegador no soporta ubicación.");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const itemsSummary = cart.map(i => `${i.quantity}x ${i.name}`).join(", ");
      const todayStr = new Date().toISOString().split("T")[0];

      // A. Descontar Stock
      for (const item of cart) {
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

      // B. Actualizar Billetera de Pamela Coins
      const customerRef = doc(db, "customers", clientPhone.trim());
      const customerSnap = await getDoc(customerRef);
      let finalPoints = coinsEarned;

      if (customerSnap.exists()) {
        const existingPoints = Number(customerSnap.data().points || 0);
        const spentPoints = useCoins ? Math.floor(discountFromCoins * 100) : 0;
        finalPoints = Math.max(0, existingPoints - spentPoints) + coinsEarned;
      }

      await setDoc(customerRef, {
        phone: clientPhone.trim(),
        name: clientName,
        address: clientAddress,
        points: finalPoints,
        lastOrderDate: todayStr
      }, { merge: true });

      // C. Crear la Orden
      await addDoc(collection(db, "orders"), {
        client: clientName,
        phone: clientPhone,
        address: clientAddress,
        type: orderType,
        items: itemsSummary,
        subtotal: cartTotal,
        discount: discountFromCoins,
        total: finalTotal,
        status: "PENDIENTE",
        date: todayStr,
        createdAt: new Date().toISOString()
      });

      // D. Enviar a WhatsApp estructurado
      const adminWhatsApp = "51950323959"; 
      const message = encodeURIComponent(
        `*🛒 ¡NUEVO PEDIDO - MINIMARKET PAMELA!*\n----------------------------------\n👤 *Cliente:* ${clientName}\n📱 *Teléfono:* ${clientPhone}\n🏠 *Dirección:* ${orderType === "DELIVERY" ? clientAddress : "🏪 Recojo en Tienda"}\n🛵 *Tipo:* ${orderType}\n\n📦 *PRODUCTOS:*\n${cart.map((i) => `- ${i.quantity}x ${i.name} (S/ ${(i.price * i.quantity).toFixed(2)})`).join("\n")}\n\n----------------------------------\n💳 *Subtotal:* S/ ${cartTotal.toFixed(2)}\n${deliveryFee > 0 ? `🛵 *Delivery:* S/ ${deliveryFee.toFixed(2)}\n` : ""}${useCoins ? `🪙 *Descuento Pamela Coins:* -S/ ${discountFromCoins.toFixed(2)}\n` : ""}💰 *TOTAL A PAGAR:* *S/ ${finalTotal.toFixed(2)}*\n----------------------------------\n✨ *Puntos ganados hoy:* +${coinsEarned} Pamela Coins\n🪙 *Tu saldo actual:* ${finalPoints} Coins`
      );

      cart.forEach(item => removeFromCart(item.id));
      closeCart();
      window.open(`https://wa.me/${adminWhatsApp}?text=${message}`, "_blank");
    } catch (error: any) {
      alert(`Error al procesar el pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const triggerCheckoutAnimation = () => {
    setIsAnimatingBtn(true);
    setTimeout(() => {
      setIsAnimatingBtn(false);
      setShowForm(true);
    }, 600);
  };

  return (
    <div className={`fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity duration-500 ${cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      
      <div className={`w-full max-w-md h-[100dvh] bg-white text-slate-900 shadow-[-10px_0_40px_rgba(0,0,0,0.2)] p-5 sm:p-6 flex flex-col rounded-l-[2rem] border-l border-slate-200 transform transition-transform duration-500 ease-[cubic-bezier(0.3,0.9,0.4,1)] ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* ENCABEZADO VIBRANTE */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Tu Carrito</h2>
              <p className="text-xs text-red-600 font-bold mt-1 uppercase tracking-widest">{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} listos</p>
            </div>
          </div>
          <button onClick={closeCart} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* LISTA DE PRODUCTOS */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-800 font-black text-xl">Tu carrito está vacío</p>
              <p className="text-slate-500 text-sm mt-1">Aún no has agregado productos a tu orden.</p>
            </div>
            <button onClick={handleContinueShopping} className="px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-sm transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer shadow-[0_4px_15px_rgba(220,38,38,0.4)] mt-4">
              Ver el Catálogo
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pt-4 pr-1 custom-scrollbar min-h-0">
            {cart.map(item => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col gap-3 shadow-sm hover:border-red-100 transition-colors">
                <div className="flex gap-3 items-start">
                  <div className="relative w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{item.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-slate-500 text-xs font-medium">S/ {item.price.toFixed(2)} c/u</span>
                      <span className="text-red-600 font-black text-base">S/ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-1 border border-slate-100">
                  <div className="flex items-center gap-1">
                    <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-600 font-black flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm">-</button>
                    <span className="text-slate-900 font-black w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)} className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 text-red-600 font-black flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer px-3 py-1">Quitar</button>
                </div>
              </div>
            ))}

            {/* SUGERENCIAS */}
            {suggestedProducts.length > 0 && !showForm && (
              <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">¿Te falta algo para completar tu pedido? 🔥</p>
                <div className="space-y-2">
                  {suggestedProducts.map(sug => (
                    <div key={sug.id} className="flex items-center justify-between bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-10 h-10 bg-white rounded-lg overflow-hidden shrink-0 border border-amber-200">
                          <Image src={sug.image || "/placeholder.jpg"} alt={sug.name} fill className="object-contain p-1" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{sug.name}</p>
                          <p className="text-[11px] text-red-600 font-black">S/ {Number(sug.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <button onClick={() => addToCart({ id: sug.id, name: sug.name, price: Number(sug.price), image: sug.image, quantity: 1 })} className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3 py-2 rounded-lg transition shadow-sm active:scale-95 cursor-pointer shrink-0">+ Agregar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PIE DE PAGO VIBRANTE Y DINÁMICO */}
        {cart.length > 0 && (
          <div className={`mt-2 pt-4 shrink-0 bg-white border-t border-slate-100 space-y-4 transition-all duration-300`}>
            
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center shadow-inner">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total a Pagar</span>
              <div className="flex items-start text-red-600 font-black">
                <span className="text-lg mt-0.5 mr-1">S/</span>
                <span className="text-3xl tracking-tighter leading-none">{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* BANNER VISUAL DE PAMELA COINS */}
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-yellow-500/15 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-sm animate-bounce shrink-0 shadow-inner">🪙</div>
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-wide">¡Ganas Pamela Coins!</p>
                  <p className="text-[9px] text-slate-600 font-medium leading-tight">Acumula puntos para descuentos</p>
                </div>
              </div>
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-1 rounded-lg shadow-sm">+{coinsEarned} Coins</span>
            </div>

            {/* SECCIÓN DINÁMICA: Botón Animado VS Formulario */}
            {!showForm ? (
              <div className="pt-2 flex flex-col gap-2">
                {/* BOTÓN CON ANIMACIÓN DE LUZ Y DESLIZAMIENTO */}
                <button
                  type="button"
                  onClick={triggerCheckoutAnimation}
                  className="relative overflow-hidden w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg cursor-pointer text-xs active:scale-95 flex items-center justify-center group"
                >
                  <div className={`absolute top-0 left-0 h-full w-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[30deg] transition-all duration-500 ease-in-out ${isAnimatingBtn ? 'translate-x-[100%]' : '-translate-x-[150%]'}`} />
                  <div className={`flex items-center gap-2 transition-transform duration-300 ease-in-out ${isAnimatingBtn ? 'translate-x-4 scale-95 opacity-80' : 'translate-x-0'}`}>
                    Confirmar tu pedido por WhatsApp <span className="text-lg">📱</span>
                  </div>
                </button>
                
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button type="button" onClick={() => setShowCheckout(true)} className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition cursor-pointer text-[10px] active:scale-95 text-center shadow-md">
                    Pagar en Web 💳
                  </button>
                  <button type="button" onClick={handleContinueShopping} className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition cursor-pointer border border-red-100 text-[10px] active:scale-95 text-center">
                    + Agregar más
                  </button>
                </div>
              </div>
            ) : (
              /* FORMULARIO DESPLEGABLE CON LABELS CLAROS */
              <form onSubmit={handleCheckout} className="space-y-3 animate-in slide-in-from-bottom-6 fade-in duration-300 pb-2">
                
                {/* TABS ELEGANTES DE DELIVERY / RECOJO */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setOrderType("DELIVERY")} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm cursor-pointer ${orderType === "DELIVERY" ? "bg-white text-red-600" : "text-slate-500 hover:text-slate-700 shadow-none"}`}>🛵 Delivery</button>
                  <button type="button" onClick={() => setOrderType("RECOJO")} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm cursor-pointer ${orderType === "RECOJO" ? "bg-white text-red-600" : "text-slate-500 hover:text-slate-700 shadow-none"}`}>🏪 Recojo Tienda</button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-1">Tu Nombre</label>
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej. María" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-red-600 transition shadow-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-1">Celular / WhatsApp</label>
                    <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} onBlur={handlePhoneBlur} placeholder="950 000 000" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-red-600 transition shadow-sm" required />
                  </div>
                </div>

                {clientPoints > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 space-y-1.5 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-black text-amber-800">🪙 Saldo: {clientPoints} Coins</span>
                      <span className="font-black text-emerald-600">Dto. S/ {(clientPoints / 100).toFixed(2)}</span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer border-t border-amber-200/60 pt-1">
                      <input type="checkbox" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer" />
                      <span className="text-[10px] font-bold text-amber-900">Canjear monedas en esta orden</span>
                    </label>
                  </div>
                )}

                {/* DIRECCIÓN CON BOTÓN GPS */}
                {orderType === "DELIVERY" && (
                  <div className="space-y-1 animate-in fade-in duration-300">
                    <label className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-wider ml-1">
                      <span>Dirección de Entrega</span>
                      <button type="button" onClick={handleGetLocation} className="text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded cursor-pointer transition-colors shadow-sm">
                        📍 <span>Usar GPS</span>
                      </button>
                    </label>
                    <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Ej. Av. Los Pinos 204, SMP..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-red-600 transition shadow-sm" required />
                  </div>
                )}

                {/* Resumen Final Detallado */}
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1 text-[10px]">
                  <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span>S/ {cartTotal.toFixed(2)}</span></div>
                  {orderType === "DELIVERY" && <div className="flex justify-between text-slate-600"><span>Delivery:</span><span>S/ {deliveryFee.toFixed(2)}</span></div>}
                  {useCoins && <div className="flex justify-between text-amber-600 font-bold"><span>Descuento Coins:</span><span>-S/ {discountFromCoins.toFixed(2)}</span></div>}
                  <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200 text-xs mt-1"><span>TOTAL A PAGAR:</span><span className="text-red-600">S/ {finalTotal.toFixed(2)}</span></div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-lg cursor-pointer text-xs active:scale-95 flex items-center justify-center gap-2">
                    {loading ? "Procesando..." : "Enviar Pedido Ahora 🚀"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="w-full text-center mt-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer">
                    ← Cancelar y volver
                  </button>
                </div>
              </form>
            )}

            {showCheckout && (
              <CheckoutModal cartItems={cart} onSuccess={() => { cart.forEach(item => removeFromCart(item.id)); }} onClose={() => { setShowCheckout(false); closeCart(); }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}