"use client";

import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";
import { useState } from "react";


export default function Navbar(){


  const {
    cart
  } = useCart();



  const {
    openCart
  } = useCartUI();



  const [menu,setMenu] = useState(false);



  const totalItems = cart.reduce(

    (total,item)=>
      total + item.quantity,

    0

  );





  return (

    <header
      className="
        sticky
        top-0
        z-40
        bg-white
        shadow-md
      "
    >


      <nav

        className="
          max-w-7xl
          mx-auto
          px-5
          py-4
          flex
          items-center
          justify-between
        "

      >




        {/* LOGO */}

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <div
            className="
              bg-red-600
              text-white
              w-11
              h-11
              rounded-full
              flex
              items-center
              justify-center
              text-xl
            "
          >

            🛒

          </div>


          <div>


            <h1
              className="
                text-xl
                md:text-2xl
                font-black
                text-gray-900
              "
            >

              Pamela Market

            </h1>


            <p
              className="
                text-xs
                text-gray-500
              "
            >

              Tu compra, más fácil

            </p>


          </div>


        </div>







        {/* BUSCADOR DESKTOP */}


        <div

          className="
            hidden
            md:flex
            flex-1
            max-w-xl
            mx-10
          "

        >

          <div
            className="
              w-full
              bg-gray-100
              rounded-full
              px-5
              py-3
              flex
              items-center
              gap-3
            "
          >

            🔎


            <input

              placeholder="
              ¿Qué estás buscando?
              "

              className="
                bg-transparent
                outline-none
                w-full
                text-gray-700
              "

            />


          </div>


        </div>









        {/* MENU DESKTOP */}

        <div

          className="
            hidden
            md:flex
            items-center
            gap-6
          "

        >


          <button

            className="
              text-gray-700
              font-semibold
              hover:text-red-600
            "

          >

            Ofertas

          </button>





          <button

            onClick={openCart}

            className="
              relative
              bg-red-600
              text-white
              px-5
              py-3
              rounded-full
              font-bold
              hover:scale-105
              transition
            "

          >

            🛒 Carrito


            {
              totalItems > 0 &&

              (

                <span

                  className="
                    absolute
                    -top-2
                    -right-2
                    bg-yellow-400
                    text-black
                    text-xs
                    w-6
                    h-6
                    rounded-full
                    flex
                    items-center
                    justify-center
                    font-bold
                  "

                >

                  {totalItems}

                </span>

              )

            }


          </button>


        </div>









        {/* MOBILE BUTTON */}


        <button

          className="
            md:hidden
            text-3xl
          "

          onClick={()=>
            setMenu(!menu)
          }

        >

          ☰

        </button>



      </nav>








      {/* MOBILE MENU */}


      {
        menu &&

        (

          <div

            className="
              md:hidden
              bg-white
              border-t
              px-5
              py-5
              space-y-4
            "

          >


            <button
              className="
                block
                text-gray-800
                font-bold
              "
            >

              Productos

            </button>


            <button

              className="
                block
                text-gray-800
                font-bold
              "

            >

              Ofertas

            </button>


            <button

              onClick={openCart}

              className="
                block
                text-red-600
                font-bold
              "

            >

              🛒 Mi carrito

            </button>


          </div>


        )

      }




    </header>


  );


}