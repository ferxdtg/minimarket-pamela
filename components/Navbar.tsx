export default function Navbar() {
    return (
      <nav className="bg-blue-700 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          🛒 Minimarket Pamela
        </h1>
  
        <ul className="flex gap-6">
          <li>Inicio</li>
          <li>Productos</li>
          <li>Ofertas</li>
          <li>Contacto</li>
        </ul>
      </nav>
    );
  }