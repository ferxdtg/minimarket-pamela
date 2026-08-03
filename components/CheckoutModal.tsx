"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";


export default function CheckoutModal(){


  const {
    cart,
    total,
    clearCart
  } = useCart();



  const {
    closeCart
  } = useCartUI();




  const [open,setOpen] = useState(false);



  const [name,setName] = useState("");

  const [phone,setPhone] = useState("");

  const [address,setAddress] = useState("");

  const [payment,setPayment] = useState("Yape");



  const [location,setLocation] = useState("");

  const [locationStatus,setLocationStatus] = useState("");







  function getLocation(){



    if(!navigator.geolocation){


      setLocationStatus(
        "Tu navegador no soporta ubicación"
      );


      return;

    }





    setLocationStatus(
      "Obteniendo ubicación..."
    );






    navigator.geolocation.getCurrentPosition(


      (position)=>{


        const lat =
          position.coords.latitude;


        const lng =
          position.coords.longitude;




        const mapsLink =
        `https://maps.google.com/?q=${lat},${lng}`;



        setLocation(
          mapsLink
        );



        setLocationStatus(
          "📍 Ubicación obtenida correctamente"
        );



      },



      ()=>{


        setLocationStatus(
          "No se pudo obtener ubicación. Activa permisos."
        );


      },



      {
        enableHighAccuracy:true,

        timeout:10000,

        maximumAge:0

      }


    );


  }









  function confirmOrder(){



    const products =

      cart.map(item=>

        `${item.name} x${item.quantity}`

      )
      .join("\n");






    const message =

`Hola Minimarket Pamela 👋


Nuevo pedido:


Cliente:
${name}


Teléfono:
${phone}


Dirección:
${address}



Ubicación GPS:

${location || "No proporcionada"}



Productos:

${products}



Total:

S/ ${total.toFixed(2)}



Método de pago:

${payment}


Gracias.`;


    


    const whatsapp =

    `https://wa.me/?text=${encodeURIComponent(message)}`;



    window.open(
      whatsapp,
      "_blank"
    );



    clearCart();

    closeCart();

    setOpen(false);



  }








  if(cart.length===0){

    return null;

  }









  return (

    <>


      <button

        onClick={()=>
          setOpen(true)
        }


        className="
          w-full
          py-4
          rounded-xl
          bg-green-600
          text-white
          font-bold
          text-lg
        "

      >

        💳 Pagar S/ {total.toFixed(2)}

      </button>








      {
        open &&

        (

          <div

            className="
              fixed
              inset-0
              z-[60]
              bg-black/50
              flex
              items-center
              justify-center
              p-5
            "

          >



            <div

              className="
                bg-white
                rounded-2xl
                p-6
                w-full
                max-w-md
                max-h-[90vh]
                overflow-y-auto
              "

            >




              <h2

                className="
                  text-2xl
                  font-bold
                  text-black
                  mb-5
                "

              >

                🧾 Datos del pedido

              </h2>







              <input

                placeholder="Nombre completo"

                value={name}

                onChange={
                  e=>setName(e.target.value)
                }


                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                  mb-3
                  text-black
                "

              />







              <input

                placeholder="Teléfono"

                value={phone}

                onChange={
                  e=>setPhone(e.target.value)
                }


                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                  mb-3
                  text-black
                "

              />








              <textarea

                placeholder="Dirección manual"

                value={address}

                onChange={
                  e=>setAddress(e.target.value)
                }


                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                  mb-3
                  text-black
                "

              />








              <button


                type="button"


                onClick={getLocation}


                className="
                  w-full
                  py-3
                  rounded-xl
                  bg-blue-600
                  text-white
                  font-bold
                  mb-2
                "

              >

                📍 Usar mi ubicación actual

              </button>






              {
                locationStatus &&

                (

                  <p

                    className="
                      text-sm
                      font-bold
                      text-black
                      mb-3
                    "

                  >

                    {locationStatus}

                  </p>


                )

              }








              <select

                value={payment}

                onChange={
                  e=>setPayment(e.target.value)
                }


                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                  mb-5
                  text-black
                "

              >

                <option>
                  Yape
                </option>


                <option>
                  Plin
                </option>


                <option>
                  Efectivo
                </option>


              </select>








              <button


                onClick={confirmOrder}


                className="
                  w-full
                  bg-green-600
                  text-white
                  py-3
                  rounded-xl
                  font-bold
                  mb-3
                "

              >

                Confirmar pedido

              </button>







              <button


                onClick={()=>
                  setOpen(false)
                }


                className="
                  w-full
                  bg-gray-300
                  text-black
                  py-3
                  rounded-xl
                  font-bold
                "

              >

                Cancelar

              </button>




            </div>



          </div>


        )

      }



    </>


  );


}