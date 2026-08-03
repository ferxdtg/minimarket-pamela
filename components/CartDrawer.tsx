"use client";

import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";


export default function CartDrawer() {


  const {
    cart,
    removeFromCart,
    updateQuantity
  } = useCart();


  const {
    cartOpen,
    closeCart
  } = useCartUI();




  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );



  if (!cartOpen) return null;




  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        justify-end
      "
    >


      {/* Fondo oscuro */}
      <div
        onClick={closeCart}
        className="
          absolute
          inset-0
          bg-black/40
        "
      />




      {/* Panel lateral */}
      <div
        className="
          relative
          w-full
          max-w-md
          h-full
          bg-white
          shadow-2xl
          p-6
          overflow-y-auto
        "
      >


        <div className="
          flex
          justify-between
          items-center
          mb-6
        ">


          <h2 className="
            text-2xl
            font-bold
            text-black
          ">
            🛒 Mi carrito
          </h2>



          <button
            onClick={closeCart}
            className="
              text-red-600
              text-2xl
              font-bold
            "
          >
            ✕
          </button>


        </div>





        {
          cart.length === 0 ? (

            <p className="
              text-black
              font-bold
            ">
              Tu carrito está vacío
            </p>

          ) : (


            cart.map(item => (

              <div
                key={item.id}
                className="
                  border
                  rounded-xl
                  p-4
                  mb-4
                  bg-orange-50
                "
              >


                <h3 className="
                  text-black
                  font-bold
                  text-lg
                ">
                  {item.name}
                </h3>


                <p className="
                  text-black
                  font-bold
                ">
                  S/ {item.price.toFixed(2)}
                </p>




                <div className="
                  flex
                  justify-between
                  items-center
                  mt-4
                ">


                  <div className="
                    flex
                    items-center
                    gap-3
                  ">


                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Math.max(
                            1,
                            item.quantity - 1
                          )
                        )
                      }
                      className="
                        w-9
                        h-9
                        rounded-full
                        bg-red-600
                        text-white
                        font-bold
                        text-xl
                      "
                    >
                      -
                    </button>




                    <span className="
                      text-black
                      font-bold
                    ">
                      {item.quantity}
                    </span>





                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                      className="
                        w-9
                        h-9
                        rounded-full
                        bg-red-600
                        text-white
                        font-bold
                        text-xl
                      "
                    >
                      +
                    </button>


                  </div>





                  <button
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                    className="
                      text-red-600
                      font-bold
                    "
                  >
                    Eliminar
                  </button>



                </div>


              </div>


            ))


          )
        }





        <div className="
          border-t
          pt-5
          mt-6
        ">


          <div className="
            text-xl
            font-bold
            text-black
          ">

            Total:

            <span className="
              text-red-600
            ">
              {" "}S/ {total.toFixed(2)}
            </span>


          </div>




          <button
            className="
              mt-5
              w-full
              bg-green-600
              text-white
              py-3
              rounded-xl
              font-bold
              hover:bg-green-700
            "
          >
            💳 Proceder al pago
          </button>


        </div>



      </div>


    </div>

  );

}