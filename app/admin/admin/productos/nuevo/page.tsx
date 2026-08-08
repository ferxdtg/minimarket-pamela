export default function NuevoProducto() {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Añadir Nuevo Producto</h2>
          
          <form className="space-y-6">
            {/* FOTO DEL PRODUCTO - Optimizado para celular */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer">
              <label className="cursor-pointer block">
                <span className="block text-gray-600 font-medium mb-2">📸 Toca para tomar foto o subir archivo</span>
                <span className="text-sm text-gray-400">Formatos soportados: JPG, PNG</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" /* ESTO ABRE LA CÁMARA EN EL CELULAR */
                  className="hidden" 
                />
              </label>
            </div>
  
            {/* DETALLES DEL PRODUCTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none" placeholder="Ej: Arroz Costeño 1kg" />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta (S/.)</label>
                <input type="number" step="0.10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none" placeholder="0.00" />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none" placeholder="Cantidades en tienda" />
              </div>
  
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none bg-white">
                  <option>Abarrotes</option>
                  <option>Bebidas</option>
                  <option>Lácteos</option>
                  <option>Limpieza</option>
                </select>
              </div>
            </div>
  
            <button type="button" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition mt-4">
              Guardar Producto
            </button>
          </form>
        </div>
      </div>
    );
  }