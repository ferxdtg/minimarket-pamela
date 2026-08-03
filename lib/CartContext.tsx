
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";


export type CartItem = {

  id:number;

  name:string;

  price:number;

  quantity:number;

  image: string;

};



type CartContextType = {

  cart:CartItem[];

  addToCart:(item:CartItem)=>void;

  removeFromCart:(id:number)=>void;

  increaseQuantity:(id:number)=>void;

  decreaseQuantity:(id:number)=>void;

  total:number;

  clearCart:()=>void;

};



const CartContext = createContext<CartContextType | undefined>(undefined);



export function CartProvider({
  children
}:{
  children:React.ReactNode;
}) {


  const [cart,setCart] = useState<CartItem[]>([]);



  useEffect(()=>{

    const saved =
      localStorage.getItem("cart");


    if(saved){

      setCart(JSON.parse(saved));

    }


  },[]);




  useEffect(()=>{

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );


  },[cart]);







  function addToCart(item:CartItem){


    setCart(prev=>{


      const exists =
        prev.find(
          p=>p.id===item.id
        );



      if(exists){


        return prev.map(p=>

          p.id===item.id

          ?

          {
            ...p,
            quantity:p.quantity + item.quantity
          }

          :

          p

        );

      }



      return [
        ...prev,
        item
      ];

    });


  }






  function increaseQuantity(id:number){


    setCart(prev=>

      prev.map(item=>

        item.id===id

        ?

        {
          ...item,
          quantity:item.quantity+1
        }

        :

        item

      )

    );


  }







  function decreaseQuantity(id:number){


    setCart(prev=>

      prev
      .map(item=>

        item.id===id

        ?

        {
          ...item,
          quantity:item.quantity-1
        }

        :

        item

      )
      .filter(item=>item.quantity>0)

    );


  }







  function removeFromCart(id:number){


    setCart(prev=>

      prev.filter(
        item=>item.id!==id
      )

    );


  }






  function clearCart(){

    setCart([]);

  }






  const total =

    cart.reduce(

      (sum,item)=>

      sum + item.price * item.quantity,

      0

    );







  return (

    <CartContext.Provider

      value={{

        cart,

        addToCart,

        removeFromCart,

        increaseQuantity,

        decreaseQuantity,

        total,

        clearCart

      }}

    >

      {children}

    </CartContext.Provider>

  );


}






export function useCart(){


 const context =
 useContext(CartContext);



 if(!context){

 throw new Error(
 "useCart debe estar dentro de CartProvider"
 );

 }



 return context;


}