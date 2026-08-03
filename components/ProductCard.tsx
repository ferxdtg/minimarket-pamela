"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";


type ProductCardProps = {

  id: number;

  name: string;

  price: string;

};



export default function ProductCard({

  id,

  name,

  price

}: ProductCardProps) {



  const [quantity, setQuantity] = useState(0);



  const {
    addToCart
  } = useCart();



  const {
    showNotification
  } = useCartUI();





  function addProduct(){


    if(quantity === 0){

      showNotification(
        "Selecciona una cantidad"
      );

      return;

    }



    addToCart({

      id,

      name,

      price: Number(price),

      quantity

    });





    // Mostrar popup

    showNotification(
      `${name} agregado al carrito`
    );





    // Reiniciar cantidad

    setQuantity(0);


  }






  return (

    <div
      className="
        rounded-xl
        border
        p-4
        shadow
        hover:shadow-xl
        transition
        bg-white
      "
    >



      <div
        className="
          h-48
          bg-gray-200
          rounded-lg
          flex
          items-center
          justify-center
        "
      >

        <span className="text-gray-500">
          Imagen producto
        </span>


      </div>






      <h3
        className="
          mt-4
          text-xl
          font-bold
          text-black
        "
      >

        {name}

      </h3>






      <p
        className="
          mt-2
          text-red-600
          font-bold
        "
      >

        S/ {price}

      </p>






      <div
        className="
          flex
          justify-center
          items-center
          gap-5
          mt-5
        "
      >



        <button

          type="button"

          onClick={() =>
            setQuantity(
              prev => Math.max(0, prev - 1)
            )
          }

          className="
            w-10
            h-10
            rounded-full
            bg-red-600
            text-white
            text-2xl
            font-bold
            flex
            items-center
            justify-center
          "
        >

          -

        </button>






        <span
          className="
            text-xl
            font-bold
            text-black
            w-8
            text-center
          "
        >

          {quantity}

        </span>






        <button

          type="button"

          onClick={() =>
            setQuantity(
              prev => prev + 1
            )
          }

          className="
            w-10
            h-10
            rounded-full
            bg-red-600
            text-white
            text-2xl
            font-bold
            flex
            items-center
            justify-center
          "
        >

          +

        </button>



      </div>







      <button

        type="button"

        onClick={addProduct}

        disabled={quantity === 0}

        className={`
          mt-5
          w-full
          py-3
          rounded-lg
          font-bold

          ${
            quantity === 0

            ?

            "bg-gray-300 text-gray-600 cursor-not-allowed"

            :

            "bg-red-600 text-white hover:bg-red-700"

          }

        `}
      >


        {
          quantity === 0

          ?

          "Selecciona cantidad"

          :

          "Agregar al carrito 🛒"

        }


      </button>




    </div>

  );


}