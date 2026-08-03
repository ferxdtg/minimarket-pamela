"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";


type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};


type CartContextType = {
    cart: Product[];
    addToCart: (product: Product) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
  };


const CartContext = createContext<CartContextType | undefined>(
  undefined
);



export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {


  const [cart, setCart] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);



  // Cargar carrito al iniciar
  useEffect(() => {

    const savedCart = localStorage.getItem("cart");


    if (savedCart) {

      setCart(JSON.parse(savedCart));

    }


    setLoaded(true);

  }, []);




  // Guardar carrito cuando cambie
  useEffect(() => {


    if (!loaded) return;


    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );


  }, [cart, loaded]);






  function addToCart(product: Product) {


    setCart((prev) => {


      const existingProduct = prev.find(
        item => item.id === product.id
      );



      if (existingProduct) {


        return prev.map(item =>

          item.id === product.id

            ? {
                ...item,
                quantity:
                  item.quantity + product.quantity
              }

            : item

        );


      }



      return [
        ...prev,
        product
      ];


    });


  }






  function removeFromCart(id:number) {


    setCart((prev) =>
      prev.filter(
        item => item.id !== id
      )
    );


  }






  function clearCart() {

    setCart([]);

  }



  function updateQuantity(id:number, quantity:number){

    setCart(prev =>
  
      prev.map(item =>
  
        item.id === id
          ? {
              ...item,
              quantity
            }
          : item
  
      )
  
    );
  
  }



  return (

    <CartContext.Provider
 value={{
   cart,
   addToCart,
   removeFromCart,
   updateQuantity,
   clearCart
 }}
>

      {children}

    </CartContext.Provider>

  );

}






export function useCart() {


  const context = useContext(CartContext);



  if (!context) {

    throw new Error(
      "useCart debe estar dentro de CartProvider"
    );

  }



  return context;


}