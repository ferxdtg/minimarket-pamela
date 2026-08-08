'use client';

import React, { useState, useRef, useEffect } from 'react';

const defaultProducts = [
  { id: 101, name: "Arroz Costeño", price: 5.90, stock: 50, category: "abarrotes", isOnSale: false, isFeatured: true, image: "/productos/arrozcosteno.jpg", salesCount: 120 },
  { id: 102, name: "Leche Gloria", price: 4.50, stock: 30, category: "abarrotes", isOnSale: false, isFeatured: true, image: "/productos/lechegloria.jpg", salesCount: 120 },
  { id: 103, name: "Sopa Maruchan", price: 6.90, stock: 25, category: "snacks", isOnSale: false, isFeatured: true, image: "/productos/maruchan.jpg", salesCount: 120 },
  { id: 104, name: "Bizcocho Bimbo", price: 7.50, stock: 20, category: "snacks", isOnSale: false, isFeatured: true, image: "/productos/bizcochobimbo.jpg", salesCount: 120 },
];

export default function AdminPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('abarrotes');
  const [isOnSale, setIsOnSale] = useState(false);
  const [manualFeatured, setManualFeatured] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [adminSearch, setAdminSearch] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('minimarket_products');
    let existingProducts = saved ? JSON.parse(saved) : [];

    // Verificamos si los productos por defecto ya están incluidos
    const hasDefaults = existingProducts.some((p: any) => p.id >= 101 && p.id <= 104);

    if (!hasDefaults) {
      // Si no están, los combinamos al inicio o final de los productos existentes
      existingProducts = [...defaultProducts, ...existingProducts];
      localStorage.setItem('minimarket_products', JSON.stringify(existingProducts));
    }

    setRecentProducts(existingProducts);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setSuccessMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImageSrc(canvas.toDataURL('image/png'));
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const compressImage = (base64Str: string, maxWidth = 300, maxHeight = 300, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let finalImage = imageSrc;
    if (imageSrc && imageSrc.startsWith('data:image')) {
      finalImage = await compressImage(imageSrc);
    }

    const newProduct = {
      id: Date.now(),
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      isOnSale,
      isFeatured: manualFeatured,
      image: finalImage || '',
      salesCount: 0,
    };

    try {
      const existing = JSON.parse(localStorage.getItem('minimarket_products') || '[]');
      const updatedList = [newProduct, ...existing];

      localStorage.setItem('minimarket_products', JSON.stringify(updatedList));
      setRecentProducts(updatedList);
      window.dispatchEvent(new Event('product_added'));

      setIsLoading(false);
      setSuccessMessage('¡Producto guardado y publicado con éxito!');
      setName('');
      setPrice('');
      setStock('');
      setIsOnSale(false);
      setManualFeatured(false);
      setImageSrc(null);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setIsLoading(false);
      alert('El almacenamiento local se ha llenado.');
      console.error(error);
    }
  };

  const handleDeleteProduct = (id: number) => {
    const updatedList = recentProducts.filter((p) => p.id !== id);
    setRecentProducts(updatedList);
    localStorage.setItem('minimarket_products', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('product_added'));
    
    setSuccessMessage('¡Producto eliminado correctamente!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filteredAdminProducts = recentProducts.filter((p) =>
    p.name.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">Panel de Administración</span>
            <h1 className="text-3xl font-black text-white mt-1">Minimarket Pamela</h1>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-2xl text-xs font-bold text-zinc-400">
            🔒 Modo Admin
          </div>
        </header>

        {successMessage && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-sm font-semibold flex items-center gap-3 shadow-xl">
            ✅ {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Agregar Nuevo Producto</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Nombre del Producto</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Aceite Primor 1L"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-600 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Precio (S/)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-600 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Cantidad (Stock)</label>
                  <input
                    required
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-600 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Categoría del Home</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-red-600 outline-none text-sm"
                >
                  <option value="ofertas">Ofertas y Promociones</option>
                  <option value="abarrotes">Abarrotes y Despensa</option>
                  <option value="bebidas">Bebidas y Jugos</option>
                  <option value="snacks">Snacks y Golosinas</option>
                  <option value="limpieza">Limpieza y Hogar</option>
                  <option value="bebes">Bebés</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase text-zinc-400">Fotografía del Producto</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-center text-xs font-bold transition-all border border-zinc-700 flex items-center justify-center gap-2">
                    📂 Biblioteca
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    📷 Cámara
                  </button>
                </div>

                {isCameraActive && (
                  <div className="space-y-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <video ref={videoRef} className="w-full h-40 object-cover rounded-lg bg-black" autoPlay playsInline />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                    >
                      Capturar Foto
                    </button>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                {imageSrc && (
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/60 rounded-xl border border-zinc-700">
                    <img src={imageSrc} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-zinc-700" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">Imagen cargada</p>
                      <button type="button" onClick={() => setImageSrc(null)} className="text-[10px] text-red-400 hover:underline">
                        Eliminar foto
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <label className="flex items-center justify-between p-3.5 bg-zinc-800/50 rounded-xl border border-zinc-700/80 cursor-pointer">
                  <span className="text-xs font-bold text-zinc-300">¿Está en Oferta?</span>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                  />
                </label>

                <label className="p-3.5 bg-amber-950/25 rounded-xl border border-amber-900/60 cursor-pointer flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Agregar a Productos Destacados</span>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    checked={manualFeatured}
                    onChange={(e) => setManualFeatured(e.target.checked)}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black shadow-xl transition-all text-sm tracking-wide mt-4 cursor-pointer"
              >
                {isLoading ? 'Guardando...' : 'Guardar y Publicar en la Web'}
              </button>
            </form>
          </div>

          <div className="md:col-span-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col">
            <h2 className="text-lg font-bold mb-3">Productos Registrados ({recentProducts.length})</h2>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍 Buscar producto registrado..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-xl text-xs text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1">
              {filteredAdminProducts.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-12">No se encontraron productos.</p>
              ) : (
                filteredAdminProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-zinc-800/50 border border-zinc-700/60 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-zinc-700 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs">📦</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {p.isFeatured && <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[8px] font-black uppercase rounded">Destacado</span>}
                          {p.isOnSale && <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase rounded">Oferta</span>}
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                        <p className="text-xs text-red-400 font-extrabold">S/ {Number(p.price).toFixed(2)} <span className="text-zinc-400 font-normal">| Stock: {p.stock}</span></p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      title="Eliminar producto"
                      className="p-2 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer shrink-0"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}