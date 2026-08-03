"use client";

import {
  createContext,
  useContext,
  useState
} from "react";

import CartNotification from "@/components/CartNotification";


type CartUIContextType = {

  cartOpen: boolean;

  openCart: () => void;

  closeCart: () => void;

  notification: string;

  showNotification: (message:string) => void;

};



const CartUIContext = createContext<CartUIContextType | undefined>(
  undefined
);





export function CartUIProvider({
  children,
}: {
  children: React.ReactNode;
}) {


  const [cartOpen, setCartOpen] = useState(false);

  const [notification, setNotification] = useState("");





  function openCart(){

    setCartOpen(true);

  }





  function closeCart(){

    setCartOpen(false);

  }





  function showNotification(message:string){


    setNotification(message);



    setTimeout(()=>{

      setNotification("");

    },2500);


  }





  return (

    <CartUIContext.Provider

      value={{

        cartOpen,

        openCart,

        closeCart,

        notification,

        showNotification

      }}

    >


      {children}



      {/* Popup global */}

      <CartNotification
        message={notification}
      />



    </CartUIContext.Provider>

  );


}







export function useCartUI(){


  const context = useContext(CartUIContext);



  if(!context){

    throw new Error(
      "useCartUI debe estar dentro de CartUIProvider"
    );

  }



  return context;


}