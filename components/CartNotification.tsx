"use client";


type CartNotificationProps = {

  message: string;

};



export default function CartNotification({

  message

}: CartNotificationProps) {



  if (!message) return null;



  return (

    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        pointer-events-none
      "
    >


      <div
        className="
          bg-white
          rounded-2xl
          shadow-2xl
          border
          px-10
          py-8
          text-center
          animate-bounce
        "
      >


        <div
          className="
            text-5xl
            mb-4
          "
        >
          ✅
        </div>



        <h2
          className="
            text-xl
            font-bold
            text-black
          "
        >
          {message}
        </h2>



        <p
          className="
            mt-2
            text-gray-600
            font-medium
          "
        >
          Producto agregado al carrito
        </p>


      </div>


    </div>

  );

}