"use client";

import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";
import CheckoutModal from "./CheckoutModal";
import Image from "next/image";


export default function CartDrawer(){


  const {

    cart,

    increaseQuantity,

    decreaseQuantity,

    removeFromCart,

    total

  } = useCart();



  const {

    cartOpen,

    closeCart

  } = useCartUI();





  if(!cartOpen){

    return null;

  }





  return (

    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/40
        flex
        justify-end
      "
    >



      <div
        className="
          w-full
          max-w-md
          h-full
          bg-orange-50
          shadow-2xl
          p-6
          flex
          flex-col
        "
      >





        <div
          className="
            flex
            justify-between
            items-center
            mb-6
          "
        >


          <h2
            className="
              text-2xl
              font-bold
              text-black
            "
          >

            🛒 Mi carrito

          </h2>




          <button

            onClick={closeCart}

            className="
              text-black
              text-3xl
              font-bold
            "
          >

            ×

          </button>


        </div>









        {
          cart.length === 0

          ?

          (

            <div

              className="
                flex-1
                flex
                items-center
                justify-center
                text-black
                font-bold
              "

            >

              Tu carrito está vacío

            </div>

          )


          :


          (

            <div
              className="
                flex-1
                overflow-y-auto
                space-y-4
              "
            >



              {

                cart.map(item=>(


                  <div

                    key={item.id}

                    className="
                      bg-white
                      rounded-xl
                      shadow
                      p-4
                    "

                  >




<div className="flex gap-4">

  <div
    className="
      relative
      w-20
      h-20
      bg-gray-100
      rounded-lg
      overflow-hidden
      flex-shrink-0
    "
  >
    <Image
      src={item.image}
      alt={item.name}
      fill
      className="object-contain p-2"
    />
  </div>

  <div className="flex-1">

    <h3
      className="
        text-lg
        font-bold
        text-black
      "
    >
      {item.name}
    </h3>

    

  </div>

</div>







                    <p

                      className="
                        text-red-600
                        font-bold
                        mt-1
                      "

                    >

                      S/ {(item.price * item.quantity).toFixed(2)}

                    </p>









                    <div

                      className="
                        flex
                        items-center
                        justify-between
                        mt-4
                      "

                    >




                      <div

                        className="
                          flex
                          items-center
                          gap-3
                        "

                      >



                        <button

                          onClick={()=>
                            decreaseQuantity(item.id)
                          }

                          className="
                            w-8
                            h-8
                            rounded-full
                            bg-red-600
                            text-white
                            font-bold
                            text-lg
                            flex
                            items-center
                            justify-center
                          "

                        >

                          -

                        </button>







                        <span

                          className="
                            text-black
                            font-bold
                            w-6
                            text-center
                          "

                        >

                          {item.quantity}

                        </span>







                        <button

                          onClick={()=>
                            increaseQuantity(item.id)
                          }

                          className="
                            w-8
                            h-8
                            rounded-full
                            bg-red-600
                            text-white
                            font-bold
                            text-lg
                            flex
                            items-center
                            justify-center
                          "

                        >

                          +

                        </button>




                      </div>








                      <button

                        onClick={()=>
                          removeFromCart(item.id)
                        }

                        className="
                          text-red-600
                          font-bold
                          text-sm
                        "

                      >

                        🗑 Eliminar

                      </button>




                    </div>





                  </div>


                ))

              }




            </div>


          )

        }









        {

          cart.length > 0 &&

          (

            <div

              className="
                mt-6
                border-t
                pt-5
              "

            >





              <div

                className="
                  flex
                  justify-between
                  mb-5
                "

              >



                <span

                  className="
                    text-xl
                    font-bold
                    text-black
                  "

                >

                  Total:

                </span>





                <span

                  className="
                    text-xl
                    font-bold
                    text-red-600
                  "

                >

                  S/ {total.toFixed(2)}

                </span>



              </div>








              <button

                onClick={closeCart}

                className="
                  w-full
                  py-3
                  rounded-xl
                  bg-gray-800
                  text-white
                  font-bold
                  mb-3
                "

              >

                ← Seguir comprando

              </button>







              <CheckoutModal />





            </div>


          )

        }



      </div>



    </div>


  );


}