"use client";

import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";
import Link from "next/link";


export default function Navbar() {


  const { cart } = useCart();

  const { openCart } = useCartUI();



  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );



  return (

    <nav className="bg-blue-700 text-white px-8 py-4 shadow-lg">


      <div className="max-w-7xl mx-auto flex justify-between items-center">


        <Link
          href="/"
          className="text-2xl font-bold"
        >
          🛒 Minimarket Pamela
        </Link>




        <ul className="flex gap-6 items-center">


          <li>
            <Link href="/">
              Inicio
            </Link>
          </li>


          <li>
            <Link href="/#productos">
              Productos
            </Link>
          </li>


          <li>
            <Link href="/#ofertas">
              Ofertas
            </Link>
          </li>


          <li>
            <Link href="/#contacto">
              Contacto
            </Link>
          </li>



          <li>

            <button
              onClick={openCart}
              className="
                bg-white
                text-blue-700
                px-4
                py-2
                rounded-lg
                font-bold
                hover:bg-gray-100
              "
            >

              🛒 Carrito ({totalItems})

            </button>


          </li>


        </ul>


      </div>


    </nav>

  );

}